import { Handlers, PageProps } from "$fresh/server.ts";
import { State } from "../middleware/auth.ts"; // Authentication middleware
import { storeFile } from "../db/db.ts"; // Database method for storing file metadata
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts"; // For generating unique file IDs
import { encryptFile, generateRandomKey } from "../utils/crypto_utils.ts"; // Encryption utilities
import rateLimitMiddleware from "../middleware/rateLimitMiddleware.ts"; // Rate limiting middleware
import CoppyLinkButton from "../islands/CopyLinkButton.tsx"; // Copy link button component
import Layout from "../components/Layout.tsx";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const ALLOWED_TYPES = [
  "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png", "image/jpeg", "application/zip", "audio/mpeg", "video/mp4"
];

interface UploadData {
  error?: string;
  success?: {
    link: string;
    expiryDate: string;
    maxDownloads: number;
  };
}

export const handler: Handlers<UploadData, State> = {
  GET(_, ctx) {
    if (!ctx.state.user) {
      return ctx.render({});
    }
    return ctx.render({});
  },

  async POST(req, ctx) {
    // Check if user is authenticated
    if (!ctx.state.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Rate limiting check
    if (!rateLimitMiddleware(ctx.state.user.id)) {
      return new Response("Rate limit exceeded. Try again later.", { status: 429 });
    }

    try {
      const form = await req.formData();
      const file = form.get("file") as File;
      let expiryDays = parseInt(form.get("expiryDays")?.toString() || "7");
      let maxDownloads = parseInt(form.get("maxDownloads")?.toString() || "3");
      const encrypt = form.get("encrypt") === "on";

      if (!file) {
        return ctx.render({ error: "No file uploaded" });
      }

      // Restrict expiryDays and maxDownloads
      expiryDays = Math.min(expiryDays, 7);
      maxDownloads = Math.min(maxDownloads, 3);

      // File type and size checks
      if (!ALLOWED_TYPES.includes(file.type)) {
        return ctx.render({ error: "Unsupported file type" });
      }

      if (file.size > MAX_FILE_SIZE) {
        return ctx.render({ error: "File too large (50MB max)" });
      }

      // Generate file ID and paths
      const fileId = nanoid();
      const uploadDir = "./uploads";
      const filePath = `${uploadDir}/${fileId}`;

      // Create uploads directory if it doesn't exist
      try {
        await Deno.mkdir(uploadDir, { recursive: true });
      } catch (e) {
        console.error("Failed to create uploads directory:", e);
      }

      // Read file data
      const fileData = await file.arrayBuffer();
      
      let encryptionKey: Uint8Array | undefined; // Changed to Uint8Array
      let finalData: ArrayBuffer;
      
      // Handle encryption if requested
      if (encrypt) {
        encryptionKey = generateRandomKey(); // Generates a Uint8Array encryption key
        const { encryptedData } = await encryptFile(fileData, encryptionKey); // Use only the encryptedData
        finalData = encryptedData;
      } else {
        finalData = fileData;
      }

      // Write to disk
      await Deno.writeFile(filePath, new Uint8Array(finalData));

      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);

      // Store file metadata in the database
      await storeFile({
        id: fileId,
        userId: ctx.state.user.id,
        originalName: file.name,
        encryptedPath: filePath,
        mimeType: file.type,
        size: file.size,
        expiryDate,
        maxDownloads,
        currentDownloads: 0,
        createdAt: new Date(),
        isEncrypted: encrypt,
        encryptionKey: encryptionKey ? encryptionKey.toString() : undefined, // Store the key as a string if necessary
      });

      // Generate the file access link
      const link = `${new URL(req.url).origin}/share/${fileId}`;

      return ctx.render({
        success: {
          link,
          expiryDate: expiryDate.toLocaleDateString(),
          maxDownloads,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return ctx.render({ error: "Failed to upload file: " + errorMessage });
    }
  },
};

export default function Upload({ data }: PageProps<UploadData>) {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Drag over event triggered"); // Debug log
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Drop event triggered"); // Debug log

    const input = document.getElementById("file") as HTMLInputElement;
    if (e.dataTransfer?.files.length && input) {
      input.files = e.dataTransfer.files;
      console.log("Files dropped:", e.dataTransfer.files); // Debug log

      // Trigger a change event on the input to ensure it updates
      const event = new Event("change", { bubbles: true });
      input.dispatchEvent(event);
    } else {
      console.log("No files detected in drop event"); // Debug log
    }
  };

  return (
    <Layout>
      <div class="p-4 max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4">Upload Secure File</h1>

        {data?.error && (
          <div class="bg-red-100 p-3 mb-4 text-red-700 rounded">{data.error}</div>
        )}

        {data?.success ? (
          <div class="bg-green-100 p-4 rounded mb-4">
            <h2 class="text-xl font-bold text-green-800 mb-2">File Uploaded Successfully!</h2>
            <p class="mb-2">Share this secure link:</p>
            <div class="bg-white p-2 border rounded flex">
              <input
                type="text"
                value={data.success.link}
                readOnly
                class="flex-grow outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <CoppyLinkButton link={data.success.link} />
            </div>
            <p class="mt-4">
              Link expires on: <strong>{data.success.expiryDate}</strong>
              <br />
              Maximum downloads: <strong>{data.success.maxDownloads}</strong>
            </p>
            <div class="mt-4">
              <a href="/dashboard" class="text-blue-500 hover:underline">
                Return to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <form method="POST" encType="multipart/form-data" class="space-y-4">
            <div
              class="border-2 border-dashed border-gray-300 rounded p-4 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label htmlFor="file" class="cursor-pointer">
                <div class="mb-2">
                  <svg
                    class="w-10 h-10 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    ></path>
                  </svg>
                </div>
                <div class="text-gray-700">Click to select a file or drag and drop</div>
                <div class="text-xs text-gray-500 mt-1">Max size: 50MB</div>
              </label>
              <input
                id="file"
                name="file"
                type="file"
                class="hidden"
                required
              />
            </div>

            <div>
              <label class="block mb-1">Expires after (days)</label>
              <input
                type="number"
                name="expiryDays"
                min="1"
                max="7"
                value="7"
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label class="block mb-1">Maximum downloads</label>
              <input
                type="number"
                name="maxDownloads"
                min="1"
                max="3"
                value="3"
                class="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div class="flex items-center">
              <input
                type="checkbox"
                name="encrypt"
                id="encrypt"
                class="h-4 w-4 text-blue-600"
              />
              <label htmlFor="encrypt" class="ml-2">
                Encrypt file (AES-256)
              </label>
            </div>

            <button
              type="submit"
              class="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Upload & Generate Secure Link
            </button>
          </form>
        )}
      </div>
    </Layout>
  );
}

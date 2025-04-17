import { Handlers } from "$fresh/server.ts";
import client from "../../db/db.ts";
import { encryptFile, ENCRYPTION_KEY } from "../../utils/crypto_utils.ts";
import { rateLimitMiddleware } from "../../middleware/rateLimitMiddleware.ts";
import { authMiddleware } from "../../middleware/auth.ts";

const MAX_FILE_SIZE = 50 * 1024 * 1024; 
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "application/zip",
  "audio/mpeg",
  "audio/wav",
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "text/plain",
];


export const handler: Handlers = {
  async POST(req, ctx) {
    const authResponse = await authMiddleware(req, ctx);
    if (authResponse) return authResponse;

    const user = ctx.state.user as { id: string };
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    if (!rateLimitMiddleware(user.id)) {
      return new Response("Rate limit exceeded. Try again later.", { status: 429 });
    }

    try {
      const form = await req.formData();
      const file = form.get("file") as File;
      const maxDownloads = Number(form.get("maxDownloads") || 1);

      if (!file) {
        return new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 });
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({ error: "Unsupported file type" }), {
          status: 415,
          headers: { "Content-Type": "application/json" },
        });
      }

      const fileBuffer = new Uint8Array(await file.arrayBuffer());
      if (fileBuffer.byteLength > MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ error: "File exceeds size limit (50MB)" }), {
          status: 413,
          headers: { "Content-Type": "application/json" },
        });
      }

      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 2); // 2 hour expiry

      const createdAt = new Date();
      const { encryptedData, iv } = await encryptFile(fileBuffer.buffer, ENCRYPTION_KEY);
      const encryptedFilename = `${crypto.randomUUID()}.enc`;

      await Deno.mkdir("./uploads", { recursive: true });
      await Deno.writeFile(`./uploads/${encryptedFilename}`, new Uint8Array(encryptedData));

      await client.queryObject(
        `INSERT INTO files (
          user_id,
          original_name,
          encrypted_filename,
          mime_type,
          size,
          expiry_date,
          created_at,
          max_downloads,
          current_downloads,
          is_encrypted,
          iv,
          encryption_key
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10, $11
        )`,
        [
          user.id,
          file.name,
          encryptedFilename,
          file.type,
          file.size,
          expirationTime,
          createdAt,
          maxDownloads,
          true,
          JSON.stringify(Array.from(iv)),
          ENCRYPTION_KEY, 
        ]
      );

      return new Response(
        JSON.stringify({
          message: "File uploaded successfully",
          encryptedFilename,
        }),
        { status: 201, headers: { "Content-Type": "application/json" } }
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

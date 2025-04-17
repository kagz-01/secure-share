import { h } from "preact";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Layout from "../components/Layout.tsx";
import CoppyLinkButton from "../islands/CopyLinkButton.tsx";
import FileIcon from "../components/FileIcon.tsx";
import QRCodeDisplay from "../components/QRCodeDisplay.tsx";
import PasswordField from "../components/PasswordField.tsx";

interface DownloadProps {
  file?: {
    id: string;
    name: string;
    size: string;
    expiryDate: string;
    remainingDownloads: number;
    isEncrypted: boolean;
  };
  error?: string;
}

async function fetchFileData(downloadUrl: string, token: string, password: string) {
  const headers = new Headers();
  headers.append("Authorization", `Bearer ${token}`);
  
  const params = new URLSearchParams();
  if (password) {
    params.append("password", password); // Adding password if file is encrypted
  }

  const url = `${downloadUrl}?${params.toString()}`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.blob();
}

export default function DownloadPage({ data, request }: { data?: DownloadProps; request?: Request }) {
  const downloading = useSignal(false);
  const progress = useSignal(0);
  const success = useSignal(false);
  const error = useSignal<string | null>(data?.error || null);
  const timeLeft = useSignal(120);
  const password = useSignal("");
  const remaining = useSignal(data?.file?.remainingDownloads || 0);

  const token = localStorage.getItem("auth_token") || ""; // Assuming token is saved in localStorage

  useEffect(() => {
    if (!data?.file) return;

    const timer = setInterval(() => {
      timeLeft.value = timeLeft.value > 0 ? timeLeft.value - 1 : 0;
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const origin = typeof location !== "undefined" ? location.origin : request?.url.split("/").slice(0, 3).join("/") || "";
  const downloadUrl = `${origin}/share/${data?.file?.id}`;

  const handleDownload = async () => {
    if (downloading.value || timeLeft.value <= 0) return;

    downloading.value = true;

    try {
      const fileBlob = await fetchFileData(downloadUrl, token, password.value);

      // Create a link to trigger the download
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(fileBlob);
      downloadLink.download = data?.file?.name || "file";
      downloadLink.click();

      success.value = true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to download file.";
    } finally {
      downloading.value = false;
    }
  };

  return (
    <Layout>
      <div class="max-w-xl mx-auto p-6">
        <h1 class="text-2xl font-bold text-center mb-4">Download Secure File</h1>

        {error.value && (
          <div class="bg-red-100 text-red-800 p-3 mb-4 rounded">
            ⚠️ {error.value}
          </div>
        )}

        {data?.file ? (
          <div class="bg-white dark:bg-gray-800 shadow-md rounded p-6 space-y-4">
            <div class="flex items-center gap-3">
              <FileIcon filename={data.file.name} />
              <div>
                <p class="text-gray-700 dark:text-gray-300 font-medium">{data.file.name}</p>
                <p class="text-sm text-gray-500">{data.file.size}</p>
              </div>
            </div>

            <p class="text-gray-700 dark:text-gray-300">
              <strong>Expires on:</strong> {data.file.expiryDate}
            </p>

            <p class="text-gray-700 dark:text-gray-300">
              <strong>Remaining downloads:</strong> {remaining.value}
            </p>

            <p class="text-gray-700 dark:text-gray-300">
              <strong>Encryption:</strong>{" "}
              {data.file.isEncrypted ? "Enabled (AES-256)" : "Not Encrypted"}
            </p>

            <div class="text-sm text-gray-500">
              {timeLeft.value > 0
                ? `⏳ Link expires in: ${timeLeft.value}s`
                : `❌ This link has expired`}
            </div>

            {data.file.isEncrypted && <PasswordField password={password} />}

            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading.value || timeLeft.value <= 0}
              class={`w-full py-2 px-4 rounded text-white font-semibold ${
                downloading.value || timeLeft.value <= 0
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {downloading.value ? "Downloading..." : "Download File"}
            </button>

            {success.value && (
              <div class="text-green-600 font-semibold text-center">
                ✅ File downloaded successfully!
              </div>
            )}

            <div class="flex items-center gap-2">
              <input
                type="text"
                value={downloadUrl}
                readOnly
                class="flex-grow p-2 border rounded"
              />
              <CoppyLinkButton link={downloadUrl} />
            </div>

            <QRCodeDisplay text={downloadUrl} />

            <div class="text-center mt-4">
              <a href="/dashboard" class="text-blue-500 hover:underline">
                ⬅️ Back to Dashboard
              </a>
            </div>
          </div>
        ) : (
          <p class="text-center text-gray-500">No file data available.</p>
        )}
      </div>
    </Layout>
  );
}

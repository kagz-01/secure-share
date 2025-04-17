// islands/UploadForm.tsx
import { Signal } from "@preact/signals";
import { signal } from "@preact/signals";

interface Props {
  messageSignal: Signal<{ type: "success" | "error"; text: string } | null>;
}

export default function UploadForm({ messageSignal }: Props) {
  const file = signal<File | null>(null);
  const maxDownloads = signal<number>(1);

  const handleUpload = async (e: Event) => {
    e.preventDefault();

    if (!file.value) {
      messageSignal.value = { type: "error", text: "No file selected." };
      return;
    }

    const formData = new FormData();
    formData.append("file", file.value);
    formData.append("maxDownloads", maxDownloads.value.toString());

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        messageSignal.value = {
          type: "success",
          text: `✅ File uploaded successfully! Link: ${result.downloadUrl}`,
        };

      } else {
        messageSignal.value = { type: "error", text: result.error || "❌ Upload failed." };
      }
    } catch {
      messageSignal.value = { type: "error", text: "❌ An error occurred during upload." };
    }

    setTimeout(() => (messageSignal.value = null), 5000);
  };

  return (
    <div class="bg-white p-6 rounded shadow-md mb-6">
      <h2 class="text-xl font-semibold mb-3">📤 Encrypt & Upload File</h2>
      <form onSubmit={handleUpload} class="space-y-4">
        <input
          type="file"
          class="w-full p-2 border border-gray-300 rounded"
          onChange={(e) => (file.value = e.currentTarget.files?.[0] || null)}
          required
        />
        <input
          type="number"
          value={maxDownloads.value}
          min={1}
          class="w-full p-2 border border-gray-300 rounded"
          onChange={(e) => (maxDownloads.value = parseInt(e.currentTarget.value))}
          required
        />
        <button
          type="submit"
          class="w-full p-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
        >
          🔐 Encrypt & Upload
        </button>
      </form>
    </div>
  );
}

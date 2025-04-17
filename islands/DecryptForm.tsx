// islands/DecryptForm.tsx
import { signal, Signal } from "@preact/signals";

interface Props {
  messageSignal: Signal<{ type: "success" | "error"; text: string } | null>;
}

export default function DecryptForm({ messageSignal }: Props) {
  const file = signal<File | null>(null);
  const key = signal("");

  const handleDecrypt = async (e: Event) => {
    e.preventDefault();

    if (!file.value || !key.value) {
      messageSignal.value = { type: "error", text: "File and key are required." };
      return;
    }

    const formData = new FormData();
    formData.append("file", file.value);
    formData.append("key", key.value);

    try {
      const response = await fetch("/api/decrypt", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.value.name.replace(".enc", "");
        document.body.appendChild(a);
        a.click();
        a.remove();
        messageSignal.value = { type: "success", text: "✅ File decrypted and downloaded!" };
      } else {
        const result = await response.json();
        messageSignal.value = { type: "error", text: result.error || "❌ Decryption failed." };
      }
    } catch {
      messageSignal.value = { type: "error", text: "❌ An error occurred during decryption." };
    }

    setTimeout(() => (messageSignal.value = null), 5000);
  };

  return (
    <div class="bg-white p-6 rounded shadow-md">
      <h2 class="text-xl font-semibold mb-3">📥 Decrypt File</h2>
      <form onSubmit={handleDecrypt} class="space-y-4">
        <input
          type="file"
          class="w-full p-2 border border-gray-300 rounded"
          onChange={(e) => (file.value = e.currentTarget.files?.[0] || null)}
          required
        />
        <input
          type="text"
          placeholder="Enter Decryption Key"
          value={key.value}
          class="w-full p-2 border border-gray-300 rounded"
          onInput={(e) => (key.value = e.currentTarget.value)}
          required
        />
        <button
          type="submit"
          class="w-full p-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded"
        >
          🔓 Decrypt & Download
        </button>
      </form>
    </div>
  );
}

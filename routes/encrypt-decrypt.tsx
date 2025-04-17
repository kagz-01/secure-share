// routes/encrypt-decrypt.tsx
import { signal } from "@preact/signals";
import Layout from "../components/Layout.tsx";

import DecryptForm from "../islands/DecryptForm.tsx";

const messageSignal = signal<{ type: "success" | "error"; text: string } | null>(null);

export default function EncryptDecrypt() {
  return (
    <Layout>
      <div class="p-4 max-w-lg mx-auto">
        <h1 class="text-2xl font-bold mb-4 text-center">🔐 File Encryption & Decryption</h1>

        {messageSignal.value && (
          <div
            class={`p-3 mb-4 text-white rounded ${
              messageSignal.value.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {messageSignal.value.text}
          </div>
        )}
        <DecryptForm messageSignal={messageSignal} />
      </div>
    </Layout>
  );
}

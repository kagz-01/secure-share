// utils/crypto_utils.ts

// AES-CBC 256-bit key (32 bytes) - You can replace this with an env variable for more flexibility
export const ENCRYPTION_KEY = new TextEncoder().encode(Deno.env.get("ENCRYPTION_KEY")?.padEnd(32, "0") || "your-32-char-secure-key".padEnd(32, "0"));

// Encrypt a file with AES-CBC
export async function encryptFile(fileData: ArrayBuffer, encryptionKey: Uint8Array): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
  const iv = crypto.getRandomValues(new Uint8Array(16)); // 16-byte IV for AES-CBC
  const key = await crypto.subtle.importKey(
    "raw",
    encryptionKey,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const fileDataUint8Array = new Uint8Array(fileData); // Convert ArrayBuffer to Uint8Array

  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    fileDataUint8Array // Pass Uint8Array to encrypt
  );

  return { encryptedData, iv }; // Return encrypted data and IV separately
}

export async function decryptFile(encryptedData: ArrayBuffer, encryptionKey: Uint8Array): Promise<ArrayBuffer> {
  const iv = new Uint8Array(encryptedData.slice(0, 16)); // Extract IV from the first 16 bytes
  const data = new Uint8Array(encryptedData.slice(16)); // The rest is the encrypted data

  const key = await crypto.subtle.importKey(
    "raw",
    encryptionKey,
    { name: "AES-CBC" },
    false,
    ["decrypt"]
  );

  const decryptedData = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    data // Pass Uint8Array to decrypt
  );

  return decryptedData; // Return decrypted data as ArrayBuffer
}

// Generate a random 256-bit (32-byte) encryption key (for advanced use cases or key rotation)
export function generateRandomKey(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32)); // 32 bytes = 256 bits
}

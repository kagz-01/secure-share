import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const client = new Client({
  user: "kagz03",
  password: "kagz.post",
  database: "bahasha",
  hostname: "localhost",
  port: 5432,
});

await client.connect();

interface FileMetadata {
  id: string;
  userId: string;
  originalName: string;
  encryptedPath: string;
  mimeType: string;
  size: number;
  expiryDate: Date;
  maxDownloads: number;
  currentDownloads: number;
  createdAt: Date;
  isEncrypted: boolean;
  encryptionKey?: string;
}

export const startDatabase = async () => {
  // You can remove this since `client.connect()` is already called at the top
  // await client.connect();
};

// Export functions for interacting with the database
export const getFileById = async (id: string) => {
  const query = "SELECT * FROM files WHERE id = $1";
  const result = await client.queryObject(query, [id]);
  return result.rows[0];
};

export const incrementDownloadCount = async (id: string) => {
  const query = "UPDATE files SET current_downloads = current_downloads + 1 WHERE id = $1 RETURNING *";
  const result = await client.queryObject(query, [id]);
  return result.rows[0];
};

export const getUserById = async (userId: string) => {
  const query = "SELECT * FROM users WHERE id = $1";
  const result = await client.queryObject(query, [userId]);
  return result.rows[0];
}; // Added missing closing brace here

export const storeFile = async (fileMetadata: FileMetadata) => {
  const query = `
    INSERT INTO files (
      id, user_id, original_name, encrypted_path, mime_type, size, 
      expiry_date, max_downloads, current_downloads, created_at, is_encrypted, encryption_key
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  // Check if encryptionKey exists, otherwise pass null
  await client.queryArray(query, [
    fileMetadata.id,
    fileMetadata.userId,
    fileMetadata.originalName,
    fileMetadata.encryptedPath,
    fileMetadata.mimeType,
    fileMetadata.size,
    fileMetadata.expiryDate,
    fileMetadata.maxDownloads,
    fileMetadata.currentDownloads,
    fileMetadata.createdAt,
    fileMetadata.isEncrypted,
    fileMetadata.encryptionKey || null, // Handle undefined encryptionKey
  ]);
};

export const getFilesByUserId = async (userId: string, limit: number, offset: number) => {
  const query = `
    SELECT * FROM files 
    WHERE user_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2 OFFSET $3
  `;
  const result = await client.queryObject(query, [userId, limit, offset]);
  return result.rows;
};

export default client;

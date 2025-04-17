import { Handlers } from "$fresh/server.ts";
import { ENCRYPTION_KEY } from "../../utils/crypto_utils.ts";
import client from "../../db/db.ts";
import { rateLimitMiddleware } from "../../middleware/rateLimitMiddleware.ts";
import { authMiddleware } from "../../middleware/auth.ts";


interface FileRecord {
  id: string;
  original_name: string;
  encrypted_filename: string; 
  mime_type: string;
  expiry_date: string;
  current_downloads: number;
  max_downloads: number;
  iv?: string;
  user_id: string;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    // 🔒 Authenticate via middleware (JWT or session)
    const authResponse = await authMiddleware(req, ctx);
    if (authResponse) return authResponse;

    // 👤 Extract user from context
    const user = ctx.state.user as { id: string };
    if (!user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized: User not found in context" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 📉 Apply rate limit
    if (!rateLimitMiddleware(user.id)) {
      return new Response("Rate limit exceeded. Try again later.", { status: 429 });
    }

    // 📦 Get file param - support both URL formats (query param and path param)
    const url = new URL(req.url);
    let encryptedFilename = url.searchParams.get("file");
    
    // Try to get file ID from path if not in query params
    if (!encryptedFilename) {
      const pathMatch = url.pathname.match(/\/files\/download\/(.+)/);
      if (pathMatch) {
        encryptedFilename = pathMatch[1];
      }
    }
    
    if (!encryptedFilename) {
      return new Response("File not found", { status: 404 });
    }

   
    const result = await client.queryObject<FileRecord>(
      `SELECT * FROM files WHERE encrypted_filename = $1`, 
      [encryptedFilename]
    );

    if (result.rowCount === 0) {
      return new Response("File not found", { status: 404 });
    }

    const file = result.rows[0] as FileRecord;
    
    
    if (!file.original_name || !file.encrypted_filename || !file.mime_type) {  
      console.error("Missing file metadata:", file);
      return new Response("Invalid file metadata", { status: 500 });
    }

    // ⏳ Check expiration
    const now = new Date();
    if (now > new Date(file.expiry_date)) {
      try {
        await Deno.remove(`./uploads/${file.encrypted_filename}`);  
      } catch (_) {
        // File may have been deleted already
      }
      await client.queryObject("DELETE FROM files WHERE id = $1", [file.id]);
      return new Response("File expired and deleted", { status: 403 });
    }

    // 🚫 Check max downloads
    if (file.current_downloads >= file.max_downloads) {
      return new Response("Max downloads reached", { status: 403 });
    }

    // 📂 Read encrypted file
    let encryptedData: Uint8Array;
    try {
      encryptedData = await Deno.readFile(`./uploads/${file.encrypted_filename}`);  
    } catch (error) {
      console.error("File read error:", error);
      return new Response("File read error", { status: 500 });
    }

    // 🔐 Decrypt the file
    let decryptedData: Uint8Array;

    try {
      // Import the key for decryption
      const key = await crypto.subtle.importKey(
        "raw",
        ENCRYPTION_KEY,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
      );

      // For previously encrypted files, the IV might be stored in the database
      // or the IV might be prepended to the file
      let iv: Uint8Array;
      
      if (file.iv) {
        // If IV exists in the database, use it
        try {
          iv = new Uint8Array(JSON.parse(file.iv));
        } catch (e) {
          console.error("Error parsing IV from database:", e);
          return new Response("Invalid encryption metadata", { status: 500 });
        }
      } else {
        // If IV isn't in the database, assume it's prepended to the file (first 16 bytes)
        iv = encryptedData.slice(0, 16);
        encryptedData = encryptedData.slice(16);
      }

      // Decrypt the data
      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        key,
        encryptedData
      );

      decryptedData = new Uint8Array(decryptedBuffer);
    } catch (error) {
      console.error("Decryption error:", error);
      return new Response("Decryption failed", { status: 500 });
    }

    // 📊 Update download count
    await client.queryObject(
      `UPDATE files SET current_downloads = current_downloads + 1 WHERE id = $1`,
      [file.id]
    );

    // ✅ Return file
    return new Response(decryptedData, {
      headers: {
        "Content-Type": file.mime_type || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${file.original_name}"`,
      },
    });
  },
};

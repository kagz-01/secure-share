import client from "../../db/db.ts";

const cleanupExpiredFiles = async () => {
  const currentTime = new Date();

  interface FileRecord {
    id: number;
    encrypted_filename: string;
    expiration_time: Date;
  }

  const result = await client.queryObject<FileRecord>(
    "SELECT * FROM files WHERE expiration_time < $1",
    [currentTime]
  );

  for (const file of result.rows) {

    await Deno.remove(`./uploads/${file.encrypted_filename}`);

    await client.queryObject(
      "DELETE FROM files WHERE id = $1",
      [file.id]
    );

    console.log(`File ${file.encrypted_filename} has been deleted`);
  }
};

setInterval(cleanupExpiredFiles, 3600000); // 1 hour in ms

export default cleanupExpiredFiles;

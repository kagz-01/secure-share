// test_upload.ts

async function testLoginAndGetSessionCookie() {
  try {
    const credentials = await Deno.readTextFile("./test_credentials.txt");
    const emailMatch = credentials.match(/Email: (.+)/);
    const passwordMatch = credentials.match(/Password: (.+)/);
    
    if (!emailMatch || !passwordMatch) {
      throw new Error("Could not parse credentials file");
    }

    const email = emailMatch[1].trim();
    const password = passwordMatch[1].trim();

    const loginData = { email, password };

    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
      redirect: "manual"
    });

    const cookies = response.headers.get("set-cookie");
    let sessionCookie = null;
    if (cookies) {
      const sessionMatch = cookies.match(/sessionId=([^;]+)/);
      if (sessionMatch) {
        sessionCookie = `sessionId=${sessionMatch[1]}`;
      }
    }

    try {
      const jsonResponse = await response.json();
      if (response.ok && jsonResponse.token) {
        console.log("✅ Login successful!");
        return { token: jsonResponse.token, cookie: sessionCookie };
      } else {
        console.log("❌ Login failed");
        return { token: null, cookie: sessionCookie };
      }
    } catch {
      console.log("Could not parse JSON response");
      return { token: null, cookie: sessionCookie };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { token: null, cookie: null };
  }
}

async function testUploadLocalFile(filePath: string, token: string | null, sessionCookie: string | null) {
  try {
    const fileStat = await Deno.stat(filePath);
    if (!fileStat.isFile) throw new Error("Not a valid file");

    const fileName = filePath.split("/").pop()!;
    const fileData = await Deno.readFile(filePath);

    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      zip: "application/zip",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      mkv: "video/x-matroska",
      txt: "text/plain"
    };

    const contentType = mimeTypes[fileExtension ?? ""] ?? "application/octet-stream";

    const formData = new FormData();
    const blob = new Blob([fileData], { type: contentType });
    formData.append("file", new File([blob], fileName, { type: contentType }));
    formData.append("maxDownloads", "3");

    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (sessionCookie) headers["Cookie"] = sessionCookie;

    const response = await fetch("http://localhost:8000/files/upload", {
      method: "POST",
      headers,
      body: formData
    });

    console.log("Upload response status:", response.status);
    const result = await response.json();
    console.log("Response:", result);

    if (response.ok && result.encryptedFilename) {
      console.log("✅ File uploaded!");
      await Deno.writeTextFile("upload_success.txt", `Encrypted filename: ${result.encryptedFilename}`);
    } else {
      console.log("❌ Upload failed");
    }
  } catch (err) {
    console.error("Upload error:", err);
  }
}

// Run
const filePath = "./test.txt"; // ⬅️ Change this to any local file you want to test
const { token, cookie } = await testLoginAndGetSessionCookie();

if (token || cookie) {
  await testUploadLocalFile(filePath, token, cookie);
} else {
  console.error("Cannot upload without authentication");
}

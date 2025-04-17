// Test script for the file download functionality

async function testLoginAndGetSessionCookie() {
  try {
    // Read credentials from file
    const credentials = await Deno.readTextFile("./test_credentials.txt");
    const emailMatch = credentials.match(/Email: (.+)/);
    const passwordMatch = credentials.match(/Password: (.+)/);
    
    if (!emailMatch || !passwordMatch) {
      throw new Error("Could not parse credentials file");
    }
    
    const email = emailMatch[1].trim();
    const password = passwordMatch[1].trim();
    
    console.log(`Testing login with email: ${email}`);
    
    const loginData = { email, password };
    
    const response = await fetch("http://localhost:8000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(loginData),
      redirect: "manual"
    });
    
    console.log("Login response status:", response.status);
    
    // Extract session cookie if present
    const cookies = response.headers.get("set-cookie");
    let sessionCookie = null;
    if (cookies) {
      const sessionMatch = cookies.match(/sessionId=([^;]+)/);
      if (sessionMatch) {
        sessionCookie = `sessionId=${sessionMatch[1]}`;
        console.log("Extracted session cookie:", sessionCookie);
      }
    }
    
    // Also parse the JSON response for the JWT token
    try {
      const jsonResponse = await response.json();
      
      if (response.ok && jsonResponse.token) {
        console.log("✅ Login successful!");
        return {
          token: jsonResponse.token,
          cookie: sessionCookie
        };
      } else {
        console.log("❌ Login failed");
        return { token: null, cookie: sessionCookie };
      }
    } catch (_e) {
      console.log("Could not parse JSON response");
      return { token: null, cookie: sessionCookie };
    }
  } catch (error) {
    console.error("Error during login test:", error);
    return { token: null, cookie: null };
  }
}

// Read the file ID from the upload success file
async function getFileId() {
  try {
    const successData = await Deno.readTextFile("./upload_success.txt");
    const fileIdMatch = successData.match(/Encrypted filename: (.+)/);
    if (fileIdMatch) {
      return fileIdMatch[1].trim();
    }
  } catch (error) {
    console.error("Error reading file ID:", error);
  }
  
  // If we can't get the ID from the file, use a fallback
  console.log("Using fallback file ID");
  return "8b98e916-4661-4856-8c52-a66c6b6b5ae6.enc";
}

async function testDownloadFile(token: string | null, sessionCookie: string | null) {
  try {
    const fileId = await getFileId();
    console.log(`Testing download for file ID: ${fileId}`);
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      console.log("Added Authorization header with JWT token");
    }
    
    if (sessionCookie) {
      headers["Cookie"] = sessionCookie;
      console.log("Added Cookie header with session ID");
    }
    
    // Updated: Use the query parameter format instead of path parameter
    const downloadUrl = `http://localhost:8000/files/download?file=${fileId}`;
    console.log("Download URL:", downloadUrl);
    
    // Send download request
    const response = await fetch(downloadUrl, {
      headers,
    });
    
    console.log("Download response status:", response.status);
    console.log("Content-Type:", response.headers.get("Content-Type"));
    console.log("Content-Disposition:", response.headers.get("Content-Disposition"));
    
    if (response.ok) {
      console.log("✅ File download successful!");
      
      // Get the file size
      const buffer = await response.arrayBuffer();
      console.log(`Downloaded file size: ${buffer.byteLength} bytes`);
      
      // Save the downloaded file
      const fileData = new Uint8Array(buffer);
      await Deno.writeFile("downloaded_file", fileData);
      console.log("Downloaded file saved as 'downloaded_file'");
    } else {
      console.log("❌ File download failed");
      try {
        const errorText = await response.text();
        console.log("Error message:", errorText);
      } catch (_e) {
        console.log("Could not read error response");
      }
    }
  } catch (error) {
    console.error("Error during download test:", error);
  }
}

// Run the test
async function runTest() {
  // First login to get token and session cookie
  const { token, cookie } = await testLoginAndGetSessionCookie();
  
  // Then test download with both authentication methods
  if (token || cookie) {
    await testDownloadFile(token, cookie);
  } else {
    console.error("Cannot proceed with download test without authentication");
  }
}

await runTest();

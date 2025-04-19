// Simplified browser-like form submission test

async function submitFormLikeBrowser() {
  try {
    // Read file content
    const fileContent = await Deno.readTextFile("simple_test_file.txt");
    
    // Create a browser-like form submission
    const formData = new FormData();
    
    // Add file to form
    const fileBlob = new Blob([fileContent], { type: "text/plain" });
    formData.append("file", new File([fileBlob], "simple_test_file.txt", { type: "text/plain" }));
    
    // Add form fields
    formData.append("expiryDays", "3");
    formData.append("maxDownloads", "2");
    formData.append("encrypt", "on");
    
    console.log("Submitting form like a browser...");
    
    // Submit the form without authentication headers - the way a browser would do it
    const response = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    });
    
    console.log("Response status:", response.status);
    console.log("Response URL:", response.url);
    
    const responseText = await response.text();
    console.log("Response text length:", responseText.length);
    console.log("Response includes 'Unauthorized':", responseText.includes("Unauthorized"));
    console.log("Response includes 'Upload Secure File':", responseText.includes("Upload Secure File"));
    console.log("Response includes 'File Uploaded Successfully':", responseText.includes("File Uploaded Successfully"));
  } catch (error) {
    console.error("Test error:", error);
  }
}

await submitFormLikeBrowser();

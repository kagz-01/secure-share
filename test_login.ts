async function testLogin() {
  try {
    console.log("Testing login endpoint...");
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
      body: JSON.stringify(loginData)
    });
    
    console.log("Login response status:", response.status);
    
    const responseBody = await response.text();
    try {
      const jsonResponse = JSON.parse(responseBody);
      console.log("Response body:", jsonResponse);
      
      if (response.ok && jsonResponse.token) {
        console.log("✅ Login successful!");
        console.log("Auth token:", jsonResponse.token.substring(0, 20) + "...");
        
        console.log("Saving auth token to auth_token.txt");
        await Deno.writeTextFile("auth_token.txt", jsonResponse.token);
        console.log("Token saved to auth_token.txt");
      } else {
        console.log("❌ Login failed");
      }
    } catch (_e) {
      console.log("Response body (text):", responseBody);
    }
  } catch (error) {
    console.error("Error during login test:", error);
  }
}

await testLogin();
console.log("Login test completed");

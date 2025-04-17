async function testSignup() {
  console.log("Testing signup endpoint...");
  
  const email = `Ogoree@gmail.com`;
  const password = "Ogore123";
  
  const userData = { email, password };
  console.log(`Testing with email: ${email}`);
  
  try {
    const response = await fetch("http://localhost:8000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userData)
    });
    
    console.log("Response status:", response.status);
    
    const responseBody = await response.text();
    try {
      const jsonResponse = JSON.parse(responseBody);
      console.log("Response body:", jsonResponse);
    } catch (_e) {
      console.log("Response body (text):", responseBody);
    }
    
    if (response.ok) {
      console.log("✅ Signup successful!");
      console.log(`Created account: ${email} / ${password}`);
      
      console.log("Saving credentials to test_credentials.txt");
      await Deno.writeTextFile("test_credentials.txt", 
        `Email: ${email}\nPassword: ${password}\n`);
    } else {
      console.log("❌ Signup failed");
    }
  } catch (error) {
    console.error("Error during signup test:", error);
  }
}
await testSignup();
console.log("Signup test completed");

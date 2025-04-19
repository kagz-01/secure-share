// Debug script to analyze JWT token and payload

async function analyzeToken() {
  try {
    // Read the auth token
    const token = await Deno.readTextFile("./auth_token.txt");
    console.log("Auth token:", token);
    
    // Decode the JWT token parts (without verification)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }
    
    // Decode header
    const header = JSON.parse(atob(parts[0]));
    console.log("JWT Header:", header);
    
    // Decode payload
    const payload = JSON.parse(atob(parts[1]));
    console.log("JWT Payload:", payload);
    
    console.log("\nToken Analysis:");
    console.log("- Algorithm:", header.alg);
    console.log("- Token type:", header.typ);
    
    if (payload.sub) {
      console.log("- Subject (sub):", payload.sub);
    } else {
      console.log("- Subject (sub): NOT FOUND");
    }
    
    if (payload.name) {
      console.log("- Name:", payload.name);
    } else {
      console.log("- Name: NOT FOUND");
    }
    
    if (payload.userId) {
      console.log("- User ID:", payload.userId);
    }
    
    if (payload.email) {
      console.log("- Email:", payload.email);
    }
    
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      console.log("- Expiration:", expDate.toLocaleString());
    }
    
    console.log("\nThe auth middleware expects:");
    console.log("1. A 'sub' property for user ID");
    console.log("2. A 'name' property for username");
    
  } catch (error) {
    console.error("Error analyzing token:", error);
  }
}

// Run the analysis
await analyzeToken();

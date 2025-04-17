import { HandlerContext } from "$fresh/server.ts";
import { verify } from "https://deno.land/x/djwt@v2.8/mod.ts";

// Define the `State` type
export interface State {
  user?: { id: string; username?: string; email?: string };
}

// ✅ Use the same key as login/signup
const SECRET_KEY_STRING = Deno.env.get("JWT_SECRET") || "your-secret-key";

async function getJwtKey() {
  return await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET_KEY_STRING),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
}

// Middleware
export const authMiddleware = async (
  req: Request,
  ctx: HandlerContext<State>
) => {
  console.log("🔒 Auth middleware called");
  console.log("📝 Request URL:", req.url);
  console.log("📝 Request method:", req.method);
  
  // Check for session cookie first (cookie-based authentication)
  const cookie = req.headers.get("cookie");
  console.log("🍪 Cookie header:", cookie);
  
  if (cookie) {
    const sessionMatch = cookie.match(/sessionId=([^;]+)/);
    if (sessionMatch) {
      const sessionId = sessionMatch[1];
      console.log("💡 Found sessionId in cookie:", sessionId);
      
      // Here you would normally verify the session in the database
      // For debugging, we'll just assign a temporary user to the context
      ctx.state = { user: { id: "session-user", username: "Session User" } };
      console.log("✅ Session authenticated user:", ctx.state.user);
      return undefined; // Let the request proceed
    }
  }
  
  // If no valid session, check for JWT token (Bearer authentication)
  const authHeader = req.headers.get("Authorization");
  console.log("🔑 Authorization header:", authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ No valid Authorization header found");
    return new Response(
      JSON.stringify({ error: "Unauthorized: No token provided" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.split(" ")[1];
  console.log("🔖 Token found, verifying...");

  try {
    const key = await getJwtKey();
    const payload = await verify(token, key);
    console.log("📄 Token payload:", payload);

    // Support both token formats: the old one with sub/name and the new one with userId/email
    const userId = payload.userId || payload.sub;
    const username = payload.name || payload.email;
    
    if (!userId) {
      console.log("❌ Invalid token: missing user identifier");
      throw new Error("Invalid token: missing user identifier");
    }

    const user = { id: userId.toString(), username, email: payload.email };
    ctx.state = { user };

    console.log("✅ JWT verified for user:", user);

    return undefined; // continue to route
  } catch (e) {
    console.error("❌ JWT verification failed:", e);
    return new Response(
      JSON.stringify({ error: "Invalid or tampered token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
};

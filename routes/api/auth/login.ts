import { Handlers } from "$fresh/server.ts";
import client from "../../../db/db.ts";
import { compare } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
import { setSessionCookie } from "../../../utils/session.ts";

const SECRET_KEY_STRING = Deno.env.get("JWT_SECRET") || "your-secret-key";
if (!SECRET_KEY_STRING) {
  throw new Error("JWT_SECRET environment variable is not set");
}
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

const SECRET_KEY = await getCryptoKey(SECRET_KEY_STRING);

export const handler: Handlers = {
  async POST(req) {
    try {
      const { email, password } = await req.json();

      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
      }

      // Fetch user
      const result = await client.queryObject(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );

      if (result.rows.length === 0) {
        return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
      }

      const user = result.rows[0] as { id: number; email: string; password: string };

      const passwordMatch = await compare(password, user.password);
      if (!passwordMatch) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
      }

      // ✅ Use crypto.randomUUID for valid UUID
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      // Store session
      await client.queryObject(
        "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
        [sessionId, user.id, expiresAt],
      );

      // Create JWT
      const jwt = await create(
        { alg: "HS256", typ: "JWT" },
        {
          userId: user.id,
          email: user.email,
          exp: getNumericDate(60 * 60),
        },
        SECRET_KEY,
      );

      const headers = new Headers();
      headers.set("Set-Cookie", setSessionCookie(sessionId));
      headers.set("Location", "/dashboard");
      headers.set("Content-Type", "application/json");

      return new Response(
        JSON.stringify({ token: jwt, message: "Login successful" }),
        { status: 200, headers },
      );

    } catch (error) {
      console.error("Error during login:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
    }
  },
};

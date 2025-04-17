import { Handlers } from "$fresh/server.ts";
import client from "../../../db/db.ts";
import { hash } from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";
import { createSession, setSessionCookie } from "../../../utils/session.ts";

export const handler: Handlers = {
  async POST(req) {
    const { email, password } = await req.json();

    // Check if user already exists
    const checkUser = await client.queryObject(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if ((checkUser.rowCount ?? 0) > 0) {
      return new Response(JSON.stringify({ error: "Email already in use" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const hashedPassword = await hash(password);

      // Create user and return the ID
      const insertResult = await client.queryObject<{
        id: number;
      }>(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id",
        [email, hashedPassword]
      );

      const userId = insertResult.rows[0].id;

      // Create session
      const sessionId = await createSession(userId);
      const headers = new Headers();
      headers.set("Set-Cookie", setSessionCookie(sessionId));
      headers.set("Content-Type", "application/json");

      return new Response(JSON.stringify({ message: "Signup successful" }), {
        status: 201,
        headers,
      });
    } catch (_error) {
      console.error("Signup error:", _error);
      return new Response(JSON.stringify({ error: "Signup failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};

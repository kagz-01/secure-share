// utils/session.ts

import client from "../db/db.ts";

// Set session expiry time to 7 days in milliseconds
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Create a session for the given user ID and store it in the database.
 */
export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID(); // ✅ Use valid UUID
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS); // Session expiration date

  // Insert the session into the database
  await client.queryObject(
    "INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)",
    [sessionId, userId, expiresAt]
  );

  return sessionId;
}

/**
 * Verify a session by its ID and return the associated user ID if valid.
 */
export async function verifySession(sessionId: string): Promise<number | null> {
  const result = await client.queryObject<{
    user_id: number;
    expires_at: Date;
  }>(
    "SELECT user_id, expires_at FROM sessions WHERE id = $1",
    [sessionId]
  );

  if (result.rows.length === 0) return null;

  const { user_id, expires_at } = result.rows[0];

  if (new Date(expires_at).getTime() < Date.now()) {
    await destroySession(sessionId); // Session expired — clean up
    return null;
  }

  return user_id;
}

/**
 * Extract the session ID from the request cookie header.
 */
export function getSessionId(req: Request): string | null {
  const cookie = req.headers.get("cookie");
  if (!cookie) return null;

  const match = cookie.match(/sessionId=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Generate a session cookie string with expiration.
 */
export function setSessionCookie(sessionId: string): string {
  const expires = new Date(Date.now() + SESSION_EXPIRY_MS).toUTCString();
  return `sessionId=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Expires=${expires}`;
}

/**
 * Delete a session from the database.
 */
export async function destroySession(sessionId: string): Promise<void> {
  await client.queryObject("DELETE FROM sessions WHERE id = $1", [sessionId]);
}

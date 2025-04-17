import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

// Define payload
const payload = { sub: "user123", name: "John Doe", exp: Math.floor(Date.now() / 1000) + 60 * 60 }; // Set expiration 1 hour from now

// Encode the secret key as a 32-byte string (if not already 32 bytes)
const ENCODED_KEY = new TextEncoder().encode("your-32-char-secure-key".padEnd(32, "0"));

// Import the key using the Web Crypto API
const SECRET_KEY = await crypto.subtle.importKey(
    "raw",
    ENCODED_KEY,
    { name: "HMAC", hash: "SHA-256" }, // Use SHA-256 for HMAC signing
    false,
    ["sign"] // Only need to sign with this key
);


const token = await create({ alg: "HS256", typ: "JWT" }, payload, SECRET_KEY);


console.log(token);

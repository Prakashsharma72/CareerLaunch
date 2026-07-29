/**
 * JWT utility — client-side only (no secret needed for decode).
 * We only READ the payload; signature verification happens on the server.
 */

/**
 * Decode a JWT and return its payload, or null if malformed.
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    // atob handles standard base64; replace URL-safe chars first
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Returns true when the token exists AND has not expired.
 * Adds a 10-second clock-skew buffer.
 */
export function isTokenValid(token) {
  const payload = decodeToken(token);
  if (!payload) return false;
  if (!payload.exp) return true; // no expiry claim → treat as valid
  return payload.exp * 1000 > Date.now() + 10_000;
}

/**
 * Pull the stored token from localStorage and verify it.
 * Returns the token string if valid, null otherwise.
 */
export function getValidToken() {
  const token = localStorage.getItem("token");
  if (isTokenValid(token)) return token;
  // Token missing or expired — clean up
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  return null;
}

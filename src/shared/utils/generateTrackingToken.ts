/**
 * generateTrackingToken.ts
 *
 * Generates a cryptographically secure customer tracking token.
 *
 * Security model:
 * - The raw token is given to the customer (embedded in their confirmation URL).
 * - Only the SHA-256 hash of the token is stored in the database.
 * - Even if the database is compromised, attackers cannot reconstruct valid tokens.
 * - Tokens are 32 random bytes encoded as hex (256 bits of entropy).
 *
 * Usage:
 *   const { token, hash } = await generateTrackingToken()
 *   // Store `hash` in orders.tracking_token_hash
 *   // Send `token` to the customer via confirmation page URL
 *
 * Dependency rule: no imports from anywhere. Pure TypeScript/Web Crypto utility.
 */

/**
 * Generates a secure tracking token and its SHA-256 hash.
 * Both values are hex-encoded strings.
 */
export async function generateTrackingToken(): Promise<{
  /** The raw token — give to the customer, never store in DB. */
  token: string
  /** SHA-256 hash of the token — store in DB, never expose. */
  hash: string
}> {
  // 32 bytes = 256 bits of entropy
  const rawBytes = new Uint8Array(32)
  crypto.getRandomValues(rawBytes)
  const token = bytesToHex(rawBytes)

  const hash = await sha256Hex(token)

  return { token, hash }
}

/**
 * Hashes a customer-supplied token for database lookup.
 * Used when a customer visits their tracking URL.
 */
export async function hashTrackingToken(token: string): Promise<string> {
  return sha256Hex(token)
}

/**
 * Validates basic token format (64 hex chars).
 */
export function isValidTrackingToken(token: string): boolean {
  return /^[0-9a-f]{64}$/.test(token)
}

// ─── Internal helpers ─────────────────────────────────────────────────────

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
  return bytesToHex(new Uint8Array(hashBuffer))
}

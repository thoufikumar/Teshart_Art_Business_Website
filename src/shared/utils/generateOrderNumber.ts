/**
 * generateOrderNumber.ts
 *
 * Generates human-readable order numbers in the format TSH-XXXXXX
 * where XXXXXX is a 6-character uppercase alphanumeric string.
 *
 * In Phase 2+, the final order number will be generated server-side
 * in an Edge Function to guarantee uniqueness. This client-side
 * generator is used only as a placeholder for the prototype UI.
 *
 * Dependency rule: no imports from anywhere. Pure TypeScript utility.
 */

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Excludes ambiguous chars (0,O,I,1)
const SUFFIX_LENGTH = 6

/**
 * Generates a TSH-XXXXXX order number.
 * Uses crypto.getRandomValues for browser-safe randomness.
 */
export function generateOrderNumber(prefix: string = "TSH"): string {
  const bytes = new Uint8Array(SUFFIX_LENGTH)
  crypto.getRandomValues(bytes)

  const suffix = Array.from(bytes)
    .map((b) => CHARSET[b % CHARSET.length])
    .join("")

  return `${prefix}-${suffix}`
}

/**
 * Validates that a string matches the expected order number format.
 */
export function isValidOrderNumber(value: string, prefix: string = "TSH"): boolean {
  const pattern = new RegExp(`^${prefix}-[A-Z2-9]{${SUFFIX_LENGTH}}$`)
  return pattern.test(value)
}

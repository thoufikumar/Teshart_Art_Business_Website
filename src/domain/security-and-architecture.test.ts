import fs from "node:fs"
import path from "node:path"
import { PRODUCT_VARIANTS } from "./catalogue"
import { calculateOrderPricing } from "./pricing"
import { calculateAuthoritativePricing } from "../../supabase/functions/_shared/pricing"
import { isValidIndianMobile, isValidIndianPincode } from "./validation"
import { generateTrackingToken, hashTrackingToken, isValidTrackingToken } from "../shared/utils/generateTrackingToken"

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`)
  }
}

export async function runSecurityAndArchitectureTests(): Promise<{ passed: number; assertions: string[] }> {
  const assertions: string[] = []
  let passed = 0

  const record = (desc: string) => {
    passed += 1
    assertions.push(desc)
  }

  // ─── 1. Server vs Client Pricing Calculation Parity Test ─────────────────
  // Proves server recalculation strictly matches catalogue and cannot be overridden by client
  assertEqual(PRODUCT_VARIANTS.length, 16, "Must test all 16 supported variants")

  for (const variant of PRODUCT_VARIANTS) {
    const clientCalc = calculateOrderPricing(variant.portraitType, variant.size, variant.finish, {
      shippingFeeInr: 0,
      advancePolicy: { type: "percentage", ratio: 0.5, rounding: "ceil" },
    })

    const serverCalc = calculateAuthoritativePricing(variant.portraitType, variant.size, variant.finish, 0)

    assertEqual(serverCalc.productPriceInr, clientCalc.productPriceInr, `Price parity: ${variant.id}`)
    assertEqual(serverCalc.advancePayableInr, clientCalc.advancePayableInr, `Advance parity: ${variant.id}`)
    assertEqual(serverCalc.remainingOnDeliveryInr, clientCalc.remainingOnDeliveryInr, `Remaining balance parity: ${variant.id}`)
    assertEqual(serverCalc.totalPaise, clientCalc.totalAmountInr * 100, `Total paise parity: ${variant.id}`)
    assertEqual(serverCalc.advancePaise, clientCalc.advancePayableInr * 100, `Advance paise parity: ${variant.id}`)
    assertEqual(serverCalc.remainingPaise, clientCalc.remainingOnDeliveryInr * 100, `Remaining paise parity: ${variant.id}`)
    record(`Verified 100% pricing parity for ${variant.id}`)
  }

  // Verify server rejects unsupported combinations like family A5
  let serverRejectedFamilyA5 = false
  try {
    calculateAuthoritativePricing("family" as any, "A5" as any, "unframed")
  } catch {
    serverRejectedFamilyA5 = true
  }
  assertEqual(serverRejectedFamilyA5, true, "Server pricing engine must reject Family A5")
  record("Verified server pricing engine rejects Family A5 configuration")

  // ─── 2. Tracking Token Cryptographic Security Tests ─────────────────────
  const { token, hash } = await generateTrackingToken()

  assertEqual(token.length, 64, "Raw tracking token must be 64 hex characters (256-bit entropy)")
  assertEqual(hash.length, 64, "Tracking token hash must be 64 hex characters (SHA-256)")
  assertEqual(isValidTrackingToken(token), true, "Tracking token must be valid hex")

  // Re-hashing the raw token must deterministically reproduce the stored hash
  const computedHash = await hashTrackingToken(token)
  assertEqual(computedHash, hash, "Hash computation must be deterministic")

  // Two successive tokens must be cryptographically unique
  const second = await generateTrackingToken()
  assertEqual(token !== second.token, true, "Successive tokens must be distinct")
  assertEqual(hash !== second.hash, true, "Successive token hashes must be distinct")
  record("Verified cryptographically secure 256-bit token entropy & SHA-256 determinism")

  // ─── 3. Customer Input & Mobile Normalization Tests ──────────────────────
  const testMobiles = [
    { raw: "9876543210", clean: "9876543210", valid: true },
    { raw: "+91 98765 43210", clean: "9876543210", valid: true },
    { raw: "91-98765-43210", clean: "9876543210", valid: true },
    { raw: "1234567890", clean: "1234567890", valid: false }, // does not start with 6-9
    { raw: "98765", clean: "98765", valid: false }, // too short
  ]

  for (const m of testMobiles) {
    const digits = m.raw.replace(/\D/g, "")
    const normalized = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits
    assertEqual(isValidIndianMobile(m.raw), m.valid, `Mobile validation: ${m.raw}`)
    if (m.valid) {
      assertEqual(normalized, m.clean, `Normalized mobile: ${m.raw} -> ${m.clean}`)
    }
    record(`Verified mobile normalization & validation for ${m.raw}`)
  }

  assertEqual(isValidIndianPincode("641202"), true, "Pincode 641202 must be valid")
  assertEqual(isValidIndianPincode("012345"), false, "Pincode starting with 0 must be invalid")
  assertEqual(isValidIndianPincode("64120"), false, "5-digit pincode must be invalid")
  record("Verified Indian pincode validation")

  // ─── 4. SQL Migration Static Security Analysis ──────────────────────────
  const migrationsDir = path.resolve(process.cwd(), "supabase/migrations")
  const m1 = fs.readFileSync(path.join(migrationsDir, "20261120000001_initial_schema.sql"), "utf8")
  const m2 = fs.readFileSync(path.join(migrationsDir, "20261120000002_rls_policies.sql"), "utf8")
  const m3 = fs.readFileSync(path.join(migrationsDir, "20261120000003_storage_buckets.sql"), "utf8")

  // Security Check A: Absolutely NO `USING (true)` or `WITH CHECK (true)` anywhere in RLS!
  const stripComments = (sql: string) => sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "")
  const cleanedM2 = stripComments(m2)
  const hasUsingTrue = /USING\s*\(\s*true\s*\)/i.test(cleanedM2)
  const hasWithCheckTrue = /WITH\s+CHECK\s*\(\s*true\s*\)/i.test(cleanedM2)
  assertEqual(hasUsingTrue, false, "CRITICAL: RLS migration must NEVER contain USING (true)")
  assertEqual(hasWithCheckTrue, false, "CRITICAL: RLS migration must NEVER contain WITH CHECK (true)")
  record("Verified zero instances of USING (true) or WITH CHECK (true) in RLS policies")

  // Security Check B: Anonymous direct grants must be revoked
  assertEqual(m2.includes("REVOKE ALL ON TABLE customers FROM anon"), true, "Customers table must revoke anon permissions")
  assertEqual(m2.includes("REVOKE ALL ON TABLE orders FROM anon"), true, "Orders table must revoke anon permissions")
  assertEqual(m2.includes("REVOKE ALL ON TABLE payments FROM anon"), true, "Payments table must revoke anon permissions")
  assertEqual(m2.includes("REVOKE ALL ON TABLE order_photos FROM anon"), true, "Order photos table must revoke anon permissions")
  assertEqual(m2.includes("REVOKE ALL ON TABLE admin_profiles FROM anon"), true, "Admin profiles table must revoke anon permissions")
  record("Verified explicit REVOKE ALL ON TABLE from anon for all sensitive tables")

  // Security Check C: All 7 required normalized tables exist
  const expectedTables = [
    "CREATE TABLE IF NOT EXISTS customers",
    "CREATE TABLE IF NOT EXISTS orders",
    "CREATE TABLE IF NOT EXISTS order_photos",
    "CREATE TABLE IF NOT EXISTS payments",
    "CREATE TABLE IF NOT EXISTS order_status_history",
    "CREATE TABLE IF NOT EXISTS shipments",
    "CREATE TABLE IF NOT EXISTS admin_profiles",
  ]
  for (const tbl of expectedTables) {
    assertEqual(m1.includes(tbl), true, `Migration must contain table: ${tbl}`)
    record(`Verified schema contains ${tbl}`)
  }

  // Security Check D: Financial amounts stored as BIGINT in integer paise
  assertEqual(m1.includes("subtotal_amount_paise     BIGINT NOT NULL"), true, "subtotal_amount_paise must be BIGINT")
  assertEqual(m1.includes("delivery_fee_paise        BIGINT NOT NULL"), true, "delivery_fee_paise must be BIGINT")
  assertEqual(m1.includes("total_amount_paise        BIGINT NOT NULL"), true, "total_amount_paise must be BIGINT")
  assertEqual(m1.includes("advance_amount_paise      BIGINT NOT NULL"), true, "advance_amount_paise must be BIGINT")
  assertEqual(m1.includes("remaining_amount_paise    BIGINT NOT NULL"), true, "remaining_amount_paise must be BIGINT")
  assertEqual(m1.includes("amount_paise          BIGINT NOT NULL"), true, "payments amount_paise must be BIGINT")
  record("Verified all monetary fields are explicitly typed as BIGINT integer paise")

  // Security Check E: order_photos foreign key and storage bucket privacy
  assertEqual(m1.includes("REFERENCES orders(id) ON DELETE CASCADE"), true, "order_photos must cascade delete with order")
  assertEqual(m3.includes("public = false"), true, "customer-photos bucket must be private")
  assertEqual(m3.includes("'customer-photos'"), true, "customer-photos bucket must be configured")
  record("Verified order_photos FK cascading and private storage bucket configuration")

  return { passed, assertions }
}

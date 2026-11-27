/**
 * attach-photo-to-order Edge Function
 *
 * Associates a successfully uploaded photo with an order.
 * Called AFTER:
 *   1. create-order returns the trackingToken
 *   2. authorize-photo-upload returns the signed upload URL
 *   3. The browser PUT-uploads the file to the signed URL
 *
 * Security model:
 *  - Accepts trackingToken (64-char hex), not orderId directly.
 *  - Hashes the token and verifies against orders.tracking_token_hash.
 *  - Accepts uploads only while the order is in a pre-payment state.
 *  - Runs with service-role key — never exposed to the browser.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const ACCEPTED_STATUSES = ["DRAFT", "CONFIGURED", "PAYMENT_PENDING", "PAYMENT_FAILED"]

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  // Validate environment
  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: "Service unavailable" }), {
      status: 503,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  let body: {
    trackingToken?: string
    storagePath?: string
    originalFilename?: string
    mimeType?: string
    fileSizeBytes?: number
  }

  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  const { trackingToken, storagePath, originalFilename, mimeType, fileSizeBytes } = body

  // Basic input validation
  if (typeof trackingToken !== "string" || !/^[0-9a-f]{64}$/.test(trackingToken)) {
    return new Response(JSON.stringify({ error: "Invalid tracking token" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  if (typeof storagePath !== "string" || storagePath.length === 0 || storagePath.length > 500) {
    return new Response(JSON.stringify({ error: "Invalid storage path" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  if (typeof originalFilename !== "string" || originalFilename.length === 0) {
    return new Response(JSON.stringify({ error: "Invalid filename" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  if (!["image/jpeg", "image/png"].includes(mimeType ?? "")) {
    return new Response(JSON.stringify({ error: "Unsupported MIME type" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  if (typeof fileSizeBytes !== "number" || fileSizeBytes <= 0 || fileSizeBytes > 10 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "Invalid file size" }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  // Hash the token server-side (SHA-256 hex)
  const tokenBytes = new TextEncoder().encode(trackingToken)
  const hashBuffer = await crypto.subtle.digest("SHA-256", tokenBytes)
  const tokenHash = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  // Look up the order by tracking token hash
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, order_status")
    .eq("tracking_token_hash", tokenHash)
    .maybeSingle()

  if (orderError) {
    console.error("Order lookup error:", orderError)
    return new Response(JSON.stringify({ error: "Failed to look up order" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  if (!order) {
    return new Response(JSON.stringify({ error: "Order not found" }), {
      status: 404,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  if (!ACCEPTED_STATUSES.includes(order.order_status)) {
    return new Response(
      JSON.stringify({ error: "Order is not in a state that accepts photo attachments" }),
      {
        status: 409,
        headers: { ...CORS, "Content-Type": "application/json" },
      }
    )
  }

  // Insert the photo reference — set any existing primary to non-primary first
  const { error: clearPrimaryError } = await supabase
    .from("order_photos")
    .update({ is_primary: false })
    .eq("order_id", order.id)
    .eq("is_primary", true)

  if (clearPrimaryError) {
    console.error("Failed to clear existing primary photo:", clearPrimaryError)
    // Non-fatal: proceed with insert
  }

  const { error: insertError } = await supabase.from("order_photos").insert({
    order_id: order.id,
    storage_path: storagePath,
    original_filename: originalFilename,
    mime_type: mimeType,
    file_size_bytes: fileSizeBytes,
    is_primary: true,
  })

  if (insertError) {
    console.error("Failed to insert order photo:", insertError)
    return new Response(JSON.stringify({ error: "Failed to attach photo to order" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  })
})

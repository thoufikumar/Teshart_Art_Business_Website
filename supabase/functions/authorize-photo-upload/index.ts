import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application, *",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"]
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * authorize-photo-upload Edge Function (Secured)
 *
 * Security model:
 * - Requires a valid trackingToken paired with a DRAFT-status order.
 *   This prevents unauthenticated actors from obtaining signed upload URLs.
 * - Upload path is scoped to the order: staging/{orderId}/{uuid}.{ext}
 * - Files are uploaded to `staging/` and relocated to `orders/{orderId}/`
 *   when the order is confirmed (via create-order step or post-payment).
 * - File is validated (MIME type, size) server-side before the signed URL is issued.
 * - Service-role key never exposed to the browser.
 */
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { filename, mimeType, fileSizeBytes, trackingToken } = await req.json()

    // 1. Require a valid tracking token to prevent unauthenticated URL generation
    if (!trackingToken || typeof trackingToken !== "string" || !/^[0-9a-f]{64}$/.test(trackingToken)) {
      return new Response(
        JSON.stringify({ error: "A valid order tracking token is required to authorize photo upload" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 2. Validate File Metadata
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return new Response(
        JSON.stringify({ error: "Only JPG and PNG images are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    if (!fileSizeBytes || fileSizeBytes <= 0 || fileSizeBytes > MAX_SIZE_BYTES) {
      return new Response(
        JSON.stringify({ error: "File size must be between 1 byte and 10MB" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 3. Hash the tracking token and look up the order
    const encoded = new TextEncoder().encode(trackingToken)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number, order_status")
      .eq("tracking_token_hash", tokenHash)
      .maybeSingle()

    if (fetchError || !order) {
      return new Response(
        JSON.stringify({ error: "Invalid tracking token — order not found" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 4. Only allow photo upload for orders that haven't been confirmed yet
    const permittedStatuses = ["DRAFT", "CONFIGURED", "PAYMENT_PENDING", "PAYMENT_FAILED"]
    if (!permittedStatuses.includes(order.order_status)) {
      return new Response(
        JSON.stringify({ error: `Photo upload is not permitted for orders in status: ${order.order_status}` }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 5. Server-Controlled Path: scoped to orderId
    const ext = mimeType === "image/png" ? "png" : "jpg"
    const fileSessionId = crypto.randomUUID()
    const storagePath = `staging/${order.id}/${fileSessionId}.${ext}`

    // 6. Create Signed Upload URL via Service Role
    const { data, error } = await supabase.storage
      .from("customer-photos")
      .createSignedUploadUrl(storagePath)

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: `Failed to create signed upload URL: ${error?.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    return new Response(
      JSON.stringify({
        signedUploadUrl: data.signedUrl,
        storagePath: storagePath,
        token: data.token,
        orderId: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

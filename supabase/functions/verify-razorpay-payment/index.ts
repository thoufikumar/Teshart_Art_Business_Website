import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application, *",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

/**
 * verify-razorpay-payment Edge Function
 *
 * Called from the browser AFTER Razorpay Checkout succeeds.
 * Verifies the HMAC-SHA256 signature server-side before marking the order paid.
 *
 * Security model:
 * - NEVER mark order as paid based on the browser callback alone.
 * - Only a valid Razorpay HMAC signature (using the secret key) can confirm payment.
 * - Idempotency key prevents duplicate payment confirmation on retries.
 * - gateway_payment_id uniqueness prevents double-booking.
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderNumber,
    } = await req.json()

    // Input validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderNumber) {
      return new Response(
        JSON.stringify({ error: "Missing required payment verification fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Payment verification unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ─── HMAC-SHA256 Signature Verification ───────────────────────────────────
    // Razorpay signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`
    const encoder = new TextEncoder()
    const keyData = encoder.encode(razorpayKeySecret)
    const msgData = encoder.encode(signatureBody)

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, msgData)
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // Constant-time comparison to prevent timing attacks
    if (computedSignature.length !== razorpay_signature.length) {
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    let signaturesMatch = true
    for (let i = 0; i < computedSignature.length; i++) {
      if (computedSignature[i] !== razorpay_signature[i]) {
        signaturesMatch = false
      }
    }

    if (!signaturesMatch) {
      console.error(`Signature mismatch for order ${orderNumber}. Potential fraud attempt.`)
      return new Response(
        JSON.stringify({ error: "Invalid payment signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ─── Persist Verified Payment ─────────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number, advance_amount_paise, payment_status, order_status")
      .eq("order_number", orderNumber)
      .maybeSingle()

    if (fetchError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Idempotency: if already verified, return success without re-writing
    if (order.payment_status === "ADVANCE_PAID" || order.payment_status === "FULLY_PAID") {
      return new Response(
        JSON.stringify({ success: true, orderNumber, alreadyVerified: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Update the payment record with the verified payment id
    const { error: paymentUpdateError } = await supabase
      .from("payments")
      .update({
        gateway_payment_id: razorpay_payment_id,
        status: "ADVANCE_PAID",
        verified_at: new Date().toISOString(),
      })
      .eq("gateway_order_id", razorpay_order_id)
      .eq("status", "PENDING")

    if (paymentUpdateError) {
      console.error("Payment record update failed:", paymentUpdateError.message)
      return new Response(
        JSON.stringify({ error: "Failed to record payment. Contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Update order status
    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        order_status: "PAYMENT_VERIFIED",
        payment_status: "ADVANCE_PAID",
      })
      .eq("id", order.id)

    if (orderUpdateError) {
      console.error("Order status update failed:", orderUpdateError.message)
      return new Response(
        JSON.stringify({ error: "Payment verified but order status update failed. Contact support." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Insert status history audit row
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status: order.order_status,
      to_status: "PAYMENT_VERIFIED",
      changed_by: "system_verify_razorpay_payment",
      notes: `Advance payment verified. Razorpay payment id: ${razorpay_payment_id}`,
    })

    return new Response(
      JSON.stringify({ success: true, orderNumber }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("verify-razorpay-payment error:", (err as Error).message)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

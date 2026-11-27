import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

/**
 * razorpay-webhook Edge Function
 *
 * Receives Razorpay webhook events (payment.captured, payment.failed, etc.)
 * Verifies the webhook signature before processing any event.
 *
 * Security:
 * - HMAC-SHA256 signature verified against RAZORPAY_WEBHOOK_SECRET.
 * - Idempotency_key prevents duplicate event processing.
 * - No CORS headers — this endpoint is called by Razorpay servers, not browsers.
 *
 * Required Razorpay Dashboard configuration:
 *   Webhook URL: https://<project>.supabase.co/functions/v1/razorpay-webhook
 *   Active events: payment.captured, payment.failed, order.paid
 */
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET")
    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured")
      return new Response("Webhook not configured", { status: 503 })
    }

    const rawBody = await req.text()
    const razorpaySignature = req.headers.get("x-razorpay-signature")

    if (!razorpaySignature) {
      return new Response("Missing webhook signature", { status: 400 })
    }

    // ─── Verify Webhook Signature ─────────────────────────────────────────────
    const encoder = new TextEncoder()
    const keyData = encoder.encode(webhookSecret)
    const msgData = encoder.encode(rawBody)

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

    // Constant-time comparison
    let signaturesMatch = computedSignature.length === razorpaySignature.length
    if (signaturesMatch) {
      for (let i = 0; i < computedSignature.length; i++) {
        if (computedSignature[i] !== razorpaySignature[i]) {
          signaturesMatch = false
        }
      }
    }

    if (!signaturesMatch) {
      console.error("Invalid webhook signature — possible spoofed request")
      return new Response("Invalid signature", { status: 401 })
    }

    // ─── Parse and Process Event ──────────────────────────────────────────────
    const event = JSON.parse(rawBody)
    const eventType: string = event.event

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    if (eventType === "payment.captured") {
      const payment = event.payload?.payment?.entity
      if (!payment) {
        return new Response("Missing payment entity", { status: 400 })
      }

      const razorpayOrderId: string = payment.order_id
      const razorpayPaymentId: string = payment.id
      const amountPaise: number = payment.amount

      // Idempotency: check if this payment event was already processed
      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id, order_id, status")
        .eq("gateway_order_id", razorpayOrderId)
        .maybeSingle()

      if (!existingPayment) {
        console.error(`No payment record found for Razorpay order ${razorpayOrderId}`)
        return new Response("Payment record not found", { status: 404 })
      }

      // Skip if already captured (duplicate webhook delivery)
      if (existingPayment.status === "ADVANCE_PAID" || existingPayment.status === "FULLY_PAID") {
        console.log(`Webhook: payment ${razorpayPaymentId} already processed — skipping`)
        return new Response("OK", { status: 200 })
      }

      // Update payment record
      await supabase
        .from("payments")
        .update({
          gateway_payment_id: razorpayPaymentId,
          status: "ADVANCE_PAID",
          verified_at: new Date().toISOString(),
        })
        .eq("id", existingPayment.id)

      // Update order
      const { data: order } = await supabase
        .from("orders")
        .select("order_status")
        .eq("id", existingPayment.order_id)
        .maybeSingle()

      await supabase
        .from("orders")
        .update({
          order_status: "PAYMENT_VERIFIED",
          payment_status: "ADVANCE_PAID",
        })
        .eq("id", existingPayment.order_id)

      // Status history
      await supabase.from("order_status_history").insert({
        order_id: existingPayment.order_id,
        from_status: order?.order_status ?? null,
        to_status: "PAYMENT_VERIFIED",
        changed_by: "razorpay_webhook",
        notes: `payment.captured — Razorpay payment id: ${razorpayPaymentId}, amount: ₹${amountPaise / 100}`,
      })

      console.log(`Webhook: payment captured for order ${razorpayOrderId}, payment ${razorpayPaymentId}`)
    } else if (eventType === "payment.failed") {
      const payment = event.payload?.payment?.entity
      if (!payment) {
        return new Response("Missing payment entity", { status: 400 })
      }

      const razorpayOrderId: string = payment.order_id

      await supabase
        .from("payments")
        .update({ status: "FAILED" })
        .eq("gateway_order_id", razorpayOrderId)
        .eq("status", "PENDING")

      const { data: existingPayment } = await supabase
        .from("payments")
        .select("order_id")
        .eq("gateway_order_id", razorpayOrderId)
        .maybeSingle()

      if (existingPayment) {
        const { data: order } = await supabase
          .from("orders")
          .select("order_status")
          .eq("id", existingPayment.order_id)
          .maybeSingle()

        await supabase
          .from("orders")
          .update({ order_status: "PAYMENT_FAILED", payment_status: "FAILED" })
          .eq("id", existingPayment.order_id)

        await supabase.from("order_status_history").insert({
          order_id: existingPayment.order_id,
          from_status: order?.order_status ?? null,
          to_status: "PAYMENT_FAILED",
          changed_by: "razorpay_webhook",
          notes: `payment.failed — error: ${payment.error_description ?? "unknown"}`,
        })
      }

      console.log(`Webhook: payment failed for Razorpay order ${razorpayOrderId}`)
    } else {
      // Log but acknowledge other events gracefully
      console.log(`Webhook: unhandled event type "${eventType}" — acknowledged`)
    }

    return new Response("OK", { status: 200 })
  } catch (err) {
    console.error("razorpay-webhook error:", (err as Error).message)
    return new Response("Internal server error", { status: 500 })
  }
})

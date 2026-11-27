import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { calculateAuthoritativePricing, isSupportedConfiguration } from "../_shared/pricing.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key, x-application, *",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

/**
 * create-razorpay-order Edge Function
 *
 * Called AFTER create-order has persisted the order draft.
 * Creates a Razorpay order for the advance payment amount.
 *
 * Security:
 * - Razorpay key_id and key_secret live exclusively here (never in the browser).
 * - Pricing is re-verified from the persisted order record, not from the client.
 * - The returned Razorpay order id is used only to open the checkout modal.
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

    const { orderNumber } = await req.json()

    if (!orderNumber || typeof orderNumber !== "string") {
      return new Response(JSON.stringify({ error: "orderNumber is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID")
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET")

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Payment gateway is not configured. Contact support." }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Fetch the persisted order to get authoritative pricing
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number, advance_amount_paise, total_amount_paise, payment_status, order_status, portrait_type, size, finish")
      .eq("order_number", orderNumber)
      .maybeSingle()

    if (fetchError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Reject if already paid
    if (order.payment_status === "ADVANCE_PAID" || order.payment_status === "FULLY_PAID") {
      return new Response(
        JSON.stringify({ error: "Order advance has already been paid." }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Re-verify pricing server-side — never trust client amounts
    const verified = calculateAuthoritativePricing(
      order.portrait_type as any,
      order.size as any,
      order.finish as any,
    )

    if (verified.advancePaise !== Number(order.advance_amount_paise)) {
      return new Response(
        JSON.stringify({ error: "Pricing mismatch detected. Please restart checkout." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Create Razorpay order via their REST API
    const razorpayAuth = btoa(`${razorpayKeyId}:${razorpayKeySecret}`)
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${razorpayAuth}`,
      },
      body: JSON.stringify({
        amount: Number(order.advance_amount_paise),
        currency: "INR",
        receipt: orderNumber,
        notes: {
          teshart_order_number: orderNumber,
          teshart_order_id: order.id,
          payment_stage: "advance",
        },
      }),
    })

    if (!razorpayResponse.ok) {
      const razorpayError = await razorpayResponse.text()
      console.error("Razorpay order creation failed:", razorpayError)
      return new Response(
        JSON.stringify({ error: "Payment gateway error. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const razorpayOrder = await razorpayResponse.json()

    // Insert a PENDING payment record (idempotent via gateway_order_id uniqueness)
    // This ensures we have a record even if the browser closes before verification
    const { error: paymentInsertError } = await supabase
      .from("payments")
      .upsert(
        {
          order_id: order.id,
          gateway: "razorpay",
          gateway_order_id: razorpayOrder.id,
          amount_paise: Number(order.advance_amount_paise),
          currency: "INR",
          payment_stage: "advance",
          status: "PENDING",
          idempotency_key: `advance_${orderNumber}`,
        },
        { onConflict: "idempotency_key", ignoreDuplicates: true }
      )

    if (paymentInsertError) {
      console.error("Payment record insert failed:", paymentInsertError.message)
      // Non-fatal: payment record write failure doesn't block the checkout modal
    }

    // Update order status to PAYMENT_PENDING
    await supabase
      .from("orders")
      .update({ order_status: "PAYMENT_PENDING", payment_status: "PENDING" })
      .eq("id", order.id)

    return new Response(
      JSON.stringify({
        razorpayOrderId: razorpayOrder.id,
        razorpayKeyId: razorpayKeyId,
        advanceAmountPaise: Number(order.advance_amount_paise),
        currency: "INR",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("create-razorpay-order error:", (err as Error).message)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

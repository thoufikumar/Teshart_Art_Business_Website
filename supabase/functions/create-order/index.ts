import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { calculateAuthoritativePricing, isSupportedConfiguration } from "../_shared/pricing.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-idempotency-key, x-application, *",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface CreateOrderPayload {
  portraitType: "single" | "duo" | "family"
  size: "A5" | "A4" | "A3"
  finish: "unframed" | "framed"
  customer: {
    fullName: string
    mobile: string
    email?: string
  }
  delivery: {
    addressLine: string
    city: string
    state: string
    pincode: string
    instructions?: string
  }
  photos?: Array<{
    storagePath: string
    originalFilename: string
    mimeType: string
    fileSizeBytes: number
    isPrimary?: boolean
  }>
  idempotencyKey?: string
}

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

    const payload: CreateOrderPayload = await req.json()

    // 1. Validate Product Configuration
    if (!isSupportedConfiguration(payload.portraitType, payload.size, payload.finish)) {
      return new Response(
        JSON.stringify({ error: `Unsupported product configuration: ${payload.portraitType}/${payload.size}/${payload.finish}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 2. Validate Contact Details
    if (!payload.customer?.fullName?.trim()) {
      return new Response(JSON.stringify({ error: "Full name is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const cleanMobile = payload.customer.mobile.replace(/\D/g, "")
    if (cleanMobile.length < 10 || cleanMobile.length > 12) {
      return new Response(JSON.stringify({ error: "Invalid mobile number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const cleanPincode = payload.delivery?.pincode?.trim()
    if (!cleanPincode || !/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      return new Response(JSON.stringify({ error: "Invalid 6-digit Indian pincode" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 3. Recalculate Authoritative Pricing (NEVER trust client price)
    const pricing = calculateAuthoritativePricing(payload.portraitType, payload.size, payload.finish)

    // 4. Initialize Supabase Service Role Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // 5. Idempotency Check
    const idempotencyKey = payload.idempotencyKey || req.headers.get("x-idempotency-key")
    if (idempotencyKey) {
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, order_number, total_amount_paise, advance_amount_paise, remaining_amount_paise, order_status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle()

      if (existingOrder) {
        return new Response(
          JSON.stringify({
            orderNumber: existingOrder.order_number,
            orderStatus: existingOrder.order_status,
            totalAmountInr: Number(existingOrder.total_amount_paise) / 100,
            advancePayableInr: Number(existingOrder.advance_amount_paise) / 100,
            remainingOnDeliveryInr: Number(existingOrder.remaining_amount_paise) / 100,
            isExisting: true,
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    // 6. Generate Tracking Token & Hash Server-Side
    const tokenBytes = new Uint8Array(32)
    crypto.getRandomValues(tokenBytes)
    const rawTrackingToken = Array.from(tokenBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const encoded = new TextEncoder().encode(rawTrackingToken)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
    const trackingTokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    // 7. Atomic Order Number Generation
    const { data: orderNumberData, error: seqError } = await supabase.rpc("generate_next_order_number", { prefix: "TSH" })
    const orderNumber = seqError || !orderNumberData
      ? `TSH-${Date.now().toString().slice(-6)}`
      : orderNumberData

    // 8. Lookup or Create Customer (Normalized Mobile)
    let customerId: string | null = null
    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("mobile", cleanMobile)
      .maybeSingle()

    if (existingCustomer) {
      customerId = existingCustomer.id
    } else {
      const { data: newCustomer, error: custError } = await supabase
        .from("customers")
        .insert({
          full_name: payload.customer.fullName.trim(),
          mobile: cleanMobile,
          email: payload.customer.email?.trim() || null,
        })
        .select("id")
        .single()

      if (!custError && newCustomer) {
        customerId = newCustomer.id
      }
    }

    // 9. Insert Order Record
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        portrait_type: payload.portraitType,
        size: payload.size,
        finish: payload.finish,
        pricing_snapshot: {
          variantId: pricing.variantId,
          portraitType: pricing.portraitType,
          size: pricing.size,
          finish: pricing.finish,
          unframedBasePriceInr: pricing.unframedBasePriceInr,
          productPriceInr: pricing.productPriceInr,
          framingDiffInr: pricing.framingDiffInr,
          shippingFeeInr: pricing.shippingFeeInr,
          totalAmountInr: pricing.totalAmountInr,
          advancePayableInr: pricing.advancePayableInr,
          remainingOnDeliveryInr: pricing.remainingOnDeliveryInr,
        },
        subtotal_amount_paise: pricing.subtotalPaise,
        delivery_fee_paise: pricing.deliveryFeePaise,
        total_amount_paise: pricing.totalPaise,
        advance_amount_paise: pricing.advancePaise,
        remaining_amount_paise: pricing.remainingPaise,
        currency: "INR",
        customer_name_snapshot: payload.customer.fullName.trim(),
        customer_mobile_snapshot: cleanMobile,
        customer_email_snapshot: payload.customer.email?.trim() || null,
        delivery_address_line: payload.delivery.addressLine.trim(),
        delivery_city: payload.delivery.city.trim(),
        delivery_state: payload.delivery.state.trim(),
        delivery_pincode: cleanPincode,
        instructions: payload.delivery.instructions?.trim() || "",
        order_status: "DRAFT",
        payment_status: "UNPAID",
        payment_method: "upi",
        tracking_token_hash: trackingTokenHash,
        idempotency_key: idempotencyKey || null,
      })
      .select("id")
      .single()

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: `Failed to create order: ${orderError?.message}` }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 10. Insert Photos if attached
    if (payload.photos && payload.photos.length > 0) {
      const photoInserts = payload.photos.map((p) => ({
        order_id: order.id,
        storage_path: p.storagePath,
        original_filename: p.originalFilename,
        mime_type: p.mimeType,
        file_size_bytes: p.fileSizeBytes,
        is_primary: Boolean(p.isPrimary),
      }))

      await supabase.from("order_photos").insert(photoInserts)
    }

    // 11. Initial Status History Audit Row
    await supabase.from("order_status_history").insert({
      order_id: order.id,
      from_status: null,
      to_status: "DRAFT",
      changed_by: "system_create_order",
      notes: "Order draft initiated by customer",
    })

    // 12. Return Safe Confirmation Response (raw tracking token returned ONCE)
    return new Response(
      JSON.stringify({
        orderNumber,
        trackingToken: rawTrackingToken,
        orderStatus: "DRAFT",
        pricing: {
          totalAmountInr: pricing.totalAmountInr,
          advancePayableInr: pricing.advancePayableInr,
          remainingOnDeliveryInr: pricing.remainingOnDeliveryInr,
          currency: "INR",
        },
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

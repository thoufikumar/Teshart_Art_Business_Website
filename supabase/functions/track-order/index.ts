import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-application, *",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

    const { trackingToken } = await req.json()

    if (!trackingToken || typeof trackingToken !== "string" || !/^[0-9a-f]{64}$/.test(trackingToken)) {
      return new Response(JSON.stringify({ error: "Invalid or missing tracking token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Compute SHA-256 hash server-side
    const encoded = new TextEncoder().encode(trackingToken)
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoded)
    const tokenHash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // Query order strictly by tracking_token_hash
    const { data: order, error } = await supabase
      .from("orders")
      .select(`
        id,
        order_number,
        portrait_type,
        size,
        finish,
        order_status,
        payment_status,
        created_at,
        order_status_history (
          to_status,
          created_at
        ),
        shipments (
          courier_name,
          tracking_number,
          tracking_url,
          dispatched_at,
          delivered_at
        )
      `)
      .eq("tracking_token_hash", tokenHash)
      .maybeSingle()

    if (error || !order) {
      // Standard 404: Never reveal database errors or user enumeration details
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Return ONLY customer-safe data
    // NEVER expose: customer_name, mobile, address, email, token hash, admin notes, payment gateway IDs
    const safeResponse = {
      orderNumber: order.order_number,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      portraitType: order.portrait_type,
      size: order.size,
      finish: order.finish,
      createdAt: order.created_at,
      statusTimeline: (order.order_status_history || []).map((h: any) => ({
        status: h.to_status,
        timestamp: h.created_at,
      })),
      shipment: order.shipments?.[0]
        ? {
          courierName: order.shipments[0].courier_name,
          trackingNumber: order.shipments[0].tracking_number,
          trackingUrl: order.shipments[0].tracking_url,
          dispatchedAt: order.shipments[0].dispatched_at,
          deliveredAt: order.shipments[0].delivered_at,
        }
        : null,
    }

    return new Response(JSON.stringify(safeResponse), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal tracking service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

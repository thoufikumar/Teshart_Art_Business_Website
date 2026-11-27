/**
 * OrderRepository.ts — Secure Application Repository for Orders
 *
 * Implements SOLID principles:
 * - Single Responsibility: Dispatches order creation, tracking, and payment to secure Edge Functions.
 * - Dependency Inversion: Public client never queries sensitive tables directly with anon key.
 * - Least Privilege: All mutations and sensitive queries happen via server-side functions.
 */

import { supabase } from "../client"
import type { OrderStatus, PortraitType, PortraitSize, PortraitFinish } from "../types"
import { DatabaseError, OrderNotFoundError, ValidationError } from "@/shared/errors/AppError"
import { ok, err, type Result } from "@/shared/types/result"

export interface CreateOrderInput {
  portraitType: PortraitType
  size: PortraitSize
  finish: PortraitFinish
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

export interface CreateOrderOutput {
  orderNumber: string
  trackingToken: string
  orderStatus: OrderStatus
  pricing: {
    totalAmountInr: number
    advancePayableInr: number
    remainingOnDeliveryInr: number
    currency: string
  }
}

export interface CustomerTrackingOutput {
  orderNumber: string
  orderStatus: OrderStatus
  paymentStatus: string
  portraitType: PortraitType
  size: PortraitSize
  finish: PortraitFinish
  createdAt: string
  statusTimeline: Array<{
    status: string
    timestamp: string
  }>
  shipment: {
    courierName: string
    trackingNumber: string
    trackingUrl: string | null
    dispatchedAt: string
    deliveredAt: string | null
  } | null
}

export interface RazorpayOrderOutput {
  razorpayOrderId: string
  razorpayKeyId: string
  advanceAmountPaise: number
  currency: string
}

export interface PaymentVerificationInput {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
  orderNumber: string
}

export interface AttachPhotoInput {
  trackingToken: string
  storagePath: string
  originalFilename: string
  mimeType: string
  fileSizeBytes: number
}

async function extractFunctionErrorMessage(error: any): Promise<string> {
  if (!error) return "Unknown error"
  try {
    if (error.context && typeof error.context.json === "function") {
      const body = await error.context.json()
      if (body?.error) return body.error
      if (body?.message) return body.message
    }
  } catch {}
  return error.message || String(error)
}

export class OrderRepository {
  /**
   * Securely create a new order via the `create-order` Edge Function.
   * Recalculates authoritative pricing server-side; client prices are ignored.
   */
  async createViaFunction(
    input: CreateOrderInput,
  ): Promise<Result<CreateOrderOutput, ValidationError | DatabaseError>> {
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: input,
    })

    if (error) {
      const msg = await extractFunctionErrorMessage(error)
      return err(new DatabaseError("create-order", msg))
    }

    if (!data || data.error) {
      return err(new ValidationError(data?.error || "Failed to create order"))
    }

    return ok(data as CreateOrderOutput)
  }

  /**
   * Securely retrieve tracking details via the `track-order` Edge Function.
   * Only returns sanitized, non-sensitive milestone and logistics info.
   */
  async trackViaFunction(
    trackingToken: string,
  ): Promise<Result<CustomerTrackingOutput, OrderNotFoundError | DatabaseError>> {
    const { data, error } = await supabase.functions.invoke("track-order", {
      body: { trackingToken },
    })

    if (error) {
      const msg = await extractFunctionErrorMessage(error)
      return err(new DatabaseError("track-order", msg))
    }

    if (!data || data.error) {
      return err(new OrderNotFoundError("invalid tracking token"))
    }

    return ok(data as CustomerTrackingOutput)
  }

  /**
   * Create a Razorpay payment order for the advance amount of a persisted order.
   * Returns the razorpayOrderId and razorpayKeyId to open the checkout modal.
   */
  async createRazorpayOrder(
    orderNumber: string,
  ): Promise<Result<RazorpayOrderOutput, DatabaseError | ValidationError>> {
    const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
      body: { orderNumber },
    })

    if (error) {
      const msg = await extractFunctionErrorMessage(error)
      return err(new DatabaseError("create-razorpay-order", msg))
    }

    if (!data || data.error) {
      return err(new ValidationError(data?.error || "Failed to create payment order"))
    }

    return ok(data as RazorpayOrderOutput)
  }

  /**
   * Verify the Razorpay payment signature server-side.
   * NEVER marks an order as paid based solely on the browser callback.
   */
  async verifyPayment(
    input: PaymentVerificationInput,
  ): Promise<Result<{ success: boolean; orderNumber: string }, DatabaseError | ValidationError>> {
    const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
      body: input,
    })

    if (error) {
      const msg = await extractFunctionErrorMessage(error)
      return err(new DatabaseError("verify-razorpay-payment", msg))
    }

    if (!data || data.error) {
      return err(new ValidationError(data?.error || "Payment verification failed"))
    }

    return ok({ success: true, orderNumber: input.orderNumber })
  }

  /**
   * Attach a successfully uploaded photo to an existing order.
   * Called after create-order returns the trackingToken and the photo
   * has been uploaded via the signed URL from authorize-photo-upload.
   */
  async attachPhoto(
    input: AttachPhotoInput,
  ): Promise<Result<void, DatabaseError | ValidationError>> {
    const { data, error } = await supabase.functions.invoke("attach-photo-to-order", {
      body: input,
    })

    if (error) {
      return err(new DatabaseError("attach-photo-to-order edge function", error.message))
    }

    if (!data || data.error) {
      return err(new ValidationError(data?.error || "Failed to attach photo to order"))
    }

    return ok(undefined)
  }

  /**
   * Authenticated Administrator lookup by order number.
   * Uses RLS policy that verifies public.is_admin().
   */
  async findAdminOrderByNumber(
    orderNumber: string,
  ): Promise<Result<unknown, DatabaseError | OrderNotFoundError>> {
    const { data: row, error } = await supabase
      .from("orders")
      .select("*, order_photos(*), shipments(*), order_status_history(*)")
      .eq("order_number", orderNumber)
      .maybeSingle()

    if (error) {
      return err(new DatabaseError("admin find order", error))
    }
    if (!row) return err(new OrderNotFoundError(orderNumber))
    return ok(row)
  }
}

/** Singleton instance */
export const orderRepository = new OrderRepository()

/**
 * types.ts — Supabase Database Type Definitions
 *
 * Aligned with the production-grade schema in migrations:
 * - 20261120000001_initial_schema.sql
 * - 20261120000002_rls_policies.sql
 * - 20261120000003_storage_buckets.sql
 */

// ─── Enumerations ────────────────────────────────────────────────────────────

export type OrderStatus =
  | "DRAFT"
  | "CONFIGURED"
  | "PAYMENT_PENDING"
  | "PAYMENT_VERIFIED"
  | "ORDER_CONFIRMED"
  | "ARTWORK_QUEUED"
  | "IN_PROGRESS"
  | "QUALITY_CHECK"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "PHOTO_CHANGE_REQUIRED"
  | "PAYMENT_FAILED"
  | "CUSTOMER_UNRESPONSIVE"
  | "ON_HOLD"
  | "CANCELLED"
  | "DELIVERY_FAILED"
  | "RETURNED"
  | "REFUND_REQUESTED"
  | "REFUNDED"

export type PaymentStatus =
  | "UNPAID"
  | "PENDING"
  | "ADVANCE_PAID"
  | "FULLY_PAID"
  | "FAILED"
  | "REFUNDED"

export type PaymentStage = "advance" | "balance" | "full" | "refund"

export type PaymentMethod = "upi" | "card" | "netbanking"

export type PortraitType = "single" | "duo" | "family"
export type PortraitSize = "A5" | "A4" | "A3"
export type PortraitFinish = "unframed" | "framed"

export type AdminRole = "super_admin" | "artist" | "support"

// ─── Immutable Pricing Snapshot ──────────────────────────────────────────────

export type PricingSnapshot = {
  variantId: string
  portraitType: PortraitType
  size: PortraitSize
  finish: PortraitFinish
  unframedBasePriceInr: number
  productPriceInr: number
  framingDiffInr: number
  shippingFeeInr: number
  totalAmountInr: number
  advancePayableInr: number
  remainingOnDeliveryInr: number
}

// ─── Table Rows, Inserts, & Updates ──────────────────────────────────────────

export type CustomerRow = {
  id: string
  full_name: string
  mobile: string
  email: string | null
  created_at: string
  updated_at: string
}
export type CustomerInsert = Omit<CustomerRow, "id" | "created_at" | "updated_at">
export type CustomerUpdate = Partial<CustomerInsert>

export type OrderRow = {
  id: string
  order_number: string
  customer_id: string | null
  portrait_type: PortraitType
  size: PortraitSize
  finish: PortraitFinish
  pricing_snapshot: PricingSnapshot
  subtotal_amount_paise: number
  delivery_fee_paise: number
  total_amount_paise: number
  advance_amount_paise: number
  remaining_amount_paise: number
  currency: string
  customer_name_snapshot: string
  customer_mobile_snapshot: string
  customer_email_snapshot: string | null
  delivery_address_line: string
  delivery_city: string
  delivery_state: string
  delivery_pincode: string
  instructions: string
  order_status: OrderStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod
  tracking_token_hash: string
  idempotency_key: string | null
  created_at: string
  updated_at: string
}
export type OrderInsert = Omit<OrderRow, "id" | "created_at" | "updated_at">
export type OrderUpdate = Partial<
  Pick<
    OrderRow,
    | "order_status"
    | "payment_status"
    | "instructions"
    | "updated_at"
  >
>

export type OrderPhotoRow = {
  id: string
  order_id: string
  storage_path: string
  original_filename: string
  mime_type: string
  file_size_bytes: number
  is_primary: boolean
  created_at: string
}
export type OrderPhotoInsert = Omit<OrderPhotoRow, "id" | "created_at">

export type PaymentRow = {
  id: string
  order_id: string
  gateway: string
  gateway_order_id: string
  gateway_payment_id: string | null
  amount_paise: number
  currency: string
  payment_stage: PaymentStage
  status: PaymentStatus
  idempotency_key: string
  verified_at: string | null
  created_at: string
  updated_at: string
}
export type PaymentInsert = Omit<PaymentRow, "id" | "created_at" | "updated_at">
export type PaymentUpdate = Partial<
  Pick<PaymentRow, "gateway_payment_id" | "status" | "verified_at" | "updated_at">
>

export type OrderStatusHistoryRow = {
  id: string
  order_id: string
  from_status: string | null
  to_status: string
  changed_by: string
  notes: string | null
  created_at: string
}
export type OrderStatusHistoryInsert = Omit<OrderStatusHistoryRow, "id" | "created_at">

export type ShipmentRow = {
  id: string
  order_id: string
  courier_name: string
  tracking_number: string
  tracking_url: string | null
  dispatched_at: string
  delivered_at: string | null
  created_at: string
  updated_at: string
}
export type ShipmentInsert = Omit<ShipmentRow, "id" | "created_at" | "updated_at">

export type AdminProfileRow = {
  id: string
  role: AdminRole
  full_name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─── Database Type ───────────────────────────────────────────────────────────

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: CustomerRow
        Insert: CustomerInsert
        Update: CustomerUpdate
        Relationships: []
      }
      orders: {
        Row: OrderRow
        Insert: OrderInsert
        Update: OrderUpdate
        Relationships: []
      }
      order_photos: {
        Row: OrderPhotoRow
        Insert: OrderPhotoInsert
        Update: Partial<OrderPhotoInsert>
        Relationships: []
      }
      payments: {
        Row: PaymentRow
        Insert: PaymentInsert
        Update: PaymentUpdate
        Relationships: []
      }
      order_status_history: {
        Row: OrderStatusHistoryRow
        Insert: OrderStatusHistoryInsert
        Update: Partial<OrderStatusHistoryInsert>
        Relationships: []
      }
      shipments: {
        Row: ShipmentRow
        Insert: ShipmentInsert
        Update: Partial<ShipmentInsert>
        Relationships: []
      }
      admin_profiles: {
        Row: AdminProfileRow
        Insert: Omit<AdminProfileRow, "created_at" | "updated_at">
        Update: Partial<AdminProfileRow>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      generate_next_order_number: {
        Args: { prefix?: string }
        Returns: string
      }
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

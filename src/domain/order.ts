import { type ArtworkId } from './artworkRegistry'
import {
  type FinishOptionId,
  type PortraitSizeId,
  type PortraitTypeId,
  PORTRAIT_TYPES,
  isSupportedConfiguration,
} from './catalogue'
import { type PriceBreakdown } from './pricing'

/**
 * Explicit backend/domain order lifecycle states per business rules and UX Source of Truth.
 */
export type OrderStatus =
  | 'DRAFT'
  | 'CONFIGURED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFIED'
  | 'ORDER_CONFIRMED'
  | 'ARTWORK_QUEUED'
  | 'IN_PROGRESS'
  | 'QUALITY_CHECK'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  // Exception states
  | 'PHOTO_CHANGE_REQUIRED'
  | 'PAYMENT_FAILED'
  | 'CUSTOMER_UNRESPONSIVE'
  | 'ON_HOLD'
  | 'CANCELLED'
  | 'DELIVERY_FAILED'
  | 'RETURNED'
  | 'REFUND_REQUESTED'
  | 'REFUNDED'

export type PaymentStatus = 'UNPAID' | 'PENDING' | 'ADVANCE_PAID' | 'FULLY_PAID' | 'FAILED' | 'REFUNDED'

export type PaymentMethodId = 'upi' | 'card' | 'netbanking'

export interface PaymentMethodOption {
  id: PaymentMethodId
  title: string
  description: string
  iconName: 'phone' | 'card' | 'bank'
}

export const PAYMENT_METHODS: readonly PaymentMethodOption[] = [
  {
    id: 'upi',
    title: 'UPI (Google Pay, PhonePe, Paytm, etc.)',
    description: 'Fast and secure',
    iconName: 'phone',
  },
  {
    id: 'card',
    title: 'Debit / Credit Card',
    description: 'Visa, MasterCard, Rupay',
    iconName: 'card',
  },
  {
    id: 'netbanking',
    title: 'Net Banking',
    description: 'All major banks supported',
    iconName: 'bank',
  },
] as const

export interface UploadedPhotoState {
  sourceType: 'upload' | 'sample' | 'none'
  previewUrl: string | null
  sampleArtworkId?: ArtworkId
  fileName?: string
  fileSizeBytes?: number
  mimeType?: string
  storageReference?: string
}

export interface DeliveryDetails {
  fullName: string
  mobile: string
  email?: string
  addressLine: string
  city: string
  state: string
  pincode: string
  instructions: string
}

export interface OrderConfiguration {
  portraitType: PortraitTypeId
  size: PortraitSizeId
  finish: FinishOptionId
}

export interface OrderDraft {
  configuration: OrderConfiguration
  photo: UploadedPhotoState
  delivery: DeliveryDetails
  paymentMethod: PaymentMethodId
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  orderReference?: string
}

export interface ConfirmedOrderRecord {
  id: string
  orderNumber: string
  configuration: OrderConfiguration
  pricingSnapshot: PriceBreakdown
  delivery: DeliveryDetails
  photoReference: string | null
  orderStatus: OrderStatus
  paymentStatus: PaymentStatus
  createdAtIso: string
}

export const INITIAL_ORDER_DRAFT: OrderDraft = {
  configuration: {
    portraitType: 'single',
    size: 'A5',
    finish: 'unframed',
  },
  photo: {
    sourceType: 'none',
    previewUrl: null,
  },
  delivery: {
    fullName: '',
    mobile: '',
    email: '',
    addressLine: '',
    city: '',
    state: '',
    pincode: '',
    instructions: '',
  },
  paymentMethod: 'upi',
  orderStatus: 'DRAFT',
  paymentStatus: 'UNPAID',
}

/**
 * Ensures that when a user changes portraitType (e.g., from Single A5 to Family),
 * the selected size is coerced to the first supported size for that portraitType
 * (e.g., Family A4) so an unsupported combination can never exist in state.
 */
export function normalizeOrderConfiguration(
  nextType: PortraitTypeId,
  currentSize: PortraitSizeId,
  currentFinish: FinishOptionId,
): OrderConfiguration {
  if (isSupportedConfiguration(nextType, currentSize, currentFinish)) {
    return {
      portraitType: nextType,
      size: currentSize,
      finish: currentFinish,
    }
  }

  const typeDef = PORTRAIT_TYPES.find(t => t.id === nextType)
  const fallbackSize: PortraitSizeId = typeDef?.availableSizes[0] ?? 'A4'
  return {
    portraitType: nextType,
    size: fallbackSize,
    finish: currentFinish,
  }
}

export interface CustomerFacingMilestone {
  id: string
  label: string
}

export const CUSTOMER_TRACKING_MILESTONES: readonly CustomerFacingMilestone[] = [
  { id: 'confirmed', label: 'Order confirmed' },
  { id: 'assigned', label: 'Artist assigned' },
  { id: 'in_progress', label: 'Drawing in progress' },
  { id: 'quality_check', label: 'Quality check' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
] as const


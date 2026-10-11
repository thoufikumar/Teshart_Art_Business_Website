import {
  type FinishOptionId,
  type PortraitSizeId,
  type PortraitTypeId,
  findProductVariant,
  isSupportedConfiguration,
} from './catalogue'

export class UnsupportedProductConfigurationError extends Error {
  public readonly portraitType: string
  public readonly size: string
  public readonly finish: string

  constructor(portraitType: string, size: string, finish: string) {
    super(
      `Unsupported product configuration: portraitType="${portraitType}", size="${size}", finish="${finish}"`,
    )
    this.name = 'UnsupportedProductConfigurationError'
    this.portraitType = portraitType
    this.size = size
    this.finish = finish
  }
}

export type AdvancePaymentMode =
  | { type: 'percentage'; ratio: number; rounding?: 'ceil' | 'round' | 'floor' }
  | { type: 'fixed'; amountInr: number }

export interface PricingPolicy {
  shippingFeeInr: number
  advancePolicy: AdvancePaymentMode
}

/**
 * Default configurable pricing policy.
 * Neither shipping nor advance ratio is hardcoded into component logic;
 * callers can override this policy or update this configuration in one place.
 */
export const DEFAULT_PRICING_POLICY: PricingPolicy = {
  shippingFeeInr: 0,
  advancePolicy: {
    type: 'percentage',
    ratio: 0.5,
    rounding: 'ceil',
  },
}

export interface PriceBreakdown {
  variantId: string
  portraitType: PortraitTypeId
  size: PortraitSizeId
  finish: FinishOptionId
  unframedBasePriceInr: number
  productPriceInr: number
  framingDiffInr: number
  shippingFeeInr: number
  totalAmountInr: number
  advancePayableInr: number
  remainingOnDeliveryInr: number
}

/**
 * Returns the exact authoritative price (in INR) for a valid (portraitType, size, finish) tuple.
 * Throws UnsupportedProductConfigurationError if the combination is not supported (e.g. family + A5)
 * or if any input is invalid.
 */
export function getVariantPriceInr(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId,
): number {
  const variant = findProductVariant(portraitType, size, finish)
  if (!variant) {
    throw new UnsupportedProductConfigurationError(
      String(portraitType),
      String(size),
      String(finish),
    )
  }
  return variant.priceInr
}

/**
 * Returns the difference between the framed and unframed variant price for a given (portraitType, size).
 * Note: This is derived strictly from the explicit catalogue variant prices, never a generic surcharge.
 */
export function getFramingPriceDifferenceInr(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
): number {
  const unframedPrice = getVariantPriceInr(portraitType, size, 'unframed')
  const framedPrice = getVariantPriceInr(portraitType, size, 'framed')
  return framedPrice - unframedPrice
}

/**
 * Calculates the advance amount based on a configurable AdvancePaymentMode.
 */
export function calculateAdvanceAmountInr(
  totalAmountInr: number,
  advancePolicy: AdvancePaymentMode = DEFAULT_PRICING_POLICY.advancePolicy,
): number {
  if (!Number.isFinite(totalAmountInr) || totalAmountInr < 0) {
    throw new Error(`Invalid totalAmountInr: ${String(totalAmountInr)}`)
  }
  if (totalAmountInr === 0) return 0

  if (advancePolicy.type === 'fixed') {
    if (!Number.isFinite(advancePolicy.amountInr) || advancePolicy.amountInr < 0) {
      throw new Error(`Invalid fixed advance amount: ${String(advancePolicy.amountInr)}`)
    }
    return Math.min(totalAmountInr, Math.round(advancePolicy.amountInr))
  }

  const { ratio, rounding = 'ceil' } = advancePolicy
  if (!Number.isFinite(ratio) || ratio <= 0 || ratio > 1) {
    throw new Error(`Invalid advance ratio: ${String(ratio)}. Must be between 0 (exclusive) and 1 (inclusive).`)
  }

  const rawAdvance = totalAmountInr * ratio
  if (rounding === 'floor') return Math.floor(rawAdvance)
  if (rounding === 'round') return Math.round(rawAdvance)
  return Math.ceil(rawAdvance)
}

/**
 * Calculates the full pricing snapshot for a valid product configuration and pricing policy.
 * Rejects unsupported combinations (such as family + A5) by throwing UnsupportedProductConfigurationError.
 */
export function calculateOrderPricing(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId,
  policy: PricingPolicy = DEFAULT_PRICING_POLICY,
): PriceBreakdown {
  if (!isSupportedConfiguration(portraitType, size, finish)) {
    throw new UnsupportedProductConfigurationError(
      String(portraitType),
      String(size),
      String(finish),
    )
  }

  const variant = findProductVariant(portraitType, size, finish)!
  const unframedVariant = findProductVariant(portraitType, size, 'unframed')!

  if (!Number.isFinite(policy.shippingFeeInr) || policy.shippingFeeInr < 0) {
    throw new Error(`Invalid shipping fee: ${String(policy.shippingFeeInr)}`)
  }

  const unframedBasePriceInr = unframedVariant.priceInr
  const productPriceInr = variant.priceInr
  const framingDiffInr = productPriceInr - unframedBasePriceInr
  const shippingFeeInr = policy.shippingFeeInr
  const totalAmountInr = productPriceInr + shippingFeeInr
  const advancePayableInr = calculateAdvanceAmountInr(totalAmountInr, policy.advancePolicy)
  const remainingOnDeliveryInr = totalAmountInr - advancePayableInr

  return {
    variantId: variant.id,
    portraitType,
    size,
    finish,
    unframedBasePriceInr,
    productPriceInr,
    framingDiffInr,
    shippingFeeInr,
    totalAmountInr,
    advancePayableInr,
    remainingOnDeliveryInr,
  }
}

export function formatInr(amountInr: number): string {
  return '₹' + amountInr.toLocaleString('en-IN')
}


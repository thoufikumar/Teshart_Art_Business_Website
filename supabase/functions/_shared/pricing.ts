/**
 * Server-Side Pricing Engine — Deno / Edge Function compatible
 *
 * Implements authoritative price recalculation for create-order.
 * Preserves exact catalogue variants, advance payment policies (50% ceil),
 * and Indian Rupee amounts matching domain/pricing.ts.
 */

export type PortraitTypeId = "single" | "duo" | "family"
export type PortraitSizeId = "A5" | "A4" | "A3"
export type FinishOptionId = "unframed" | "framed"

export interface ProductVariant {
  id: string
  portraitType: PortraitTypeId
  size: PortraitSizeId
  finish: FinishOptionId
  priceInr: number
}

export const PRODUCT_VARIANTS: readonly ProductVariant[] = [
  // Single portrait
  { id: "single-A5-unframed", portraitType: "single", size: "A5", finish: "unframed", priceInr: 599 },
  { id: "single-A5-framed", portraitType: "single", size: "A5", finish: "framed", priceInr: 799 },
  { id: "single-A4-unframed", portraitType: "single", size: "A4", finish: "unframed", priceInr: 899 },
  { id: "single-A4-framed", portraitType: "single", size: "A4", finish: "framed", priceInr: 1199 },
  { id: "single-A3-unframed", portraitType: "single", size: "A3", finish: "unframed", priceInr: 1499 },
  { id: "single-A3-framed", portraitType: "single", size: "A3", finish: "framed", priceInr: 1899 },

  // Duo portrait
  { id: "duo-A5-unframed", portraitType: "duo", size: "A5", finish: "unframed", priceInr: 999 },
  { id: "duo-A5-framed", portraitType: "duo", size: "A5", finish: "framed", priceInr: 1199 },
  { id: "duo-A4-unframed", portraitType: "duo", size: "A4", finish: "unframed", priceInr: 1499 },
  { id: "duo-A4-framed", portraitType: "duo", size: "A4", finish: "framed", priceInr: 1899 },
  { id: "duo-A3-unframed", portraitType: "duo", size: "A3", finish: "unframed", priceInr: 2499 },
  { id: "duo-A3-framed", portraitType: "duo", size: "A3", finish: "framed", priceInr: 2899 },

  // Family portrait (A5 is unsupported)
  { id: "family-A4-unframed", portraitType: "family", size: "A4", finish: "unframed", priceInr: 2499 },
  { id: "family-A4-framed", portraitType: "family", size: "A4", finish: "framed", priceInr: 2899 },
  { id: "family-A3-unframed", portraitType: "family", size: "A3", finish: "unframed", priceInr: 3499 },
  { id: "family-A3-framed", portraitType: "family", size: "A3", finish: "framed", priceInr: 3999 },
] as const

export interface ServerPriceBreakdown {
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
  // Integer paise amounts (1 INR = 100 paise)
  subtotalPaise: number
  deliveryFeePaise: number
  totalPaise: number
  advancePaise: number
  remainingPaise: number
}

export function findProductVariant(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId,
): ProductVariant | undefined {
  return PRODUCT_VARIANTS.find(
    (v) =>
      v.portraitType === portraitType && v.size === size && v.finish === finish,
  )
}

export function isSupportedConfiguration(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId = "unframed",
): boolean {
  return PRODUCT_VARIANTS.some(
    (v) =>
      v.portraitType === portraitType && v.size === size && v.finish === finish,
  )
}

export function calculateAuthoritativePricing(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId,
  shippingFeeInr: number = 0,
): ServerPriceBreakdown {
  const variant = findProductVariant(portraitType, size, finish)
  if (!variant) {
    throw new Error(
      `Unsupported configuration: ${portraitType} - ${size} - ${finish}`,
    )
  }

  const unframedVariant = findProductVariant(portraitType, size, "unframed")!
  const unframedBasePriceInr = unframedVariant.priceInr
  const productPriceInr = variant.priceInr
  const framingDiffInr = productPriceInr - unframedBasePriceInr
  const totalAmountInr = productPriceInr + shippingFeeInr

  // 50% advance, ceil rounded
  const advancePayableInr = Math.ceil(totalAmountInr * 0.5)
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
    subtotalPaise: productPriceInr * 100,
    deliveryFeePaise: shippingFeeInr * 100,
    totalPaise: totalAmountInr * 100,
    advancePaise: advancePayableInr * 100,
    remainingPaise: remainingOnDeliveryInr * 100,
  }
}

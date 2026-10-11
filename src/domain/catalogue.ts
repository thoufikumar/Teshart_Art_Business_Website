import { type ArtworkId } from './artworkRegistry'

export type PortraitTypeId = 'single' | 'duo' | 'family'
export type PortraitSizeId = 'A5' | 'A4' | 'A3'
export type FinishOptionId = 'unframed' | 'framed'

export interface PortraitTypeDefinition {
  id: PortraitTypeId
  title: string
  shortLabel: string
  description: string
  artworkId: ArtworkId
  previewArtworkId: ArtworkId
  availableSizes: readonly PortraitSizeId[]
}

export interface PortraitSizeDefinition {
  id: PortraitSizeId
  dimensionsCm: string
  description: string
  badge?: string
  illustrationWidthClass: string
}

export interface FinishOptionDefinition {
  id: FinishOptionId
  title: string
  shortLabel: string
  description: string
  artworkId: ArtworkId
}

export interface ProductVariant {
  id: string
  portraitType: PortraitTypeId
  size: PortraitSizeId
  finish: FinishOptionId
  priceInr: number
}

export const PORTRAIT_TYPES: readonly PortraitTypeDefinition[] = [
  {
    id: 'single',
    title: 'Single Portrait',
    shortLabel: 'Single',
    description: 'A beautiful portrait of one person.',
    artworkId: 'raw-woman-sketchpad',
    previewArtworkId: 'framed-child',
    availableSizes: ['A5', 'A4', 'A3'],
  },
  {
    id: 'duo',
    title: 'Couple Portrait',
    shortLabel: 'Duo / Couple',
    description: 'A portrait of two people.',
    artworkId: 'raw-couple-closeup',
    previewArtworkId: 'framed-couple',
    availableSizes: ['A5', 'A4', 'A3'],
  },
  {
    id: 'family',
    title: 'Family Portrait',
    shortLabel: 'Family',
    description: 'A portrait of your family.',
    artworkId: 'raw-family-sketch',
    previewArtworkId: 'framed-family',
    availableSizes: ['A4', 'A3'],
  },
] as const

export const PORTRAIT_SIZES: readonly PortraitSizeDefinition[] = [
  {
    id: 'A5',
    dimensionsCm: '14.8 × 21 cm',
    description: 'Perfect for gifting',
    badge: 'Most popular',
    illustrationWidthClass: 'w-10',
  },
  {
    id: 'A4',
    dimensionsCm: '21 × 29.7 cm',
    description: 'Great detail & clarity',
    illustrationWidthClass: 'w-12',
  },
  {
    id: 'A3',
    dimensionsCm: '29.7 × 42 cm',
    description: 'Best for large and framed display',
    illustrationWidthClass: 'w-14',
  },
] as const

export const FINISH_OPTIONS: readonly FinishOptionDefinition[] = [
  {
    id: 'unframed',
    title: 'Standard Finish',
    shortLabel: 'Unframed',
    description: 'Hand-drawn on premium sketch paper.',
    artworkId: 'raw-child-sketch',
  },
  {
    id: 'framed',
    title: 'Framed Portrait',
    shortLabel: 'Framed',
    description: 'Comes with a sleek wooden frame.',
    artworkId: 'framed-child',
  },
] as const

/**
 * Authoritative catalogue variants and complete prices (in INR).
 * Note: Framed prices are complete product prices, never calculated via a generic surcharge.
 * Family A5 is intentionally excluded and unsupported.
 */
export const PRODUCT_VARIANTS: readonly ProductVariant[] = [
  // Single portrait
  { id: 'single-A5-unframed', portraitType: 'single', size: 'A5', finish: 'unframed', priceInr: 599 },
  { id: 'single-A5-framed', portraitType: 'single', size: 'A5', finish: 'framed', priceInr: 799 },
  { id: 'single-A4-unframed', portraitType: 'single', size: 'A4', finish: 'unframed', priceInr: 899 },
  { id: 'single-A4-framed', portraitType: 'single', size: 'A4', finish: 'framed', priceInr: 1199 },
  { id: 'single-A3-unframed', portraitType: 'single', size: 'A3', finish: 'unframed', priceInr: 1499 },
  { id: 'single-A3-framed', portraitType: 'single', size: 'A3', finish: 'framed', priceInr: 1899 },

  // Duo portrait
  { id: 'duo-A5-unframed', portraitType: 'duo', size: 'A5', finish: 'unframed', priceInr: 999 },
  { id: 'duo-A5-framed', portraitType: 'duo', size: 'A5', finish: 'framed', priceInr: 1199 },
  { id: 'duo-A4-unframed', portraitType: 'duo', size: 'A4', finish: 'unframed', priceInr: 1499 },
  { id: 'duo-A4-framed', portraitType: 'duo', size: 'A4', finish: 'framed', priceInr: 1899 },
  { id: 'duo-A3-unframed', portraitType: 'duo', size: 'A3', finish: 'unframed', priceInr: 2499 },
  { id: 'duo-A3-framed', portraitType: 'duo', size: 'A3', finish: 'framed', priceInr: 2899 },

  // Family portrait (A5 is unavailable)
  { id: 'family-A4-unframed', portraitType: 'family', size: 'A4', finish: 'unframed', priceInr: 2499 },
  { id: 'family-A4-framed', portraitType: 'family', size: 'A4', finish: 'framed', priceInr: 2899 },
  { id: 'family-A3-unframed', portraitType: 'family', size: 'A3', finish: 'unframed', priceInr: 3499 },
  { id: 'family-A3-framed', portraitType: 'family', size: 'A3', finish: 'framed', priceInr: 3999 },
] as const

export interface SamplePhotoOption {
  id: string
  label: string
  portraitType: PortraitTypeId
  artworkId: ArtworkId
}

export const SAMPLE_PHOTOS: readonly SamplePhotoOption[] = [
  { id: 'sample-child', label: 'Child portrait', portraitType: 'single', artworkId: 'raw-child-sketch' },
  { id: 'sample-woman', label: 'Woman portrait', portraitType: 'single', artworkId: 'raw-woman-sketchpad' },
  { id: 'sample-couple', label: 'Couple portrait', portraitType: 'duo', artworkId: 'raw-couple-closeup' },
  { id: 'sample-family', label: 'Family portrait', portraitType: 'family', artworkId: 'raw-family-sketch' },
] as const

export interface TestimonialItem {
  id: string
  quote: string
  customerName: string
  rating: number
}

export const TESTIMONIALS: readonly TestimonialItem[] = [
  {
    id: 'testimonial-anu',
    quote: '“Such a wonderful gift for my parents’ anniversary. They cried! It captured my father’s expression so well. Worth every rupee.”',
    customerName: 'Anu',
    rating: 5,
  },
  {
    id: 'testimonial-ishwarya',
    quote: '“I gifted this to my boyfriend on his birthday. He loved it! The detailing is amazing and it looks exactly like the photo I sent.”',
    customerName: 'Ishwarya',
    rating: 5,
  },
  {
    id: 'testimonial-subhashini',
    quote: '“The portrait of my family came out so beautiful. Great communication and on-time delivery. Highly recommended!”',
    customerName: 'Subhashini',
    rating: 5,
  },
] as const

export function getPortraitType(id: PortraitTypeId): PortraitTypeDefinition {
  const found = PORTRAIT_TYPES.find(t => t.id === id)
  if (!found) {
    throw new Error(`Unknown portrait type: ${String(id)}`)
  }
  return found
}

export function getPortraitSize(id: PortraitSizeId): PortraitSizeDefinition {
  const found = PORTRAIT_SIZES.find(s => s.id === id)
  if (!found) {
    throw new Error(`Unknown portrait size: ${String(id)}`)
  }
  return found
}

export function getFinishOption(id: FinishOptionId): FinishOptionDefinition {
  const found = FINISH_OPTIONS.find(f => f.id === id)
  if (!found) {
    throw new Error(`Unknown finish option: ${String(id)}`)
  }
  return found
}

export function getAvailableSizesForType(portraitType: PortraitTypeId): PortraitSizeDefinition[] {
  const typeDef = getPortraitType(portraitType)
  return PORTRAIT_SIZES.filter(size => typeDef.availableSizes.includes(size.id))
}

export function isSupportedConfiguration(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId = 'unframed',
): boolean {
  return PRODUCT_VARIANTS.some(
    v => v.portraitType === portraitType && v.size === size && v.finish === finish,
  )
}

export function findProductVariant(
  portraitType: PortraitTypeId,
  size: PortraitSizeId,
  finish: FinishOptionId,
): ProductVariant | undefined {
  return PRODUCT_VARIANTS.find(
    v => v.portraitType === portraitType && v.size === size && v.finish === finish,
  )
}


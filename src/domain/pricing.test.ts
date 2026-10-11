import {
  FINISH_OPTIONS,
  PORTRAIT_SIZES,
  PORTRAIT_TYPES,
  PRODUCT_VARIANTS,
  findProductVariant,
  getAvailableSizesForType,
  isSupportedConfiguration,
  type FinishOptionId,
  type PortraitSizeId,
  type PortraitTypeId,
} from './catalogue'
import {
  UnsupportedProductConfigurationError,
  calculateAdvanceAmountInr,
  calculateOrderPricing,
  getFramingPriceDifferenceInr,
  getVariantPriceInr,
} from './pricing'
import { normalizeOrderConfiguration } from './order'

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`)
  }
}

function assertThrows(fn: () => unknown, expectedErrorName: string, message: string): void {
  let threw = false
  try {
    fn()
  } catch (err) {
    threw = true
    if (expectedErrorName && err instanceof Error && err.name !== expectedErrorName) {
      throw new Error(
        `${message}: expected error name "${expectedErrorName}", got "${err.name}" (${err.message})`,
      )
    }
  }
  if (!threw) {
    throw new Error(`${message}: expected function to throw, but it succeeded`)
  }
}

export function runPricingAndCatalogueTests(): { passed: number; assertions: string[] } {
  const assertions: string[] = []
  let passed = 0

  const record = (desc: string) => {
    passed += 1
    assertions.push(desc)
  }

  // 1. Authoritative Catalogue Matrix (16 supported combinations)
  const expectedPrices: Array<[PortraitTypeId, PortraitSizeId, FinishOptionId, number]> = [
    // Single portrait
    ['single', 'A5', 'unframed', 599],
    ['single', 'A5', 'framed', 799],
    ['single', 'A4', 'unframed', 899],
    ['single', 'A4', 'framed', 1199],
    ['single', 'A3', 'unframed', 1499],
    ['single', 'A3', 'framed', 1899],
    // Duo portrait
    ['duo', 'A5', 'unframed', 999],
    ['duo', 'A5', 'framed', 1199],
    ['duo', 'A4', 'unframed', 1499],
    ['duo', 'A4', 'framed', 1899],
    ['duo', 'A3', 'unframed', 2499],
    ['duo', 'A3', 'framed', 2899],
    // Family portrait
    ['family', 'A4', 'unframed', 2499],
    ['family', 'A4', 'framed', 2899],
    ['family', 'A3', 'unframed', 3499],
    ['family', 'A3', 'framed', 3999],
  ]

  assertEqual(
    PRODUCT_VARIANTS.length,
    expectedPrices.length,
    'Total number of supported product variants must be exactly 16',
  )
  record('Verified total product variant count (16)')

  for (const [portraitType, size, finish, expectedPrice] of expectedPrices) {
    assertEqual(
      isSupportedConfiguration(portraitType, size, finish),
      true,
      `Combination ${portraitType}/${size}/${finish} must be supported`,
    )
    const price = getVariantPriceInr(portraitType, size, finish)
    assertEqual(
      price,
      expectedPrice,
      `Price for ${portraitType} ${size} ${finish}`,
    )

    const breakdown = calculateOrderPricing(portraitType, size, finish, {
      shippingFeeInr: 0,
      advancePolicy: { type: 'percentage', ratio: 0.5, rounding: 'ceil' },
    })
    assertEqual(breakdown.productPriceInr, expectedPrice, `Breakdown productPriceInr for ${portraitType} ${size} ${finish}`)
    assertEqual(
      breakdown.advancePayableInr + breakdown.remainingOnDeliveryInr,
      breakdown.totalAmountInr,
      `Advance + remaining must equal total for ${portraitType} ${size} ${finish}`,
    )
    record(`Verified ${portraitType} ${size} ${finish} = ₹${expectedPrice}`)
  }

  // 2. Verify framing price difference is not a uniform surcharge (varies: 200, 300, 400, 500)
  assertEqual(getFramingPriceDifferenceInr('single', 'A5'), 200, 'Single A5 framing diff')
  assertEqual(getFramingPriceDifferenceInr('single', 'A4'), 300, 'Single A4 framing diff')
  assertEqual(getFramingPriceDifferenceInr('single', 'A3'), 400, 'Single A3 framing diff')
  assertEqual(getFramingPriceDifferenceInr('duo', 'A5'), 200, 'Duo A5 framing diff')
  assertEqual(getFramingPriceDifferenceInr('duo', 'A4'), 400, 'Duo A4 framing diff')
  assertEqual(getFramingPriceDifferenceInr('duo', 'A3'), 400, 'Duo A3 framing diff')
  assertEqual(getFramingPriceDifferenceInr('family', 'A4'), 400, 'Family A4 framing diff')
  assertEqual(getFramingPriceDifferenceInr('family', 'A3'), 500, 'Family A3 framing diff')
  record('Verified non-uniform complete framed variant price differences')

  // 3. Unsupported combinations: Family A5 (unframed & framed) must be rejected
  assertEqual(
    isSupportedConfiguration('family', 'A5', 'unframed'),
    false,
    'Family A5 unframed must be unsupported',
  )
  assertEqual(
    isSupportedConfiguration('family', 'A5', 'framed'),
    false,
    'Family A5 framed must be unsupported',
  )
  assertEqual(
    findProductVariant('family', 'A5', 'unframed'),
    undefined,
    'findProductVariant(family, A5, unframed) must be undefined',
  )
  assertThrows(
    () => getVariantPriceInr('family', 'A5', 'unframed'),
    UnsupportedProductConfigurationError.name,
    'getVariantPriceInr(family, A5, unframed) must throw UnsupportedProductConfigurationError',
  )
  assertThrows(
    () => getVariantPriceInr('family', 'A5', 'framed'),
    UnsupportedProductConfigurationError.name,
    'getVariantPriceInr(family, A5, framed) must throw UnsupportedProductConfigurationError',
  )
  assertThrows(
    () => calculateOrderPricing('family', 'A5', 'unframed'),
    UnsupportedProductConfigurationError.name,
    'calculateOrderPricing(family, A5, unframed) must throw UnsupportedProductConfigurationError',
  )
  assertThrows(
    () => getFramingPriceDifferenceInr('family', 'A5'),
    UnsupportedProductConfigurationError.name,
    'getFramingPriceDifferenceInr(family, A5) must throw UnsupportedProductConfigurationError',
  )
  record('Verified Family A5 is strictly rejected across all catalogue & pricing functions')

  // 4. Verify available sizes per portrait type & state normalization
  const familySizes = getAvailableSizesForType('family').map(s => s.id)
  assertEqual(familySizes.includes('A5'), false, 'Family available sizes must not include A5')
  assertEqual(familySizes.join(','), 'A4,A3', 'Family available sizes must be A4,A3')

  const normalized = normalizeOrderConfiguration('family', 'A5', 'framed')
  assertEqual(normalized.portraitType, 'family', 'Normalized portraitType')
  assertEqual(normalized.size, 'A4', 'Switching to family from A5 must coerce size to A4')
  assertEqual(normalized.finish, 'framed', 'Switching to family preserves finish')
  record('Verified available sizes & state normalization prevent Family A5 selection')

  // 5. Verify Rolled Artwork is not in FINISH_OPTIONS or catalogue
  const finishIds = FINISH_OPTIONS.map(f => f.id as string)
  assertEqual(finishIds.includes('rolled'), false, 'Rolled artwork must not be in FINISH_OPTIONS')
  assertEqual(PORTRAIT_TYPES.length, 3, 'Must have 3 portrait types (single, duo, family)')
  assertEqual(PORTRAIT_SIZES.length, 3, 'Must have 3 sizes (A5, A4, A3)')
  record('Verified rolled artwork is excluded from finish options')

  // 6. Invalid inputs & runtime guards
  assertThrows(
    () => getVariantPriceInr('single', 'A5', 'rolled' as unknown as FinishOptionId),
    UnsupportedProductConfigurationError.name,
    'Rolled finish must throw UnsupportedProductConfigurationError',
  )
  assertThrows(
    () => getVariantPriceInr('pet' as unknown as PortraitTypeId, 'A4', 'unframed'),
    UnsupportedProductConfigurationError.name,
    'Unknown portrait type must throw UnsupportedProductConfigurationError',
  )
  assertThrows(
    () => getVariantPriceInr('single', 'A2' as unknown as PortraitSizeId, 'unframed'),
    UnsupportedProductConfigurationError.name,
    'Unknown size must throw UnsupportedProductConfigurationError',
  )
  assertThrows(
    () => calculateAdvanceAmountInr(-100),
    'Error',
    'Negative total amount must throw Error',
  )
  assertThrows(
    () => calculateAdvanceAmountInr(1000, { type: 'percentage', ratio: 0 }),
    'Error',
    'Zero advance ratio must throw Error',
  )
  assertThrows(
    () => calculateAdvanceAmountInr(1000, { type: 'percentage', ratio: 1.5 }),
    'Error',
    'Advance ratio > 1 must throw Error',
  )
  assertThrows(
    () =>
      calculateOrderPricing('single', 'A5', 'unframed', {
        shippingFeeInr: -50,
        advancePolicy: { type: 'percentage', ratio: 0.5 },
      }),
    'Error',
    'Negative shipping fee must throw Error',
  )
  record('Verified invalid inputs and out-of-range policies throw descriptive errors')

  // 7. Configurable shipping and advance policies
  const customPolicyPricing = calculateOrderPricing('duo', 'A5', 'unframed', {
    shippingFeeInr: 50,
    advancePolicy: { type: 'fixed', amountInr: 299 },
  })
  assertEqual(customPolicyPricing.productPriceInr, 999, 'Duo A5 unframed price')
  assertEqual(customPolicyPricing.shippingFeeInr, 50, 'Custom shipping fee')
  assertEqual(customPolicyPricing.totalAmountInr, 1049, 'Total with custom shipping')
  assertEqual(customPolicyPricing.advancePayableInr, 299, 'Fixed advance amount')
  assertEqual(customPolicyPricing.remainingOnDeliveryInr, 750, 'Remaining balance with fixed advance')
  record('Verified configurable shipping and advance-payment policies')

  return { passed, assertions }
}


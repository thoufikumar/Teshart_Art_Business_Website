import { type DeliveryDetails, type OrderConfiguration } from './order'
import { isSupportedConfiguration } from './catalogue'

export const MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
export const ALLOWED_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png'] as const
export const MAX_DELIVERY_INSTRUCTIONS_LENGTH = 200

export interface PhotoValidationResult {
  valid: boolean
  error?: string
}

export function validatePhotoFile(file: {
  type: string
  size: number
  name?: string
}): PhotoValidationResult {
  if (!ALLOWED_PHOTO_MIME_TYPES.includes(file.type as (typeof ALLOWED_PHOTO_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: 'Please upload a JPG or PNG image.',
    }
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: 'The selected image file is empty.',
    }
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: 'Image size must be 10MB or smaller.',
    }
  }

  return { valid: true }
}

export type DeliveryValidationErrors = Partial<Record<keyof DeliveryDetails, string>>

export function sanitizePincodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 6)
}

export function isValidIndianMobile(raw: string): boolean {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits)
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digits)
  }
  return false
}

export function isValidIndianPincode(raw: string): boolean {
  return /^[1-9]\d{5}$/.test(raw.trim())
}

export function validateDeliveryDetails(details: DeliveryDetails): {
  valid: boolean
  errors: DeliveryValidationErrors
} {
  const errors: DeliveryValidationErrors = {}

  if (!details.fullName.trim()) {
    errors.fullName = 'Please enter your full name'
  }

  const digits = details.mobile.replace(/\D/g, '')
  if (digits.length < 10 || !isValidIndianMobile(details.mobile)) {
    errors.mobile = 'Enter a valid 10-digit mobile number'
  }

  if (details.email && details.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(details.email.trim())) {
      errors.email = 'Enter a valid email address'
    }
  }

  if (!details.addressLine.trim()) {
    errors.addressLine = 'Please enter your address'
  }

  if (!details.city.trim()) {
    errors.city = 'Required'
  }

  if (!details.state.trim()) {
    errors.state = 'Required'
  }

  if (details.pincode.trim().length !== 6 || !isValidIndianPincode(details.pincode)) {
    errors.pincode = 'Enter a valid 6-digit pincode'
  }

  if (details.instructions.length > MAX_DELIVERY_INSTRUCTIONS_LENGTH) {
    errors.instructions = `Maximum ${MAX_DELIVERY_INSTRUCTIONS_LENGTH} characters allowed`
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateOrderConfiguration(config: OrderConfiguration): {
  valid: boolean
  error?: string
} {
  if (!isSupportedConfiguration(config.portraitType, config.size, config.finish)) {
    return {
      valid: false,
      error: `Selected combination (${config.portraitType} - ${config.size} - ${config.finish}) is not available.`,
    }
  }
  return { valid: true }
}


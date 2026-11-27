/**
 * AppError.ts — Structured application error hierarchy
 *
 * All application errors extend AppError, giving every error:
 * - a machine-readable `code` for programmatic handling
 * - a human-readable `message` for logging and display
 * - optional metadata for debugging
 *
 * Dependency rule: no imports from React, Supabase, domain/, or infrastructure/.
 * This is a pure TypeScript module usable anywhere including Edge Functions.
 */

export type ErrorCode =
  // Validation errors
  | "VALIDATION_ERROR"
  | "INVALID_PHOTO_FORMAT"
  | "INVALID_PHOTO_SIZE"
  | "INVALID_DELIVERY_DETAILS"
  | "INVALID_CONFIGURATION"
  // Order errors
  | "ORDER_NOT_FOUND"
  | "ORDER_ALREADY_EXISTS"
  | "ORDER_STATUS_TRANSITION_INVALID"
  | "PRICING_MISMATCH"
  // Storage errors
  | "PHOTO_UPLOAD_FAILED"
  | "SIGNED_URL_FAILED"
  // Payment errors
  | "PAYMENT_ORDER_CREATION_FAILED"
  | "PAYMENT_VERIFICATION_FAILED"
  | "PAYMENT_SIGNATURE_INVALID"
  | "PAYMENT_DUPLICATE"
  // Infrastructure errors
  | "DATABASE_ERROR"
  | "NETWORK_ERROR"
  | "CONFIGURATION_ERROR"
  // Auth errors
  | "UNAUTHORIZED"
  | "FORBIDDEN"

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly metadata: Record<string, unknown>

  constructor(
    code: ErrorCode,
    message: string,
    metadata: Record<string, unknown> = {},
  ) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.metadata = metadata

    // Maintain correct prototype chain in transpiled environments
    Object.setPrototypeOf(this, new.target.prototype)
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      metadata: this.metadata,
    }
  }
}

// ─── Specific error subclasses ─────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(
    message: string,
    metadata: Record<string, unknown> = {},
  ) {
    super("VALIDATION_ERROR", message, metadata)
    this.name = "ValidationError"
  }
}

export class OrderNotFoundError extends AppError {
  constructor(identifier: string) {
    super("ORDER_NOT_FOUND", `Order not found: ${identifier}`, { identifier })
    this.name = "OrderNotFoundError"
  }
}

export class PricingMismatchError extends AppError {
  constructor(
    expected: number,
    received: number,
  ) {
    super(
      "PRICING_MISMATCH",
      `Price mismatch: server calculated ₹${expected}, client sent ₹${received}`,
      { expected, received },
    )
    this.name = "PricingMismatchError"
  }
}

export class PhotoUploadError extends AppError {
  constructor(reason: string) {
    super("PHOTO_UPLOAD_FAILED", `Photo upload failed: ${reason}`, { reason })
    this.name = "PhotoUploadError"
  }
}

export class PaymentVerificationError extends AppError {
  constructor(reason: string) {
    super("PAYMENT_VERIFICATION_FAILED", `Payment verification failed: ${reason}`, {
      reason,
    })
    this.name = "PaymentVerificationError"
  }
}

export class UnauthorizedError extends AppError {
  constructor(action: string = "this action") {
    super("UNAUTHORIZED", `Authentication required to perform ${action}`)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends AppError {
  constructor(action: string = "this action") {
    super("FORBIDDEN", `You do not have permission to perform ${action}`)
    this.name = "ForbiddenError"
  }
}

export class DatabaseError extends AppError {
  constructor(operation: string, cause?: unknown) {
    const causeMsg = cause instanceof Error ? cause.message : cause ? String(cause) : ""
    const fullMsg = causeMsg && causeMsg !== "undefined"
      ? `Database operation failed (${operation}): ${causeMsg}`
      : `Database operation failed: ${operation}`
    super(
      "DATABASE_ERROR",
      fullMsg,
      { operation, cause: causeMsg },
    )
    this.name = "DatabaseError"
  }
}

// ─── Type guard ───────────────────────────────────────────────────────────

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

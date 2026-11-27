/**
 * result.ts — Result<T, E> discriminated union
 *
 * Explicit error handling pattern. Functions that can fail return
 * Result<T, E> instead of throwing, making error paths visible in
 * the type system and forcing callers to handle both outcomes.
 *
 * Usage:
 *   async function uploadPhoto(file: File): Promise<Result<string, AppError>> {
 *     try {
 *       const path = await storage.upload(file)
 *       return ok(path)
 *     } catch (err) {
 *       return err(new PhotoUploadError(String(err)))
 *     }
 *   }
 *
 *   const result = await uploadPhoto(file)
 *   if (!result.ok) {
 *     // handle result.error
 *   }
 *   // result.value is the uploaded path
 *
 * Dependency rule: no imports from anywhere. Pure TypeScript.
 */

export type Ok<T> = {
  readonly ok: true
  readonly value: T
}

export type Err<E> = {
  readonly ok: false
  readonly error: E
}

export type Result<T, E = Error> = Ok<T> | Err<E>

/** Construct a successful result. */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

/** Construct a failure result. */
export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}

/** Narrow a Result to its Ok branch. */
export function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.ok === true
}

/** Narrow a Result to its Err branch. */
export function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.ok === false
}

/**
 * Map the value of an Ok result, passing Err unchanged.
 */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (value: T) => U,
): Result<U, E> {
  if (result.ok) return ok(fn(result.value))
  return result
}

/**
 * Unwrap a Result, throwing the error if it is an Err.
 * Use sparingly — prefer explicit handling.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value
  throw result.error
}

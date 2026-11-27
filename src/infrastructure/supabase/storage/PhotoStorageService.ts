/**
 * PhotoStorageService.ts — Secure Photo Storage Client
 *
 * Security Model:
 * - Bucket `customer-photos` is STRICTLY PRIVATE.
 * - Anonymous direct uploads and reads are blocked at database/storage level.
 * - Clients request signed upload permissions via the `authorize-photo-upload` Edge Function.
 *   The Edge Function requires a valid trackingToken to prevent unauthenticated usage.
 * - Customer uploads never use `upsert: true` (preventing file overwriting).
 */

import { supabase } from "../client"
import { PhotoUploadError, DatabaseError, ValidationError } from "@/shared/errors/AppError"
import { ok, err, type Result } from "@/shared/types/result"

const BUCKET = "customer-photos"
const MAX_SIZE_BYTES = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png"]

export class PhotoStorageService {
  /**
   * Securely upload a customer reference photo using a server-authorized signed URL.
   * Requires the order's trackingToken to authorize the upload against the backend.
   */
  async uploadSecurely(
    file: File,
    trackingToken: string,
  ): Promise<Result<{ storagePath: string; originalFilename: string }, PhotoUploadError | ValidationError>> {
    // 1. Client-Side Pre-Flight Check
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return err(new ValidationError("Only JPG and PNG images are allowed"))
    }

    if (file.size <= 0 || file.size > MAX_SIZE_BYTES) {
      return err(new ValidationError("Image size must be 10MB or smaller"))
    }

    // 2. Request Server Authorization for Upload (requires trackingToken)
    const { data: authData, error: authError } = await supabase.functions.invoke("authorize-photo-upload", {
      body: {
        filename: file.name,
        mimeType: file.type,
        fileSizeBytes: file.size,
        trackingToken,
      },
    })

    if (authError || !authData?.signedUploadUrl) {
      return err(new PhotoUploadError(`Failed to authorize photo upload: ${authError?.message || authData?.error}`))
    }

    // 3. Upload directly to the signed upload URL (no upsert)
    try {
      const uploadResponse = await fetch(authData.signedUploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        return err(new PhotoUploadError(`Upload failed with status ${uploadResponse.status}`))
      }

      return ok({
        storagePath: authData.storagePath,
        originalFilename: file.name,
      })
    } catch (networkErr) {
      return err(new PhotoUploadError((networkErr as Error).message))
    }
  }

  /**
   * Generate a temporary signed read URL for staff / artist review.
   */
  async getSignedUrl(path: string, expirySeconds: number = 3600): Promise<Result<string, DatabaseError>> {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expirySeconds)

    if (error || !data?.signedUrl) {
      return err(new DatabaseError("create signed URL", error))
    }
    return ok(data.signedUrl)
  }
}

/** Singleton instance */
export const photoStorageService = new PhotoStorageService()

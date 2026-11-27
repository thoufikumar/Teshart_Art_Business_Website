/**
 * client.ts — Supabase browser client
 *
 * Creates and exports a single typed Supabase client using the anon key.
 * The anon key is safe to expose to the browser — Row Level Security
 * enforces what authenticated and anonymous users can access.
 *
 * The service role key is NEVER used here. It lives only in Edge Functions.
 *
 * Dependency rule: imports only env config and Supabase JS SDK.
 * No React, no domain, no application layer.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import { env } from "@/app/config/env"

import type { Database } from "./types"

// Singleton — one client instance for the entire application lifetime.
let _client: SupabaseClient<Database> | null = null

/**
 * Returns the typed Supabase browser client.
 * Instantiated once and reused (singleton pattern).
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createClient<Database>(env.supabase.url, env.supabase.anonKey, {
      auth: {
        // Teshart V1 has no customer login.
        // Persist session for the admin user only.
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  }
  return _client
}

/**
 * Pre-instantiated client for direct use in infrastructure modules.
 * Features and UI should obtain the client via SupabaseProvider context.
 */
export const supabase = getSupabaseClient()

/**
 * SupabaseProvider.tsx — React context for the Supabase client
 *
 * Wraps the application and provides the typed Supabase client via context.
 * Features and hooks consume it via useSupabase() rather than importing
 * the singleton directly — this enables future testing with mock clients.
 *
 * Dependency rule: may import React, infrastructure/supabase/client,
 * and app/config/env. Must NOT import domain business logic or UI components.
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/infrastructure/supabase/client"
import type { Database } from "@/infrastructure/supabase/types"

type TypedSupabaseClient = SupabaseClient<Database>

const SupabaseContext = createContext<TypedSupabaseClient | null>(null)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  // Memoised so the client reference is stable across renders
  const client = useMemo(() => getSupabaseClient(), [])

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  )
}

/**
 * Returns the typed Supabase client from context.
 * Must be called inside a component tree wrapped by SupabaseProvider.
 */
export function useSupabase(): TypedSupabaseClient {
  const client = useContext(SupabaseContext)
  if (!client) {
    throw new Error(
      "useSupabase must be called inside <SupabaseProvider>. " +
        "Wrap your application root with <SupabaseProvider>.",
    )
  }
  return client
}

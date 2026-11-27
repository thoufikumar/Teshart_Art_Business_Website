/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL — required */
  readonly VITE_SUPABASE_URL: string
  /** Supabase anon (public) key — required */
  readonly VITE_SUPABASE_ANON_KEY: string
  /** Order number prefix, default "TSH" */
  readonly VITE_ORDER_PREFIX?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}


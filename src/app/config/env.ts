/**
 * env.ts — Environment variable loader
 *
 * Validates required Supabase variables at module load time.
 * Throws a descriptive error immediately if any required variable is missing,
 * preventing silent failures deep in the application.
 *
 * Dependency rule: this module has no imports from domain/, infrastructure/,
 * or any framework. It is pure configuration.
 */

function requireEnv(key: string): string {
  const value = import.meta.env[key] as string | undefined
  if (!value || value.trim() === "") {
    throw new Error(
      `[Teshart] Missing required environment variable: ${key}\n` +
        `Add it to your .env.local file at the project root.\n` +
        `Example: ${key}=your_value_here`,
    )
  }
  return value.trim()
}

function optionalEnv(key: string, fallback: string = ""): string {
  const value = import.meta.env[key] as string | undefined
  return value?.trim() ?? fallback
}

/**
 * Validated application environment configuration.
 * All values are read once at module load.
 */
export const env = {
  supabase: {
    /** Public anon key — safe to expose to the browser. */
    url: requireEnv("VITE_SUPABASE_URL"),
    anonKey: requireEnv("VITE_SUPABASE_ANON_KEY"),
  },

  app: {
    /** Used for generating order numbers. Defaults to "TSH". */
    orderPrefix: optionalEnv("VITE_ORDER_PREFIX", "TSH"),
  },
} as const

export type AppEnv = typeof env

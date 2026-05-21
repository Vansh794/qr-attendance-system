const placeholderAnonKey = 'replace-with-supabase-anon-key'

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
  appBaseUrl:
    (import.meta.env.VITE_APP_BASE_URL as string | undefined) ??
    window.location.origin,
}

export const isSupabaseConfigured = Boolean(
  env.supabaseUrl &&
    env.supabaseAnonKey &&
    env.supabaseAnonKey !== placeholderAnonKey,
)

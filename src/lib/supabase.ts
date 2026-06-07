import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client. Configured from public env vars at build time:
 *   EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
 *
 * When those aren't set the client is null and features fall back to bundled
 * sample data, so the app still runs (e.g. in Expo Go) before a backend exists.
 */
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        // No auth UI yet — reads only. Avoids needing a storage/URL polyfill.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    })
  : null;

import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client using the service_role key.
 * This bypasses Row Level Security — use ONLY in server-side code
 * (API routes, Server Components, server actions) for trusted operations
 * like ITN webhooks and order management.
 *
 * NEVER import this in client components or expose the key to the browser.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    'WARNING: SUPABASE_SERVICE_ROLE_KEY is missing. Server-side admin operations ' +
    '(ITN webhook, server-validated checkout) will fall back to anon key and may fail.'
  );
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options) => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        return fetch(url, {
          ...options,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));
      }
    }
  }
);

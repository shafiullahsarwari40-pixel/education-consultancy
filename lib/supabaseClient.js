import { createClient } from '@supabase/supabase-js';

// Try to load env from multiple sources
const getClientEnv = () => {
  if (typeof window === 'undefined') {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    };
  }

  // On browser: check window.__NEXT_PUBLIC_ENV__ first, then fallback to window.__NEXT_DATA__
  const runtimeEnv = window.__NEXT_PUBLIC_ENV__ || (window.__NEXT_DATA__?.props?.pageProps?.initialEnv ?? {});
  
  let url = runtimeEnv?.NEXT_PUBLIC_SUPABASE_URL ?? '';
  let key = runtimeEnv?.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  // Last resort: try to read from document meta tags or data attributes
  if (!url && typeof document !== 'undefined') {
    url = document.documentElement.getAttribute('data-supabase-url') ?? '';
  }
  if (!key && typeof document !== 'undefined') {
    key = document.documentElement.getAttribute('data-supabase-key') ?? '';
  }

  return { url, key };
};

const { url: SUPABASE_URL, key: SUPABASE_ANON_KEY } = getClientEnv();

if (typeof window !== 'undefined') {
  window.__SUPABASE_CLIENT_DEBUG = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY_PRESENT: Boolean(SUPABASE_ANON_KEY),
    SUPABASE_ANON_KEY_FIRST_20: SUPABASE_ANON_KEY?.slice(0, 20) ?? 'MISSING',
    hasWindowEnv: Boolean(window.__NEXT_PUBLIC_ENV__),
    hasNextData: Boolean(window.__NEXT_DATA__),
  };
  console.log('[supabaseClient] Config:', window.__SUPABASE_CLIENT_DEBUG);
}

export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

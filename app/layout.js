import fs from 'fs';
import path from 'path';
import './globals.css';
import '../styles_new.css';
import { LanguageProvider } from '../lib/LanguageContext';
import FloatingLanguageChanger from '../components/FloatingLanguageChanger';

function getPublicEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  };

  // If env vars are already set from process.env, return them immediately
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('[getPublicEnv] Using process.env values');
    return env;
  }

  try {
    const envPath = path.join(process.cwd(), '.env.local');
    let content = fs.readFileSync(envPath, 'utf8');

    // Remove BOM if present
    content = content.replace(/^\uFEFF/, '');

    // If content is empty or doesn't contain expected keys, try reading as utf16le
    if (!content.includes('NEXT_PUBLIC_SUPABASE_URL') && !content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
      try {
        content = fs.readFileSync(envPath, 'utf16le');
        content = content.replace(/^\uFEFF/, '');
      } catch (err) {
        console.warn('[getPublicEnv] Fallback to utf16le failed:', err.message);
      }
    }

    // Parse environment variables from file
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)$/);
      if (!match) continue;
      const key = match[1].trim();
      let value = match[2].trim();
      
      // Remove surrounding quotes if present
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      // Only set if the key is NEXT_PUBLIC_ and env value is not already set
      if (key.startsWith('NEXT_PUBLIC_') && key in env && !env[key]) {
        env[key] = value;
        console.log(`[getPublicEnv] Loaded from .env.local: ${key}=${value.slice(0, 20)}...`);
      }
    }
  } catch (error) {
    console.log('[getPublicEnv] .env.local file not found or unreadable:', error.message);
  }

  // Log final state
  console.log('[getPublicEnv] Final config:', {
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `SET (first 20: ${env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20)})` : 'MISSING',
  });

  return env;
}

const publicEnv = getPublicEnv();

export const metadata = {
  title: 'Horizon Educational Consultancy | Study in Turkey with Trusted University Partners',
  description: 'Expert guidance for international students applying to Turkish universities. Fast application support, document review, visa assistance, and multilingual WhatsApp support.',
  openGraph: {
    title: 'Horizon Educational Consultancy',
    description: 'Study in Turkey with trusted university partnerships, fast admissions and multilingual student support.',
    images: [
      {
        url: '/images/hero-bg.jpg',
        width: 1200,
        height: 630,
        alt: 'Horizon Educational Consultancy - Study in Turkey'
      }
    ]
  },
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning
      data-supabase-url={publicEnv.NEXT_PUBLIC_SUPABASE_URL}
      data-supabase-key={publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY}
    >
      <head>
        <link rel="icon" href="/images/logo.png" />
        <link rel="shortcut icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__NEXT_PUBLIC_ENV__ = ${JSON.stringify(publicEnv)}; if (typeof console !== 'undefined') { console.log('[layout.js] Injected env:', window.__NEXT_PUBLIC_ENV__); }`,
          }}
        />
      </head>
      <body>
        <LanguageProvider>
          <FloatingLanguageChanger />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

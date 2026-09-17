import fs from "fs";
import path from "path";
import { Manrope, Noto_Sans_Arabic, Playfair_Display } from "next/font/google";
import "./globals.css";
import "../styles_new.css";
import "./premium.css";
import "./quality.css";
import { LanguageProvider } from "../lib/LanguageContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const arabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  display: "swap",
  preload: false,
});

function getPublicEnv() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };

  // If env vars are already set from process.env, return them immediately
  if (
    env.NEXT_PUBLIC_SUPABASE_URL &&
    (env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  ) {
    return env;
  }

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    let content = fs.readFileSync(envPath, "utf8");

    // Remove BOM if present
    content = content.replace(/^\uFEFF/, "");

    // If content is empty or doesn't contain expected keys, try reading as utf16le
    if (
      !content.includes("NEXT_PUBLIC_SUPABASE_URL") &&
      !content.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY") &&
      !content.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    ) {
      try {
        content = fs.readFileSync(envPath, "utf16le");
        content = content.replace(/^\uFEFF/, "");
      } catch {
        /* The usual environment configuration remains the fallback. */
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
      if (key.startsWith("NEXT_PUBLIC_") && key in env && !env[key]) {
        env[key] = value;
      }
    }
  } catch {
    /* Hosted environments use process.env; a local file is optional. */
  }

  return env;
}

const publicEnv = getPublicEnv();

export const metadata = {
  metadataBase: new URL("https://horizoneducon.com"),
  title: {
    default:
      "Study in Türkiye, with a clear plan | Horizon Educational Consultancy",
    template: "%s | Horizon Educational Consultancy",
  },
  description:
    "Horizon helps international students compare university options in Türkiye, prepare accurate applications, and track each stage with clear communication.",
  openGraph: {
    type: "website",
    siteName: "Horizon Educational Consultancy",
    locale: "en_US",
    title: "Horizon Educational Consultancy",
    description:
      "Guidance for international students choosing universities in Türkiye and preparing applications with clarity and support.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Horizon Educational Consultancy - Study in Türkiye",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your future in Türkiye starts with the right plan.",
    description:
      "University discovery, application guidance, and a student portal that keeps your next step clear.",
    images: ["/opengraph-image"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/images/horizon-logo.webp",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#071a2f",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} ${arabic.variable}`}
      suppressHydrationWarning
      data-supabase-url={publicEnv.NEXT_PUBLIC_SUPABASE_URL}
      data-supabase-key={
        publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__NEXT_PUBLIC_ENV__ = ${JSON.stringify(publicEnv).replace(/</g, "\\u003c")};`,
          }}
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}

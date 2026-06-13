import './globals.css';
import '../styles_new.css';
import { LanguageProvider } from '../lib/LanguageContext';

export const metadata = {
  title: 'Horizon Educational Consultancy - Study in Turkey',
  description: 'Your gateway to studying in Turkey. Expert guidance, university admission support, visa assistance, and complete student services.',
  icons: {
    icon: '/images/logo.png',
    shortcut: '/images/logo.png',
    apple: '/images/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logo.png" />
        <link rel="shortcut icon" href="/images/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://www.google.com/recaptcha/api.js" async defer></script>
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

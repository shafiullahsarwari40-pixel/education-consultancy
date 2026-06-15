'use client';

import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { translations } from './translations';

const LanguageContext = createContext();
const RTL_LANGUAGES = ['fa', 'ps', 'ar', 'ur'];
const PROTECTED_PREFIXES = ['/admin', '/student'];

export function LanguageProvider({ children }) {
  const pathname = usePathname();

  // The language the user selected for the public site
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // support legacy key `horizonLanguage` as a fallback
      const savedLanguage = localStorage.getItem('appLanguage') || localStorage.getItem('horizonLanguage');
      if (savedLanguage && translations[savedLanguage]) {
        setSelectedLanguage(savedLanguage);
      }
    }
  }, []);

  // Effective language used by the app: force English for protected routes
  const effectiveLanguage = useMemo(() => {
    if (typeof pathname === 'string' && PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      return 'en';
    }
    return selectedLanguage;
  }, [pathname, selectedLanguage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.lang = effectiveLanguage;
    document.documentElement.dir = RTL_LANGUAGES.includes(effectiveLanguage) ? 'rtl' : 'ltr';
  }, [effectiveLanguage]);

  const changeLanguage = (lang) => {
    if (!translations[lang]) return;
    // Only persist/apply selected language for the public site
    if (typeof pathname === 'string' && PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))) {
      // Ignore language changes while inside protected areas
      return;
    }
    setSelectedLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('appLanguage', lang);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[effectiveLanguage];
    for (const k of keys) {
      value = value?.[k];
    }

    if (value != null) {
      return value;
    }

    // Fall back to English when a translation is missing.
    value = translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value != null) return value;

    // Do not expose raw translation keys to end users. In development, warn so
    // translators can fix missing entries.
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(`Missing translation key: ${key} (lang: ${effectiveLanguage})`);
    }
    return '';
  };

  const value = useMemo(() => ({ language: effectiveLanguage, changeLanguage, t }), [effectiveLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

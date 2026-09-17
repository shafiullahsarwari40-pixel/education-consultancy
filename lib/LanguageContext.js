"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import { translations } from "./translations";
import { premiumCopy } from "./premiumCopy";
import { homepageTranslations } from "./homepageTranslations";
import { isEnglishWorkflowRoute } from "./siteLanguage";

const LanguageContext = createContext();
const RTL_LANGUAGES = ["fa", "ps", "ar", "ur"];

export function LanguageProvider({ children }) {
  const pathname = usePathname();

  // The language the user selected for the public site
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    if (typeof window !== "undefined") {
      // support legacy key `horizonLanguage` as a fallback
      try {
        const savedLanguage =
          localStorage.getItem("appLanguage") ||
          localStorage.getItem("horizonLanguage");
        if (savedLanguage && translations[savedLanguage])
          setSelectedLanguage(savedLanguage);
      } catch {
        /* Language switching still works when storage is unavailable. */
      }
    }
  }, []);

  // Keep the student workflow English without overwriting the public preference.
  const effectiveLanguage = useMemo(() => {
    if (isEnglishWorkflowRoute(pathname)) {
      return "en";
    }
    return selectedLanguage;
  }, [pathname, selectedLanguage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.lang = effectiveLanguage;
    document.documentElement.dir = RTL_LANGUAGES.includes(effectiveLanguage)
      ? "rtl"
      : "ltr";
  }, [effectiveLanguage]);

  const changeLanguage = useCallback(
    (lang) => {
      if (!translations[lang]) return;
      // Only persist/apply selected language for the public site
      if (isEnglishWorkflowRoute(pathname)) {
        // Keep language controls and workflow content in agreement.
        return;
      }
      setSelectedLanguage(lang);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("appLanguage", lang);
        } catch {
          /* Session-only preference. */
        }
      }
    },
    [pathname],
  );

  const t = useCallback(
    (key) => {
      if (typeof key !== "string") return "";
      if (key.startsWith("premium.")) {
        const label = key.slice(8);
        return (
          premiumCopy[effectiveLanguage]?.[label] ?? premiumCopy.en[label] ?? ""
        );
      }
      const keys = key.split(".");
      const homepageValue = keys.reduce(
        (value, part) => value?.[part],
        homepageTranslations[effectiveLanguage],
      );
      if (homepageValue != null) return homepageValue;
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
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.warn(
          `Missing translation key: ${key} (lang: ${effectiveLanguage})`,
        );
      }
      return "";
    },
    [effectiveLanguage],
  );

  const value = useMemo(
    () => ({ language: effectiveLanguage, changeLanguage, t }),
    [effectiveLanguage, changeLanguage, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}

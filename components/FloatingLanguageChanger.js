"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../lib/LanguageContext';

const HIDDEN_PATH_PREFIXES = ['/admin', '/student'];

export default function FloatingLanguageChanger() {
  const pathname = usePathname();
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const shouldShow = !HIDDEN_PATH_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  if (!shouldShow) {
    return null;
  }

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fa', name: 'فارسی' },
    { code: 'ps', name: 'پښتو' },
    { code: 'ar', name: 'العربية' },
    { code: 'fr', name: 'Français' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ur', name: 'اردو' },
    { code: 'hi', name: 'हिन्दी' }
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="floating-language-changer">
      <button 
        className="floating-lang-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        {currentLang?.name || language.toUpperCase()}
      </button>
      
      {isOpen && (
        <div className="floating-lang-dropdown">
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`floating-lang-option ${language === lang.code ? 'active' : ''}`}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
            >
              {lang.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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

  const wrapperStyle = {
    position: 'fixed',
    top: '5rem',
    right: '1.5rem',
    zIndex: 9999,
    width: 'auto',
    maxWidth: '280px',
  };

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.55rem',
    padding: '0.78rem 1rem',
    background: '#ffffff',
    color: '#0f4bf0',
    border: '1px solid rgba(15, 75, 240, 0.16)',
    borderRadius: '999px',
    boxShadow: '0 20px 45px rgba(15, 75, 240, 0.12)',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 0.75rem)',
    right: 0,
    background: '#ffffff',
    border: '1px solid rgba(15, 75, 240, 0.12)',
    borderRadius: '18px',
    boxShadow: '0 20px 50px rgba(15, 75, 240, 0.12)',
    padding: '0.35rem',
    minWidth: '220px',
    maxWidth: '260px',
    overflow: 'hidden',
    zIndex: 10000,
  };

  const optionStyle = {
    width: '100%',
    padding: '0.78rem 1rem',
    textAlign: 'left',
    background: 'transparent',
    border: 'none',
    color: '#0f172a',
    fontSize: '0.95rem',
    cursor: 'pointer',
  };

  const iconStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    background: '#eff5ff',
    color: '#0f4bf0',
    fontSize: '0.95rem',
  };

  return (
    <div className="floating-language-changer" style={wrapperStyle}>
      <button
        className="floating-lang-btn"
        style={buttonStyle}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change language"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="floating-lang-icon" style={iconStyle}>🌐</span>
        <span className="floating-lang-current">{currentLang?.name || language.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="floating-lang-dropdown" role="menu" style={dropdownStyle}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              className={`floating-lang-option ${language === lang.code ? 'active' : ''}`}
              type="button"
              style={{
                ...optionStyle,
                background: language === lang.code ? '#e7f0ff' : 'transparent',
                color: language === lang.code ? '#0f4bf0' : '#0f172a',
                fontWeight: language === lang.code ? 700 : 400,
                borderRadius: '14px',
                marginBottom: '0.15rem',
              }}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
            >
              <span className="floating-lang-option-label">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

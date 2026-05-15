import React, { useRef, useEffect } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';
import type { SupportedLanguage } from '../../../utils/languageResolver';

const LANGUAGE_DISPLAY: Record<SupportedLanguage, string> = {
  es: '🇲🇽 ES',
  en: '🇺🇸 EN',
  ko: '🇰🇷 한국',
  ar: '🇸🇦 AR',
  fr: '🇫🇷 FR',
  sv: '🇸🇪 SV',
};

export const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: SupportedLanguage) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm font-bold cursor-pointer hover:opacity-70 transition-opacity"
      >
        {LANGUAGE_DISPLAY[language]}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[60px]">
          {Object.entries(LANGUAGE_DISPLAY).map(([lang, display]) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang as SupportedLanguage)}
              className="block w-full px-3 py-2 text-left text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              {display}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
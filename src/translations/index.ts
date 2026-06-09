import type { SupportedLanguage } from '../utils/languageResolver';
import es from './es.json';
import en from './en.json';
import ko from './ko.json';
import ar from './ar.json';
import fr from './fr.json';
import sv from './sv.json';

interface TranslationSchema {
  ui: Record<string, string>;
  categories: Record<string, string>;
  descriptions: Record<string, string>;
  weightModal: Record<string, string>;
  optionSelector: Record<string, string>;
  misc: Record<string, string>;
  errors: Record<string, string>;
}

const translations: Record<SupportedLanguage, TranslationSchema> = {
  es: es as unknown as TranslationSchema,
  en: en as unknown as TranslationSchema,
  ko: ko as unknown as TranslationSchema,
  ar: ar as unknown as TranslationSchema,
  fr: fr as unknown as TranslationSchema,
  sv: sv as unknown as TranslationSchema,
};

export function getTranslations(lang: SupportedLanguage): TranslationSchema {
  return translations[lang] || translations.es;
}

export function t(key: string, lang: SupportedLanguage, fallback?: string): string {
  const bundle = getTranslations(lang);
  const sections = [bundle.ui, bundle.weightModal, bundle.optionSelector, bundle.misc, bundle.errors] as const;
  for (const section of sections) {
    if (key in section) return section[key];
  }
  return fallback || key;
}

export function getCategoryName(code: string, lang: SupportedLanguage, fallback?: string): string {
  return getTranslations(lang).categories[code] || fallback || code;
}

export function getItemDescription(itemId: string, lang: SupportedLanguage, fallback?: string): string {
  return getTranslations(lang).descriptions[itemId] || fallback || '';
}

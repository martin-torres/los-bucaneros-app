const LOCAL_STORAGE_KEY = 'selected_language';

export type SupportedLanguage = 'es' | 'en' | 'ko' | 'ar' | 'fr' | 'sv';

export function resolveLanguage(): SupportedLanguage {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (stored && isValidLanguage(stored)) {
    return stored as SupportedLanguage;
  }
  
  const detected = detectFromBrowser();
  localStorage.setItem(LOCAL_STORAGE_KEY, detected);
  return detected;
}

export function setLanguage(lang: SupportedLanguage): void {
  if (isValidLanguage(lang)) {
    localStorage.setItem(LOCAL_STORAGE_KEY, lang);
  }
}

function isValidLanguage(value: string): boolean {
  return value === 'es' || value === 'en' || value === 'ko' || value === 'ar' || value === 'fr' || value === 'sv';
}

function detectFromBrowser(): SupportedLanguage {
  const lang = navigator.language.split('-')[0];
  
  if (lang.startsWith('es')) return 'es';
  if (lang.startsWith('en')) return 'en';
  if (lang.startsWith('ko')) return 'ko';
  if (lang.startsWith('ar')) return 'ar';
  if (lang.startsWith('fr')) return 'fr';
  if (lang.startsWith('sv')) return 'sv';
  
  return 'es';
}
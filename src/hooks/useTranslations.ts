import { useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { t as resolveT, getCategoryName as resolveCategoryName, getItemDescription as resolveItemDescription } from '../translations';

export function useTranslations() {
  const { language } = useLanguage();

  const t = useCallback((key: string, fallback?: string): string => {
    return resolveT(key, language, fallback);
  }, [language]);

  const getItemDescription = useCallback((itemId: string, fallback?: string): string => {
    return resolveItemDescription(itemId, language, fallback);
  }, [language]);

  const getCategoryName = useCallback((categoryCode: string, fallback?: string): string => {
    return resolveCategoryName(categoryCode, language, fallback);
  }, [language]);

  return {
    language,
    loaded: true,
    error: null,
    t,
    getItemDescription,
    getCategoryName,
  };
}

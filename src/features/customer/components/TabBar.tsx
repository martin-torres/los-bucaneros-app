import React from 'react';
import { useTranslations } from '../../../hooks/useTranslations';

const CATEGORY_ICONS: Record<string, string> = {
  gummies: '🍬',
  candy: '🧁',
  chocolate: '🍫',
  drinks: '🥤',
  present: '🎁',
  greenhouse_premium: '🌲',
  greenhouse_selecta: '🌿',
  living_soil: '🌱',
  hydro: '💧',
  edibles: '🍪',
  prerolls: '🎋',
  infusionados: '🧴',
  hash_holes: '🍩',
  extractos: '💎',
  vapes: '💨',
  psicodelia: '🍄',
};

interface TabBarProps {
  categories: Array<{ code: string; displayName: string }>;
  selectedCategory: string;
  onSelectCategory: (code: string) => void;
  primaryColor?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  primaryColor = '#f59e0b',
}) => {
  const { getCategoryName } = useTranslations();
  
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pb-4 -mx-2 px-2">
      {categories.map((category) => (
        <button
          key={category.code}
          onClick={() => onSelectCategory(category.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-wider transition-all ${
            selectedCategory === category.code
              ? 'text-white shadow-md scale-105'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
          style={
            selectedCategory === category.code
              ? { backgroundColor: primaryColor }
              : { backgroundColor: '#f3f4f6' }
          }
        >
          <span className="text-base">{CATEGORY_ICONS[category.code] || '📦'}</span>
          <span>{getCategoryName(category.code, category.displayName)}</span>
        </button>
      ))}
    </div>
  );
};
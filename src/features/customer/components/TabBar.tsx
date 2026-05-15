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
  paquete: '🍖',
  complemento: '🌽',
  salsa: '🫙',
  bebida: '🥤',
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
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-bold transition-all ${
            selectedCategory === category.code
              ? 'shadow-md'
              : 'text-gray-500 hover:text-gray-700 hover:shadow-sm'
          }`}
          style={
            selectedCategory === category.code
              ? { backgroundColor: `${primaryColor}18`, color: primaryColor }
              : { backgroundColor: '#f3f4f6' }
          }
        >
          <span className="text-lg">{CATEGORY_ICONS[category.code] || '🍖'}</span>
          <span>{getCategoryName(category.code, category.displayName)}</span>
        </button>
      ))}
    </div>
  );
};
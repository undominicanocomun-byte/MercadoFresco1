import React from 'react';
import { Category } from '../types';
import {
  Apple,
  Milk,
  Croissant,
  Beef,
  Package,
  Coffee,
  Sparkles,
  Heart,
  Layers,
  Percent,
} from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  'frutas-verduras': <Apple className="w-4 h-4" />,
  'lacteos-huevos': <Milk className="w-4 h-4" />,
  panaderia: <Croissant className="w-4 h-4" />,
  'carnes-pescados': <Beef className="w-4 h-4" />,
  despensa: <Package className="w-4 h-4" />,
  bebidas: <Coffee className="w-4 h-4" />,
  limpieza: <Sparkles className="w-4 h-4" />,
  'cuidado-personal': <Heart className="w-4 h-4" />,
};

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedTag,
  onSelectTag,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-18 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Scrollable Category pills / segmented controls */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              onClick={() => {
                onSelectCategory('all');
                onSelectTag(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all' && !selectedTag
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Todos los Productos</span>
            </button>

            <button
              onClick={() => {
                onSelectCategory('all');
                onSelectTag(selectedTag === 'oferta' ? null : 'oferta');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                selectedTag === 'oferta'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Ofertas del Día</span>
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id && !selectedTag;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    onSelectTag(null);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className={isSelected ? 'text-white' : 'text-emerald-700'}>
                    {iconMap[cat.id] || <Package className="w-4 h-4" />}
                  </span>
                  <span>{cat.name}</span>
                  {typeof cat.productCount === 'number' && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {cat.productCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Dietary filter pill tags on the right */}
          <div className="hidden xl:flex items-center gap-2 shrink-0 border-l border-slate-200 pl-4">
            <span className="text-xs text-slate-400 font-medium">Filtrar:</span>
            {[
              { id: 'organico', label: 'Orgánico' },
              { id: 'local', label: 'Local' },
              { id: 'sin_gluten', label: 'Sin Gluten' },
              { id: 'vegano', label: 'Vegano' },
            ].map((tag) => (
              <button
                key={tag.id}
                onClick={() => onSelectTag(selectedTag === tag.id ? null : tag.id)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedTag === tag.id
                    ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

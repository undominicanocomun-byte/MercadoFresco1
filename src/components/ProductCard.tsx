import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/supermarket';
import { Plus, Minus, Check, Eye, AlertCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { items, addItem, updateQuantity } = useCart();
  const [imageError, setImageError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cartItem = items.find((i) => i.productId === product.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = addItem(product, 1);
    if (result.success) {
      setJustAdded(true);
      setErrorMessage(null);
      setTimeout(() => setJustAdded(false), 1200);
    } else {
      setErrorMessage(result.message || 'Sin stock disponible');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = updateQuantity(product.id, currentQty + (product.unit === 'kg' ? 0.5 : 1));
    if (!result.success) {
      setErrorMessage(result.message || 'Máximo stock alcanzado');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const step = product.unit === 'kg' ? 0.5 : 1;
    updateQuantity(product.id, Math.max(0, currentQty - step));
  };

  const isLowStock = product.inStock && product.stockQuantity > 0 && product.stockQuantity <= 10;
  const isOutOfStock = !product.inStock || product.stockQuantity <= 0;

  return (
    <article
      onClick={() => onQuickView(product)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Product Image Container (65-75% visual prominence) */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        {!imageError ? (
          <img
            src={product.image}
            alt={product.name}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-emerald-50 to-slate-100 text-emerald-800">
            <span className="text-2xl font-bold mb-1">{product.name.charAt(0)}</span>
            <span className="text-xs font-medium text-center line-clamp-2">{product.name}</span>
          </div>
        )}

        {/* Quick View Hover Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          aria-label={`Ver detalles de ${product.name}`}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs text-slate-700 hover:text-emerald-700 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>

        {/* Discount Badge if compareAtPrice is greater */}
        {product.compareAtPrice && product.compareAtPrice > product.price && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[11px] shadow-xs">
            -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
          </div>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-3 py-1 bg-white text-slate-900 font-bold text-xs rounded-full shadow-md">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed Metadata with Typographic Separator (Zero-Pill Rule) */}
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1.5 flex-wrap">
            <span className="uppercase tracking-wider text-emerald-700 font-semibold">{product.subcategory || product.category}</span>
            {product.origin && (
              <>
                <span aria-hidden="true">·</span>
                <span className="truncate max-w-[120px]">{product.origin}</span>
              </>
            )}
            {product.tags.includes('organico') && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-600">Bio</span>
              </>
            )}
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>

          {/* Stock Indicator */}
          {isLowStock && (
            <p className="mt-1 text-[11px] font-medium text-amber-700 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 shrink-0" />
              <span>Solo quedan {product.stockQuantity} {product.unit}</span>
            </p>
          )}

          {errorMessage && (
            <p className="mt-1 text-[11px] font-semibold text-rose-600 animate-in fade-in">
              {errorMessage}
            </p>
          )}
        </div>

        {/* Pricing and Purchase Action Module */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900 font-mono tabular-nums">
                {formatCurrency(product.price)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ {product.unit}</span>
            </div>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through font-mono tabular-nums">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Purchase / Stepper Controls */}
          {isOutOfStock ? (
            <button
              disabled
              className="px-3 py-1.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-xl cursor-not-allowed"
            >
              No disponible
            </button>
          ) : currentQty > 0 ? (
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200"
            >
              <button
                onClick={handleDecrement}
                aria-label={`Quitar una unidad de ${product.name}`}
                className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 text-slate-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold font-mono tabular-nums text-slate-900 px-1 min-w-[20px] text-center">
                {currentQty}
              </span>
              <button
                onClick={handleIncrement}
                aria-label={`Agregar otra unidad de ${product.name}`}
                className="w-7 h-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              aria-label={`Agregar ${product.name} al carrito`}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer ${
                justAdded
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Listo</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

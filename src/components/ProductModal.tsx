import React, { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/supermarket';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, MapPin, Sparkles, Check, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { addItem, items, updateQuantity } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!product) return null;

  const cartItem = items.find((i) => i.productId === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    const res = addItem(product, quantity);
    if (res.success) {
      setJustAdded(true);
      setErrorMsg(null);
      setTimeout(() => {
        setJustAdded(false);
      }, 1500);
    } else {
      setErrorMsg(res.message || 'No se puede añadir esta cantidad.');
    }
  };

  const isOutOfStock = !product.inStock || product.stockQuantity <= 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Cerrar modal de producto"
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto bg-slate-100 flex items-center justify-center overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs shadow-sm">
                Ahorras {formatCurrency(product.compareAtPrice - product.price)}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="p-6 md:p-8 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Category & Tags */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                <span className="uppercase text-emerald-700 font-bold">{product.category}</span>
                {product.origin && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {product.origin}
                    </span>
                  </>
                )}
              </div>

              <h2 id="product-modal-title" className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price and Comparison */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm text-slate-500 font-medium">/ {product.unit}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-sm text-slate-400 line-through font-mono tabular-nums">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="mt-4 text-xs md:text-sm text-slate-600 leading-relaxed">
                {product.description}
              </p>

              {/* Nutritional Info Table if available */}
              {product.nutritionalInfo && (
                <div className="mt-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Información Nutricional (por 100g)
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {product.nutritionalInfo.calories && (
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Calorías</span>
                        <span className="font-mono font-bold text-slate-800">{product.nutritionalInfo.calories} kcal</span>
                      </div>
                    )}
                    {product.nutritionalInfo.protein && (
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Proteínas</span>
                        <span className="font-mono font-bold text-slate-800">{product.nutritionalInfo.protein}</span>
                      </div>
                    )}
                    {product.nutritionalInfo.carbs && (
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Carbohidratos</span>
                        <span className="font-mono font-bold text-slate-800">{product.nutritionalInfo.carbs}</span>
                      </div>
                    )}
                    {product.nutritionalInfo.fat && (
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-slate-500">Grasas</span>
                        <span className="font-mono font-bold text-slate-800">{product.nutritionalInfo.fat}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stock and SKU */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>SKU: {product.sku}</span>
                <span className={product.stockQuantity > 5 ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-bold'}>
                  {product.stockQuantity > 0 ? `${product.stockQuantity} ${product.unit} en almacén` : 'Sin existencias'}
                </span>
              </div>

              {errorMsg && (
                <div className="mt-3 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center gap-4">
              {!isOutOfStock && (
                <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold font-mono text-sm text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantity >= product.stockQuantity}
                    className="w-8 h-8 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    : justAdded
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-98'
                }`}
              >
                {isOutOfStock ? (
                  <span>Producto Agotado</span>
                ) : justAdded ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Añadir {formatCurrency(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

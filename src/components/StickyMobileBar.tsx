import React from 'react';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface StickyMobileBarProps {
  onOpenCheckout: () => void;
}

export const StickyMobileBar: React.FC<StickyMobileBarProps> = ({ onOpenCheckout }) => {
  const { itemCount, totals, openCart } = useCart();

  if (itemCount === 0) {
    return null;
  }

  const qualifiesForFreeShipping = totals.subtotal >= 40;
  const missingForFree = Math.max(0, 40 - totals.subtotal);

  return (
    <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-stone-950/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-stone-800 shadow-2xl flex items-center justify-between gap-3">
        <button
          onClick={openCart}
          className="flex items-center gap-2.5 text-left cursor-pointer"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center border-2 border-stone-950">
              {itemCount}
            </span>
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-white">
              ${totals.subtotal.toFixed(2)}
            </div>
            <p className="text-[10px] text-stone-400">
              {qualifiesForFreeShipping ? (
                <span className="text-emerald-400 font-semibold">Envío Gratis aplicado</span>
              ) : (
                `Faltan $${missingForFree.toFixed(2)} p/ Envío Gratis`
              )}
            </p>
          </div>
        </button>

        <button
          onClick={openCart}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        >
          <span>Ver Cesta</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

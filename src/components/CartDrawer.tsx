import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/supermarket';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, Truck, ShoppingBag, Sparkles } from 'lucide-react';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
    totals,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    settings,
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState<{ text: string; error: boolean } | null>(null);

  if (!isOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;

    setCouponLoading(true);
    setCouponMessage(null);
    const result = await applyCoupon(couponCodeInput.trim());
    setCouponLoading(false);

    if (result.success) {
      setCouponMessage({ text: result.message, error: false });
      setCouponCodeInput('');
    } else {
      setCouponMessage({ text: result.message, error: true });
    }
  };

  const freeShippingThreshold = settings?.freeDeliveryThreshold || 40.0;
  const progressPercent = Math.min(100, (totals.subtotal / freeShippingThreshold) * 100);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={closeCart}
    >
      <div
        className="fixed inset-y-0 right-0 max-w-full flex pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Tu Cesta de Compra</h2>
                <p className="text-xs text-slate-500 font-mono">
                  {items.length} {items.length === 1 ? 'producto' : 'productos'} añadidos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-600 font-medium px-2 py-1 transition-colors cursor-pointer"
                >
                  Vaciar
                </button>
              )}
              <button
                onClick={closeCart}
                aria-label="Cerrar carrito"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="p-4 bg-emerald-50/60 border-b border-emerald-100">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                {totals.isFreeDelivery
                  ? '¡Felicidades! Tienes Envío Gratis'
                  : `Faltan ${formatCurrency(totals.freeDeliveryRemaining)} para Envío Gratis`}
              </span>
              <span className="font-mono text-emerald-700">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-emerald-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-slate-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-base font-bold text-slate-800">Tu cesta está vacía</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Recorre nuestros pasillos de frutas, verduras y panadería artesanal para comenzar tu pedido.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="py-3.5 flex items-center gap-3.5">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200/60"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatCurrency(item.unitPrice)} / {item.product.unit}
                    </p>

                    {/* Stepper */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          onClick={() => {
                            const step = item.product.unit === 'kg' ? 0.5 : 1;
                            updateQuantity(item.productId, Math.max(0, item.quantity - step));
                          }}
                          aria-label={`Reducir cantidad de ${item.product.name}`}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const step = item.product.unit === 'kg' ? 0.5 : 1;
                            updateQuantity(item.productId, item.quantity + step);
                          }}
                          aria-label={`Aumentar cantidad de ${item.product.name}`}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Eliminar ${item.product.name} de la cesta`}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                      {formatCurrency(item.lineTotal)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Coupon and Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
              {/* Coupon Form */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span className="text-emerald-700">
                        {appliedCoupon.discountPercent ? `(-${appliedCoupon.discountPercent}%)` : 'Descuento aplicado'}
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Cupón (ej: FRESCO10)"
                        className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none uppercase font-mono"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !couponCodeInput}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {couponLoading ? '...' : 'Aplicar'}
                      </button>
                    </div>
                    {couponMessage && (
                      <p className={`text-[11px] font-medium ${couponMessage.error ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {couponMessage.text}
                      </p>
                    )}
                  </form>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-slate-900 font-semibold">{formatCurrency(totals.subtotal)}</span>
                </div>

                {totals.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Descuento aplicado</span>
                    <span className="font-mono">-{formatCurrency(totals.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Gastos de Entrega</span>
                  <span className="font-mono text-slate-900 font-semibold">
                    {totals.deliveryFee === 0 ? (
                      <span className="text-emerald-700 uppercase font-bold text-[10px]">Gratis</span>
                    ) : (
                      formatCurrency(totals.deliveryFee)
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Impuestos estimados (10% IVA)</span>
                  <span className="font-mono text-slate-900 font-semibold">{formatCurrency(totals.tax)}</span>
                </div>

                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total a Pagar</span>
                  <span className="text-base font-mono tabular-nums text-emerald-950">
                    {formatCurrency(totals.total)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  closeCart();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
              >
                <span>Tramitar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Coupon, Product, StoreSettings } from '../types';
import { calculateCartTotals, CartCalculationResult, checkStockAvailable } from '../utils/supermarket';
import { api } from '../services/api';

const CART_STORAGE_KEY = 'mercadofresco_cart_items';
const COUPON_STORAGE_KEY = 'mercadofresco_cart_coupon';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  totals: CartCalculationResult;
  settings: StoreSettings | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  // Load store settings on mount
  useEffect(() => {
    api
      .getSettings()
      .then((res) => setSettings(res.settings))
      .catch((e) => console.error('Error loading settings', e));
  }, []);

  // Sync cart to localStorage
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Sync coupon to localStorage
  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }, [appliedCoupon]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    const existing = items.find((i) => i.productId === product.id);
    const currentInCart = existing ? existing.quantity : 0;

    const check = checkStockAvailable(product, quantity, currentInCart);
    if (!check.allowed) {
      return { success: false, message: check.message };
    }

    setItems((prev) => {
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                lineTotal: Number(((item.quantity + quantity) * item.unitPrice).toFixed(2)),
              }
            : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            product,
            quantity,
            unitPrice: product.price,
            lineTotal: Number((quantity * product.price).toFixed(2)),
          },
        ];
      }
    });

    return { success: true };
  };

  const updateQuantity = (productId: string, newQty: number): { success: boolean; message?: string } => {
    if (newQty <= 0) {
      removeItem(productId);
      return { success: true };
    }

    const item = items.find((i) => i.productId === productId);
    if (!item) return { success: false, message: 'Producto no encontrado en el carrito.' };

    const check = checkStockAvailable(item.product, newQty, 0);
    if (!check.allowed) {
      return { success: false, message: check.message };
    }

    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? {
              ...i,
              quantity: newQty,
              lineTotal: Number((newQty * i.unitPrice).toFixed(2)),
            }
          : i
      )
    );

    return { success: true };
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const totals = calculateCartTotals({
    items,
    coupon: appliedCoupon,
    freeDeliveryThreshold: settings?.freeDeliveryThreshold || 40.0,
    standardDeliveryFee: settings?.standardDeliveryFee || 3.99,
    taxRate: settings?.taxRate || 0.10,
  });

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.validateCoupon(code, totals.subtotal);
      if (res.valid) {
        setAppliedCoupon(res.coupon);
        return { success: true, message: `¡Cupón ${res.coupon.code} aplicado con éxito!` };
      }
      return { success: false, message: 'No se pudo aplicar el cupón.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Código de cupón inválido.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const itemCount = items.reduce((sum, item) => sum + (item.product.unit === 'kg' ? 1 : item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        isOpen,
        openCart,
        closeCart,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        totals,
        settings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

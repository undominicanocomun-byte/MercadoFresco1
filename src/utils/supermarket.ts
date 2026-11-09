import { CartItem, Coupon, OrderStatus, Product, StoreSettings } from '../types';

export interface CartCalculationParams {
  items: CartItem[];
  coupon?: Coupon | null;
  freeDeliveryThreshold?: number;
  standardDeliveryFee?: number;
  taxRate?: number;
}

export interface CartCalculationResult {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  freeDeliveryRemaining: number;
  appliedCouponCode?: string;
  isFreeDelivery: boolean;
}

/**
 * Calculates cart totals, discounts, taxes, and shipping
 */
export function calculateCartTotals({
  items,
  coupon = null,
  freeDeliveryThreshold = 40.0,
  standardDeliveryFee = 3.99,
  taxRate = 0.10,
}: CartCalculationParams): CartCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  let discount = 0;
  let isFreeDeliveryFromCoupon = false;

  if (coupon && coupon.isActive) {
    const isNotExpired = new Date(coupon.expiresAt).getTime() >= Date.now();
    const meetsMinPurchase = subtotal >= coupon.minPurchase;

    if (isNotExpired && meetsMinPurchase) {
      if (coupon.isFreeShipping) {
        isFreeDeliveryFromCoupon = true;
      }
      if (coupon.discountPercent && coupon.discountPercent > 0) {
        discount += (subtotal * coupon.discountPercent) / 100;
      }
      if (coupon.discountFixed && coupon.discountFixed > 0) {
        discount += Math.min(coupon.discountFixed, subtotal);
      }
    }
  }

  // Cap discount so subtotal doesn't go below 0
  discount = Math.min(discount, subtotal);
  const discountedSubtotal = subtotal - discount;

  // Determine delivery fee
  const qualifiesForFreeDelivery = subtotal >= freeDeliveryThreshold || isFreeDeliveryFromCoupon;
  const deliveryFee = subtotal === 0 ? 0 : qualifiesForFreeDelivery ? 0 : standardDeliveryFee;
  const freeDeliveryRemaining = Math.max(0, freeDeliveryThreshold - subtotal);

  // Tax on taxable amount
  const tax = Number((discountedSubtotal * taxRate).toFixed(2));
  const total = Number((discountedSubtotal + deliveryFee + tax).toFixed(2));

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    deliveryFee: Number(deliveryFee.toFixed(2)),
    tax,
    total,
    freeDeliveryRemaining: Number(freeDeliveryRemaining.toFixed(2)),
    appliedCouponCode: discount > 0 || isFreeDeliveryFromCoupon ? coupon?.code : undefined,
    isFreeDelivery: qualifiesForFreeDelivery,
  };
}

/**
 * Validates whether a coupon can be applied given the current cart subtotal
 */
export function validateCoupon(
  coupon: Coupon | null | undefined,
  subtotal: number
): { valid: boolean; reason?: string } {
  if (!coupon) {
    return { valid: false, reason: 'Cupón no encontrado.' };
  }
  if (!coupon.isActive) {
    return { valid: false, reason: 'Este cupón se encuentra inactivo.' };
  }
  if (coupon.maxUses && coupon.timesUsed >= coupon.maxUses) {
    return { valid: false, reason: 'Este cupón ha alcanzado el límite máximo de usos.' };
  }
  if (new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'Este cupón ha caducado.' };
  }
  if (subtotal < coupon.minPurchase) {
    return {
      valid: false,
      reason: `El pedido mínimo para aplicar este cupón es de $${coupon.minPurchase.toFixed(2)}.`,
    };
  }
  return { valid: true };
}

/**
 * Validates order status transitions in supermarket fulfillment lifecycle
 */
export function canTransitionOrderStatus(current: OrderStatus, next: OrderStatus): boolean {
  if (current === next) return true;
  if (current === 'cancelled' || current === 'delivered') {
    return false; // Terminal states
  }

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    received: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['in_transit', 'cancelled'],
    in_transit: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  };

  return validTransitions[current]?.includes(next) ?? false;
}

/**
 * Human readable status labels and theme badges
 */
export function getOrderStatusLabel(status: OrderStatus): {
  label: string;
  description: string;
  colorClass: string;
} {
  switch (status) {
    case 'received':
      return {
        label: 'Pedido Recibido',
        description: 'Hemos recibido tu orden y la estamos revisando.',
        colorClass: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    case 'confirmed':
      return {
        label: 'Confirmado',
        description: 'Pedido confirmado, listo para ser armado.',
        colorClass: 'text-blue-800 bg-blue-50 border-blue-200',
      };
    case 'preparing':
      return {
        label: 'En Preparación',
        description: 'Seleccionando los mejores productos frescos en bodega.',
        colorClass: 'text-purple-800 bg-purple-50 border-purple-200',
      };
    case 'in_transit':
      return {
        label: 'En Camino',
        description: 'El repartidor está en ruta hacia tu dirección.',
        colorClass: 'text-indigo-800 bg-indigo-50 border-indigo-200',
      };
    case 'delivered':
      return {
        label: 'Entregado',
        description: 'Pedido entregado satisfactoriamente en destino.',
        colorClass: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      };
    case 'cancelled':
      return {
        label: 'Cancelado',
        description: 'El pedido fue cancelado.',
        colorClass: 'text-rose-800 bg-rose-50 border-rose-200',
      };
  }
}

/**
 * Format currency in EUR or USD cleanly
 */
export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol}${amount.toFixed(2)}`;
}

/**
 * Stock check helper
 */
export function checkStockAvailable(product: Product, quantityToAdd: number, currentInCart = 0): {
  allowed: boolean;
  maxCanAdd: number;
  message?: string;
} {
  if (!product.inStock || product.stockQuantity <= 0) {
    return { allowed: false, maxCanAdd: 0, message: 'Producto agotado temporalmente.' };
  }
  const remaining = product.stockQuantity - currentInCart;
  if (remaining <= 0) {
    return {
      allowed: false,
      maxCanAdd: 0,
      message: `Has alcanzado el stock máximo disponible (${product.stockQuantity} ${product.unit}).`,
    };
  }
  if (quantityToAdd > remaining) {
    return {
      allowed: false,
      maxCanAdd: remaining,
      message: `Solo quedan ${remaining} ${product.unit} disponibles en inventario.`,
    };
  }
  return { allowed: true, maxCanAdd: remaining };
}

/**
 * Luhn algorithm card check for credit cards
 */
export function isValidLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

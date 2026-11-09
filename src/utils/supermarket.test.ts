import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  validateCoupon,
  canTransitionOrderStatus,
  checkStockAvailable,
  isValidLuhn,
} from './supermarket.ts';
import { CartItem, Coupon, Product } from '../types/index.ts';

const mockProduct: Product = {
  id: 'prod-1',
  sku: 'FRU-001',
  name: 'Plátano de Canarias',
  description: 'Plátano madurado en árbol',
  category: 'frutas-verduras',
  price: 2.50,
  unit: 'kg',
  unitStep: 0.5,
  stockQuantity: 10,
  inStock: true,
  image: '/images/banana.jpg',
  tags: ['organico'],
  createdAt: new Date().toISOString(),
};

test('Cart calculations: basic items and free delivery threshold', () => {
  const items: CartItem[] = [
    {
      productId: 'prod-1',
      product: mockProduct,
      quantity: 2,
      unitPrice: 2.50,
      lineTotal: 5.00,
    },
  ];

  // Subtotal = $5.00. Under $40 threshold, so standard delivery fee $3.99 applies.
  // Tax rate = 10% on $5.00 => $0.50.
  // Total = 5.00 + 3.99 + 0.50 = $9.49.
  const result = calculateCartTotals({
    items,
    freeDeliveryThreshold: 40.0,
    standardDeliveryFee: 3.99,
    taxRate: 0.10,
  });

  assert.equal(result.subtotal, 5.00);
  assert.equal(result.discount, 0);
  assert.equal(result.deliveryFee, 3.99);
  assert.equal(result.tax, 0.50);
  assert.equal(result.total, 9.49);
  assert.equal(result.isFreeDelivery, false);
  assert.equal(result.freeDeliveryRemaining, 35.00);
});

test('Cart calculations: qualifies for free delivery when >= $40', () => {
  const items: CartItem[] = [
    {
      productId: 'prod-1',
      product: mockProduct,
      quantity: 20,
      unitPrice: 2.50,
      lineTotal: 50.00,
    },
  ];

  const result = calculateCartTotals({
    items,
    freeDeliveryThreshold: 40.0,
    standardDeliveryFee: 3.99,
    taxRate: 0.10,
  });

  assert.equal(result.subtotal, 50.00);
  assert.equal(result.deliveryFee, 0);
  assert.equal(result.isFreeDelivery, true);
  assert.equal(result.freeDeliveryRemaining, 0);
  assert.equal(result.tax, 5.00);
  assert.equal(result.total, 55.00);
});

test('Coupon calculations: percentage discount and minimum purchase validation', () => {
  const coupon: Coupon = {
    code: 'FRESCO10',
    discountPercent: 10,
    minPurchase: 20,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
    timesUsed: 0,
  };

  // Subtotal 15 fails minPurchase 20
  const invalidSubtotalCheck = validateCoupon(coupon, 15);
  assert.equal(invalidSubtotalCheck.valid, false);

  // Subtotal 30 passes minPurchase 20
  const validSubtotalCheck = validateCoupon(coupon, 30);
  assert.equal(validSubtotalCheck.valid, true);

  // Expired coupon fails
  const expiredCoupon: Coupon = {
    ...coupon,
    expiresAt: new Date(Date.now() - 10000).toISOString(),
  };
  const expiredCheck = validateCoupon(expiredCoupon, 50);
  assert.equal(expiredCheck.valid, false);

  // Applying 10% discount on $30 => discount = $3.00, discountedSubtotal = $27.00
  const items: CartItem[] = [
    {
      productId: 'prod-1',
      product: mockProduct,
      quantity: 12,
      unitPrice: 2.50,
      lineTotal: 30.00,
    },
  ];
  const cartResult = calculateCartTotals({
    items,
    coupon,
    freeDeliveryThreshold: 40.0,
    standardDeliveryFee: 3.99,
    taxRate: 0.10,
  });

  assert.equal(cartResult.subtotal, 30.00);
  assert.equal(cartResult.discount, 3.00);
  assert.equal(cartResult.appliedCouponCode, 'FRESCO10');
  // Tax = 10% of 27.00 = 2.70
  assert.equal(cartResult.tax, 2.70);
  // Total = 27.00 + 3.99 + 2.70 = 33.69
  assert.equal(cartResult.total, 33.69);
});

test('Order lifecycle transitions adhere to state machine constraints', () => {
  // Valid forward transitions
  assert.equal(canTransitionOrderStatus('received', 'confirmed'), true);
  assert.equal(canTransitionOrderStatus('confirmed', 'preparing'), true);
  assert.equal(canTransitionOrderStatus('preparing', 'in_transit'), true);
  assert.equal(canTransitionOrderStatus('in_transit', 'delivered'), true);

  // Cancellations allowed prior to delivery
  assert.equal(canTransitionOrderStatus('received', 'cancelled'), true);
  assert.equal(canTransitionOrderStatus('preparing', 'cancelled'), true);

  // Terminal states cannot transition
  assert.equal(canTransitionOrderStatus('delivered', 'preparing'), false);
  assert.equal(canTransitionOrderStatus('cancelled', 'confirmed'), false);

  // Jumping ahead directly is prevented
  assert.equal(canTransitionOrderStatus('received', 'delivered'), false);
});

test('Stock availability constraints', () => {
  // Product with 10 units in stock
  const allowedCheck = checkStockAvailable(mockProduct, 5, 0);
  assert.equal(allowedCheck.allowed, true);

  // Already 8 in cart, trying to add 3 more exceeds stock (11 > 10)
  const exceededCheck = checkStockAvailable(mockProduct, 3, 8);
  assert.equal(exceededCheck.allowed, false);
  assert.equal(exceededCheck.maxCanAdd, 2);

  // Out of stock product
  const outOfStockProduct = { ...mockProduct, inStock: false, stockQuantity: 0 };
  const outOfStockCheck = checkStockAvailable(outOfStockProduct, 1, 0);
  assert.equal(outOfStockCheck.allowed, false);
});

test('Luhn credit card algorithm validation', () => {
  // Test common valid Luhn numbers
  assert.equal(isValidLuhn('4532015112830366'), true);
  // Invalid Luhn number
  assert.equal(isValidLuhn('4532015112830367'), false);
  // Invalid length
  assert.equal(isValidLuhn('123'), false);
});

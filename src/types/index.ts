export type Role = 'customer' | 'admin';

export type UnitType = 'kg' | 'g' | 'unidad' | 'pack' | 'litro' | 'manojo';

export interface NutritionalInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
  fiber?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  compareAtPrice?: number;
  unit: UnitType;
  unitStep: number;
  stockQuantity: number;
  inStock: boolean;
  image: string;
  tags: string[]; // e.g. ['organico', 'sin_gluten', 'oferta', 'local', 'vegano']
  origin?: string;
  nutritionalInfo?: NutritionalInfo;
  isFeatured?: boolean;
  barcode?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  bannerImage?: string;
  productCount?: number;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Address {
  id: string;
  label: string; // e.g. "Casa", "Oficina"
  recipient: string;
  street: string;
  apartment?: string;
  city: string;
  postalCode: string;
  phone: string;
  instructions?: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  addresses: Address[];
  createdAt: string;
}

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'in_transit'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  unit: UnitType;
  quantity: number;
  price: number;
  lineTotal: number;
  image?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: Address;
  deliveryDate: string;
  deliverySlot: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: 'credit_card' | 'cash_on_delivery' | 'bank_transfer';
  paymentStatus: 'paid' | 'pending';
  orderStatus: OrderStatus;
  statusHistory: OrderStatusEvent[];
  notes?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountPercent?: number; // e.g. 10 for 10%
  discountFixed?: number; // e.g. 5 for $5.00
  minPurchase: number;
  isFreeShipping?: boolean;
  expiresAt: string;
  isActive: boolean;
  timesUsed: number;
  maxUses?: number;
}

export interface StoreSettings {
  storeName: string;
  storeAddress: string;
  storePhone: string;
  supportEmail: string;
  standardDeliveryFee: number;
  freeDeliveryThreshold: number;
  taxRate: number; // e.g. 0.10 for 10%
  currencySymbol: string;
  currencyCode: string;
  workingHours: string;
  announcementBanner: {
    enabled: boolean;
    text: string;
  };
}

export interface DeliverySlotOption {
  id: string;
  dayLabel: string; // "Hoy", "Mañana", "Miércoles 11 Nov"
  date: string;
  timeRange: string;
  available: boolean;
}

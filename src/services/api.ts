import {
  CartItem,
  Category,
  Coupon,
  DeliverySlotOption,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
  User,
} from '../types';

const TOKEN_KEY = 'mercadofresco_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Error en la petición (${response.status})`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetchApi<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setStoredToken(res.token);
    return res;
  },

  async register(data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> {
    const res = await fetchApi<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setStoredToken(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return fetchApi<{ user: User }>('/api/auth/me');
  },

  async updateProfile(data: { name: string; phone?: string }): Promise<{ user: User }> {
    return fetchApi<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout() {
    setStoredToken(null);
  },

  // Products
  async getProducts(params?: {
    category?: string;
    search?: string;
    tag?: string;
    sort?: string;
    inStockOnly?: boolean;
  }): Promise<{ products: Product[] }> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.tag) query.append('tag', params.tag);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.inStockOnly) query.append('inStockOnly', 'true');

    const qs = query.toString();
    return fetchApi<{ products: Product[] }>(`/api/products${qs ? `?${qs}` : ''}`);
  },

  async getProduct(id: string): Promise<{ product: Product }> {
    return fetchApi<{ product: Product }>(`/api/products/${id}`);
  },

  async createProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<{ product: Product }> {
    return fetchApi<{ product: Product }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ product: Product }> {
    return fetchApi<{ product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateProductStock(id: string, stockQuantity: number): Promise<{ product: Product }> {
    return fetchApi<{ product: Product }>(`/api/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stockQuantity }),
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Categories
  async getCategories(): Promise<{ categories: Category[] }> {
    return fetchApi<{ categories: Category[] }>('/api/categories');
  },

  // Coupons
  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon: Coupon }> {
    return fetchApi<{ valid: boolean; coupon: Coupon }>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code, subtotal }),
    });
  },

  async getCoupons(): Promise<{ coupons: Coupon[] }> {
    return fetchApi<{ coupons: Coupon[] }>('/api/coupons');
  },

  async createCoupon(couponData: Omit<Coupon, 'timesUsed'>): Promise<{ coupon: Coupon }> {
    return fetchApi<{ coupon: Coupon }>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(couponData),
    });
  },

  async deleteCoupon(code: string): Promise<{ success: boolean }> {
    return fetchApi<{ success: boolean }>(`/api/coupons/${code}`, {
      method: 'DELETE',
    });
  },

  // Orders
  async createOrder(orderData: any): Promise<{ order: Order }> {
    return fetchApi<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  async getOrders(params?: { email?: string; orderNumber?: string; status?: string }): Promise<{ orders: Order[] }> {
    const query = new URLSearchParams();
    if (params?.email) query.append('email', params.email);
    if (params?.orderNumber) query.append('orderNumber', params.orderNumber);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString();
    return fetchApi<{ orders: Order[] }>(`/api/orders${qs ? `?${qs}` : ''}`);
  },

  async getOrder(id: string): Promise<{ order: Order }> {
    return fetchApi<{ order: Order }>(`/api/orders/${id}`);
  },

  async updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<{ order: Order }> {
    return fetchApi<{ order: Order }>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  // Settings & Slots
  async getSettings(): Promise<{ settings: StoreSettings }> {
    return fetchApi<{ settings: StoreSettings }>('/api/store/settings');
  },

  async updateSettings(settings: Partial<StoreSettings>): Promise<{ settings: StoreSettings }> {
    return fetchApi<{ settings: StoreSettings }>('/api/store/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  async getDeliverySlots(): Promise<{ slots: DeliverySlotOption[] }> {
    return fetchApi<{ slots: DeliverySlotOption[] }>('/api/delivery-slots');
  },

  async getAdminMetrics(): Promise<{ metrics: any }> {
    return fetchApi<{ metrics: any }>('/api/admin/metrics');
  },
};

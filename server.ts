import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import { db } from './src/server/db';
import { createServer as createViteServer } from 'vite';
import { validateCoupon } from './src/utils/supermarket';
import { DeliverySlotOption, OrderStatus } from './src/types';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.JWT_SECRET || 'mercadofresco-prod-key-9921';

app.use(express.json());

// Extend express Request to hold authenticated user
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'customer' | 'admin';
    name: string;
  };
}

// Authentication middleware
function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Sesión expirada o token inválido.' });
  }
}

// Optional auth middleware (identifies user if token is present, does not reject if missing)
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
      req.user = decoded;
    } catch {
      // ignore
    }
  }
  next();
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
}

// ==========================================
// AUTHENTICATION ENDPOINTS
// ==========================================
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const safeUser = db.createUser({
      name,
      email,
      password,
      phone,
      role: 'customer',
    });

    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Error al registrar usuario.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Ingresa tu correo y contraseña.' });
    }

    const safeUser = db.verifyCredentials(email, password);
    if (!safeUser) {
      return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const token = jwt.sign(
      { id: safeUser.id, email: safeUser.email, role: safeUser.role, name: safeUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Error interno en el servidor.' });
  }
});

app.get('/api/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  const user = db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado.' });
  }
  res.json({ user });
});

app.put('/api/auth/profile', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const updated = db.updateUserProfile(req.user!.id, { name, phone });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/addresses', authenticate, (req: AuthRequest, res: Response) => {
  try {
    const address = req.body;
    if (!address.street || !address.city || !address.recipient) {
      return res.status(400).json({ error: 'Campos requeridos de dirección incompletos.' });
    }
    const createdAddress = db.addUserAddress(req.user!.id, address);
    res.status(201).json({ address: createdAddress });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================
app.get('/api/products', (req: Request, res: Response) => {
  const { category, search, tag, sort, inStockOnly } = req.query;
  const products = db.getProducts({
    category: category as string,
    search: search as string,
    tag: tag as string,
    sort: sort as any,
    inStockOnly: inStockOnly === 'true',
  });
  res.json({ products });
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado.' });
  }
  res.json({ product });
});

app.post('/api/products', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const productData = req.body;
    if (!productData.name || !productData.price || !productData.category) {
      return res.status(400).json({ error: 'Nombre, precio y categoría son obligatorios.' });
    }
    const newProduct = db.createProduct(productData);
    res.status(201).json({ product: newProduct });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateProduct(req.params.id, req.body);
    res.json({ product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/products/:id/stock', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { stockQuantity } = req.body;
    if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
      return res.status(400).json({ error: 'Cantidad de stock inválida.' });
    }
    const updated = db.updateProduct(req.params.id, {
      stockQuantity,
      inStock: stockQuantity > 0,
    });
    res.json({ product: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    db.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Producto eliminado correctamente.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================
app.get('/api/categories', (req: Request, res: Response) => {
  const categories = db.getCategories();
  res.json({ categories });
});

// ==========================================
// COUPONS ENDPOINTS
// ==========================================
app.post('/api/coupons/validate', (req: Request, res: Response) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Ingresa un código de cupón.' });
  }
  const coupon = db.getCouponByCode(code);
  const validation = validateCoupon(coupon, Number(subtotal) || 0);

  if (!validation.valid) {
    return res.status(400).json({ error: validation.reason });
  }

  res.json({
    valid: true,
    coupon: {
      code: coupon!.code,
      discountPercent: coupon!.discountPercent,
      discountFixed: coupon!.discountFixed,
      isFreeShipping: coupon!.isFreeShipping,
      minPurchase: coupon!.minPurchase,
    },
  });
});

app.get('/api/coupons', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const coupons = db.getCoupons();
  res.json({ coupons });
});

app.post('/api/coupons', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const couponData = req.body;
    const newCoupon = db.createCoupon(couponData);
    res.status(201).json({ coupon: newCoupon });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/coupons/:code', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    db.deleteCoupon(req.params.code);
    res.json({ success: true, message: 'Cupón eliminado.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================
app.post('/api/orders', optionalAuth, (req: AuthRequest, res: Response) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate,
      deliverySlot,
      items,
      subtotal,
      discount,
      couponCode,
      deliveryFee,
      tax,
      total,
      paymentMethod,
      notes,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'El carrito no contiene productos.' });
    }
    if (!customerName || !customerEmail || !deliveryAddress) {
      return res.status(400).json({ error: 'Datos de cliente y entrega incompletos.' });
    }

    // Validate stock for all items prior to placing order
    for (const item of items) {
      const prod = db.getProductById(item.productId);
      if (!prod || prod.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: `Stock insuficiente para ${item.name}. Disponibles: ${prod ? prod.stockQuantity : 0}`,
        });
      }
    }

    const newOrder = db.createOrder({
      userId: req.user?.id,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      deliveryDate: deliveryDate || new Date().toISOString().split('T')[0],
      deliverySlot: deliverySlot || 'Inmediato (90 mins)',
      items,
      subtotal,
      discount: discount || 0,
      couponCode,
      deliveryFee: deliveryFee || 0,
      tax: tax || 0,
      total,
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
      orderStatus: 'received',
      notes,
    });

    res.status(201).json({ order: newOrder });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Error al procesar el pedido.' });
  }
});

app.get('/api/orders', optionalAuth, (req: AuthRequest, res: Response) => {
  // If user is admin, can see all or filter.
  // If user is logged-in customer, see own orders.
  // If query specifies email or orderNumber, allow lookup.
  const { email, orderNumber, status } = req.query;

  if (req.user?.role === 'admin') {
    const orders = db.getOrders({ status: status as OrderStatus });
    return res.json({ orders });
  }

  if (req.user) {
    const orders = db.getOrders({ userId: req.user.id });
    return res.json({ orders });
  }

  if (email) {
    const all = db.getOrders();
    const userOrders = all.filter((o) => o.customerEmail.toLowerCase() === String(email).toLowerCase());
    return res.json({ orders: userOrders });
  }

  if (orderNumber) {
    const order = db.getOrderById(String(orderNumber));
    return res.json({ orders: order ? [order] : [] });
  }

  return res.json({ orders: [] });
});

app.get('/api/orders/:id', (req: Request, res: Response) => {
  const order = db.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }
  res.json({ order });
});

app.patch('/api/orders/:id/status', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const { status, note } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Estado requerido.' });
    }
    const updated = db.updateOrderStatus(req.params.id, status as OrderStatus, note);
    res.json({ order: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// STORE SETTINGS & SLOTS
// ==========================================
app.get('/api/store/settings', (req: Request, res: Response) => {
  const settings = db.getSettings();
  res.json({ settings });
});

app.put('/api/store/settings', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json({ settings: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/delivery-slots', (req: Request, res: Response) => {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const dayAfter = new Date(today.getTime() + 86400000 * 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const slots: DeliverySlotOption[] = [
    {
      id: 'slot-today-1',
      dayLabel: 'Hoy',
      date: formatDate(today),
      timeRange: '19:00 - 21:00 (Express Nocturno)',
      available: true,
    },
    {
      id: 'slot-tmw-1',
      dayLabel: 'Mañana',
      date: formatDate(tomorrow),
      timeRange: '09:00 - 11:00 (Mañana Primera Hora)',
      available: true,
    },
    {
      id: 'slot-tmw-2',
      dayLabel: 'Mañana',
      date: formatDate(tomorrow),
      timeRange: '14:00 - 16:00 (Mediodía)',
      available: true,
    },
    {
      id: 'slot-tmw-3',
      dayLabel: 'Mañana',
      date: formatDate(tomorrow),
      timeRange: '18:00 - 20:00 (Tarde)',
      available: true,
    },
    {
      id: 'slot-after-1',
      dayLabel: 'Pasado Mañana',
      date: formatDate(dayAfter),
      timeRange: '10:00 - 12:00 (Mañana)',
      available: true,
    },
  ];

  res.json({ slots });
});

app.get('/api/admin/metrics', authenticate, requireAdmin, (req: AuthRequest, res: Response) => {
  const metrics = db.getAdminMetrics();
  res.json({ metrics });
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC
// ==========================================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MercadoFresco Server running at http://0.0.0.0:${PORT} [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}]`);
  });
}

startServer();

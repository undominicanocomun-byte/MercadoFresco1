import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Category, Coupon, Order, OrderStatus, Product, StoreSettings } from '../types';
import { formatCurrency, getOrderStatusLabel } from '../utils/supermarket';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Tag,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Truck,
  ArrowLeft,
  Printer,
  X,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'orders' | 'coupons' | 'settings'>('metrics');
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Product CRUD Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: 'frutas-verduras',
    subcategory: '',
    price: 0,
    compareAtPrice: 0,
    unit: 'kg' as any,
    unitStep: 1,
    stockQuantity: 10,
    image: '',
    tags: 'organico,local',
    origin: '',
    barcode: '',
  });

  // Coupon Creation State
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountPercent: 10,
    discountFixed: 0,
    minPurchase: 20,
    isFreeShipping: false,
    expiresAt: '2030-12-31T23:59:59Z',
    isActive: true,
  });

  // Inline stock edit tracker
  const [inlineStocks, setInlineStocks] = useState<Record<string, number>>({});

  const showNotification = (text: string, error = false) => {
    setActionMessage({ text, error });
    setTimeout(() => setActionMessage(null), 3500);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [metRes, prodRes, catRes, ordRes, coupRes, setRes] = await Promise.all([
        api.getAdminMetrics(),
        api.getProducts(),
        api.getCategories(),
        api.getOrders(),
        api.getCoupons(),
        api.getSettings(),
      ]);

      setMetrics(metRes.metrics);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      setOrders(ordRes.orders);
      setCoupons(coupRes.coupons);
      setSettings(setRes.settings);

      // Initialize inline stocks
      const initialStockMap: Record<string, number> = {};
      prodRes.products.forEach((p) => {
        initialStockMap[p.id] = p.stockQuantity;
      });
      setInlineStocks(initialStockMap);
    } catch (e: any) {
      showNotification(e.message || 'Error al cargar datos del panel', true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Update order status with 1 click
  const handleUpdateOrderStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await api.updateOrderStatus(orderId, nextStatus);
      showNotification(`Estado de pedido actualizado a: ${nextStatus}`);
      loadAllData();
    } catch (err: any) {
      showNotification(err.message, true);
    }
  };

  // Inline save stock
  const handleSaveStock = async (productId: string) => {
    const newStock = inlineStocks[productId];
    if (typeof newStock !== 'number') return;
    try {
      await api.updateProductStock(productId, newStock);
      showNotification('Stock actualizado correctamente');
      loadAllData();
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`¿Seguro que deseas eliminar ${name}?`)) return;
    try {
      await api.deleteProduct(id);
      showNotification(`Producto "${name}" eliminado`);
      loadAllData();
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  // Save product (Create or Edit)
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        sku: productForm.sku || `SKU-${Date.now()}`,
        name: productForm.name,
        description: productForm.description,
        category: productForm.category,
        subcategory: productForm.subcategory || undefined,
        price: Number(productForm.price),
        compareAtPrice: productForm.compareAtPrice ? Number(productForm.compareAtPrice) : undefined,
        unit: productForm.unit,
        unitStep: Number(productForm.unitStep) || 1,
        stockQuantity: Number(productForm.stockQuantity),
        inStock: Number(productForm.stockQuantity) > 0,
        image: productForm.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
        tags: productForm.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean),
        origin: productForm.origin || undefined,
        barcode: productForm.barcode || undefined,
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showNotification('Producto modificado con éxito');
      } else {
        await api.createProduct(payload as any);
        showNotification('Nuevo producto añadido al catálogo');
      }

      setShowProductModal(false);
      setEditingProduct(null);
      loadAllData();
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  // Create coupon submit
  const handleCreateCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: couponForm.code,
        discountPercent: couponForm.discountPercent ? Number(couponForm.discountPercent) : undefined,
        discountFixed: couponForm.discountFixed ? Number(couponForm.discountFixed) : undefined,
        minPurchase: Number(couponForm.minPurchase),
        isFreeShipping: couponForm.isFreeShipping,
        expiresAt: couponForm.expiresAt,
        isActive: couponForm.isActive,
      });
      showNotification(`Cupón ${couponForm.code.toUpperCase()} creado`);
      setShowCouponModal(false);
      loadAllData();
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (code: string) => {
    if (!window.confirm(`¿Eliminar cupón ${code}?`)) return;
    try {
      await api.deleteCoupon(code);
      showNotification(`Cupón ${code} eliminado`);
      loadAllData();
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  // Save Settings submit
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await api.updateSettings(settings);
      showNotification('Configuración de la tienda guardada');
      loadAllData();
    } catch (e: any) {
      showNotification(e.message, true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Admin Top Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-sm">
              ⚙️
            </span>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                <span>Panel Administrativo MercadoFresco</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                  LIVE DB
                </span>
              </h1>
              <p className="text-xs text-slate-400">Control de inventario, pedidos en bodega y métricas</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAllData}
              title="Recargar datos"
              aria-label="Recargar datos"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onBackToStore}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </button>
          </div>
        </div>
      </header>

      {/* Floating Action Alert */}
      {actionMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              actionMessage.error
                ? 'bg-rose-50 text-rose-800 border-rose-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="p-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs mb-6">
          {[
            { id: 'metrics', label: 'Métricas & Resumen', icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: 'products', label: `Productos (${products.length})`, icon: <Package className="w-4 h-4" /> },
            { id: 'orders', label: `Pedidos (${orders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'coupons', label: `Cupones (${coupons.length})`, icon: <Tag className="w-4 h-4" /> },
            { id: 'settings', label: 'Ajustes Tienda', icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: METRICS & KPI SUMMARY */}
        {activeTab === 'metrics' && metrics && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Ingresos Totales</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {formatCurrency(metrics.totalRevenue)}
                </div>
                <p className="text-[11px] text-emerald-700 mt-1">Facturación acumulada en órdenes confirmadas</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pedidos Totales</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {metrics.totalOrders}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Transacciones procesadas en el sistema</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Pedidos en Curso</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 font-mono tabular-nums">
                  {metrics.activeOrdersCount}
                </div>
                <p className="text-[11px] text-purple-700 mt-1">Órdenes en preparación o en reparto</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">Alertas Stock Bajo</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-amber-900 font-mono tabular-nums">
                  {metrics.lowStockCount}
                </div>
                <p className="text-[11px] text-amber-700 mt-1">Productos con menos de 10 unidades</p>
              </div>
            </div>

            {/* Recent Orders table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Actividad Reciente de Pedidos</h2>
                  <p className="text-xs text-slate-500">Últimas transacciones registradas en el supermercado</p>
                </div>
                <button
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
                >
                  Ver todos los pedidos
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3.5">Nº Pedido</th>
                      <th className="p-3.5">Cliente</th>
                      <th className="p-3.5">Franja Entrega</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {metrics.recentOrders.map((ord: Order) => {
                      const label = getOrderStatusLabel(ord.orderStatus);
                      return (
                        <tr key={ord.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 font-mono font-bold text-slate-900">#{ord.orderNumber}</td>
                          <td className="p-3.5">
                            <span className="font-semibold text-slate-800 block">{ord.customerName}</span>
                            <span className="text-[10px] text-slate-400">{ord.customerPhone}</span>
                          </td>
                          <td className="p-3.5 text-slate-600">{ord.deliverySlot}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-950">{formatCurrency(ord.total)}</td>
                          <td className="p-3.5">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${label.colorClass}`}>
                              {label.label}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <select
                              value={ord.orderStatus}
                              onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                              className="text-xs font-semibold px-2 py-1 bg-slate-100 border border-slate-300 rounded-lg focus:outline-none"
                            >
                              <option value="received">Recibido</option>
                              <option value="confirmed">Confirmado</option>
                              <option value="preparing">Empacando</option>
                              <option value="in_transit">En Ruta</option>
                              <option value="delivered">Entregado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Catálogo de Productos Frescos y Despensa</h2>
                <p className="text-xs text-slate-500">Administra precios, descripciones, stock y disponibilidad</p>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    sku: `SKU-${Date.now().toString().slice(-4)}`,
                    name: '',
                    description: '',
                    category: 'frutas-verduras',
                    subcategory: '',
                    price: 2.99,
                    compareAtPrice: 0,
                    unit: 'kg',
                    unitStep: 1,
                    stockQuantity: 20,
                    image: '',
                    tags: 'organico,local',
                    origin: 'España',
                    barcode: '',
                  });
                  setShowProductModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Añadir Producto</span>
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Producto</th>
                      <th className="p-3.5">Categoría</th>
                      <th className="p-3.5">Precio / Unidad</th>
                      <th className="p-3.5">Stock en Bodega</th>
                      <th className="p-3.5">Estado</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 flex items-center gap-3">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{prod.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</span>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-600">
                          <span className="capitalize">{prod.category}</span>
                          {prod.subcategory && <span className="text-slate-400 block text-[10px]">{prod.subcategory}</span>}
                        </td>

                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {formatCurrency(prod.price)} / {prod.unit}
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={inlineStocks[prod.id] ?? prod.stockQuantity}
                              onChange={(e) =>
                                setInlineStocks({
                                  ...inlineStocks,
                                  [prod.id]: Math.max(0, parseInt(e.target.value, 10) || 0),
                                })
                              }
                              className="w-16 px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-bold text-center"
                            />
                            <button
                              onClick={() => handleSaveStock(prod.id)}
                              title="Guardar nuevo stock"
                              className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5">
                          {prod.stockQuantity > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              En Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Agotado
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm({
                                sku: prod.sku,
                                name: prod.name,
                                description: prod.description,
                                category: prod.category,
                                subcategory: prod.subcategory || '',
                                price: prod.price,
                                compareAtPrice: prod.compareAtPrice || 0,
                                unit: prod.unit,
                                unitStep: prod.unitStep,
                                stockQuantity: prod.stockQuantity,
                                image: prod.image,
                                tags: prod.tags.join(', '),
                                origin: prod.origin || '',
                                barcode: prod.barcode || '',
                              });
                              setShowProductModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Gestión Operativa de Pedidos</h2>
                <p className="text-xs text-slate-500">Controla el despacho, empaque y cambio de estado en vivo</p>
              </div>
            </div>

            <div className="space-y-3">
              {orders.map((order) => {
                const label = getOrderStatusLabel(order.orderStatus);
                return (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-slate-900">#{order.orderNumber}</span>
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-lg font-bold border ${label.colorClass}`}>
                            {label.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cliente: <span className="font-semibold text-slate-800">{order.customerName}</span> ({order.customerPhone}) · {order.customerEmail}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Cambiar estado:</span>
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                          className="text-xs font-bold px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none cursor-pointer"
                        >
                          <option value="received">1. Recibido</option>
                          <option value="confirmed">2. Confirmado</option>
                          <option value="preparing">3. Empacando en Bodega</option>
                          <option value="in_transit">4. En Ruta con Repartidor</option>
                          <option value="delivered">5. Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>

                    {/* Order Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px] mb-1">
                          Dirección de Envío
                        </span>
                        <p className="font-medium text-slate-800">
                          {order.deliveryAddress.street}
                          {order.deliveryAddress.apartment ? `, ${order.deliveryAddress.apartment}` : ''}
                        </p>
                        <p className="text-slate-600">
                          {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                        </p>
                        {order.notes && <p className="text-amber-800 mt-1 italic">"{order.notes}"</p>}
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px] mb-1">
                          Horario & Pago
                        </span>
                        <p className="font-bold text-emerald-950">{order.deliverySlot}</p>
                        <p className="text-slate-600 capitalize">Método: {order.paymentMethod.replace('_', ' ')}</p>
                        <p className="text-slate-600">
                          Estado: <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                        <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px] mb-1">
                          Resumen Económico
                        </span>
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span className="font-mono">{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-700">
                            <span>Descuento:</span>
                            <span className="font-mono">-{formatCurrency(order.discount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1 mt-1">
                          <span>Total:</span>
                          <span className="font-mono text-emerald-950">{formatCurrency(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Items chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-xs text-slate-500 font-medium">Contenido:</span>
                      {order.items.map((item, i) => (
                        <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md font-medium">
                          {item.name} × {item.quantity} {item.unit}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COUPONS */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Cupones y Promociones Activas</h2>
                <p className="text-xs text-slate-500">Crea códigos de descuento en porcentaje o monto fijo</p>
              </div>

              <button
                onClick={() => setShowCouponModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Cupón</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => (
                <div key={c.code} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-base text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {c.code}
                    </span>
                    <button
                      onClick={() => handleDeleteCoupon(c.code)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-xs space-y-1 text-slate-600">
                    <p className="font-bold text-slate-900">
                      {c.isFreeShipping
                        ? 'Envío Gratuito'
                        : c.discountPercent
                        ? `${c.discountPercent}% de Descuento`
                        : `${formatCurrency(c.discountFixed || 0)} de Descuento`}
                    </p>
                    <p>Compra mínima: {formatCurrency(c.minPurchase)}</p>
                    <p>Veces utilizado: <span className="font-mono font-bold text-slate-900">{c.timesUsed}</span></p>
                    <p className="text-slate-400 text-[11px]">Expira: {new Date(c.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STORE SETTINGS */}
        {activeTab === 'settings' && settings && (
          <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Configuración Comercial y Logística</h2>
              <p className="text-xs text-slate-500">Valores de envío, impuestos, moneda y mensaje promocional</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Costo de Envío Estándar ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settings.standardDeliveryFee}
                    onChange={(e) => setSettings({ ...settings, standardDeliveryFee: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mínimo para Envío Gratis ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={settings.freeDeliveryThreshold}
                    onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Texto del Banner Superior Promocional</label>
                <input
                  type="text"
                  value={settings.announcementBanner.text}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      announcementBanner: { ...settings.announcementBanner, text: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono de Soporte</label>
                  <input
                    type="text"
                    value={settings.storePhone}
                    onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Horario de Operación</label>
                  <input
                    type="text"
                    value={settings.workingHours}
                    onChange={(e) => setSettings({ ...settings, workingHours: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
              >
                Guardar Cambios
              </button>
            </form>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Editar Producto' : 'Añadir Nuevo Producto al Supermercado'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Nombre del Alimento *</label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Ej: Mango de Avión Bio"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">SKU / Código Único *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Descripción Detallada *</label>
                <textarea
                  required
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Detalles sobre sabor, maduración y calidad fresca"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Precio ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unidad de Medida</label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({ ...productForm, unit: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  >
                    <option value="kg">kg</option>
                    <option value="unidad">unidad</option>
                    <option value="pack">pack</option>
                    <option value="litro">litro</option>
                    <option value="g">gramos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    required
                    value={productForm.stockQuantity}
                    onChange={(e) => setProductForm({ ...productForm, stockQuantity: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">URL de Imagen</label>
                  <input
                    type="url"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">Crear Nuevo Cupón Promocional</h3>
              <button onClick={() => setShowCouponModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCouponSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">Código del Cupón (ej: FRESCO15) *</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Descuento (%)</label>
                  <input
                    type="number"
                    value={couponForm.discountPercent}
                    onChange={(e) => setCouponForm({ ...couponForm, discountPercent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Compra Mínima ($)</label>
                  <input
                    type="number"
                    value={couponForm.minPurchase}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchase: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={couponForm.isFreeShipping}
                  onChange={(e) => setCouponForm({ ...couponForm, isFreeShipping: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-semibold text-slate-700">Otorga Envío Gratis directo</span>
              </label>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                >
                  Crear Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

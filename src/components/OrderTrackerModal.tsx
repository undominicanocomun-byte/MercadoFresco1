import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, getOrderStatusLabel } from '../utils/supermarket';
import {
  X,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  RefreshCw,
  ShoppingBag,
  Printer,
  AlertCircle,
  Phone,
} from 'lucide-react';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderId?: string;
}

const statusOrder: OrderStatus[] = ['received', 'confirmed', 'preparing', 'in_transit', 'delivered'];

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  initialOrderId,
}) => {
  const { user } = useAuth();
  const { addItem, openCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchCode, setSearchCode] = useState(initialOrderId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getOrders(user?.email ? { email: user.email } : undefined);
      setOrders(res.orders);

      if (initialOrderId) {
        const found = res.orders.find((o) => o.orderNumber === initialOrderId || o.id === initialOrderId);
        if (found) {
          setSelectedOrder(found);
        } else {
          // fetch single
          const single = await api.getOrder(initialOrderId);
          if (single.order) setSelectedOrder(single.order);
        }
      } else if (res.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchOrders();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSearchOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    setIsLoading(true);
    setSearchError(null);
    try {
      const clean = searchCode.trim().toUpperCase();
      const res = await api.getOrder(clean);
      if (res.order) {
        setSelectedOrder(res.order);
      } else {
        setSearchError(`No se encontró el pedido con número ${clean}.`);
      }
    } catch {
      setSearchError(`No se encontró el pedido con código ${searchCode}.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    let count = 0;
    for (const item of order.items) {
      // Find or build minimal product
      addItem(
        {
          id: item.productId,
          sku: item.productId,
          name: item.name,
          description: '',
          category: 'varios',
          price: item.price,
          unit: item.unit,
          unitStep: 1,
          stockQuantity: 99,
          inStock: true,
          image: item.image || '',
          tags: [],
          createdAt: '',
        },
        item.quantity
      );
      count++;
    }
    onClose();
    openCart();
  };

  const currentStatusIndex = selectedOrder
    ? statusOrder.indexOf(selectedOrder.orderStatus)
    : -1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tracker-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="tracker-modal-title" className="text-base font-bold text-slate-900">
                Seguimiento & Historial de Pedidos
              </h2>
              <p className="text-xs text-slate-500">Consulta el estado en vivo de tu compra en bodega y reparto</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              title="Actualizar estado"
              aria-label="Actualizar estado"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar modal de pedidos"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Split: Left Order Selector & Right Tracker */}
        <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Order Selector / Search */}
          <div className="md:col-span-4 border-r border-slate-200 p-4 bg-slate-50/50 flex flex-col overflow-y-auto max-h-[300px] md:max-h-none">
            {/* Search Input */}
            <form onSubmit={handleSearchOrder} className="mb-3">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Buscar por Nº Pedido</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Ej: MF-9021"
                  className="w-full pl-8 pr-14 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none font-mono"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <button
                  type="submit"
                  className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Buscar
                </button>
              </div>
              {searchError && <p className="text-[10px] text-rose-600 mt-1">{searchError}</p>}
            </form>

            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tus Pedidos</h3>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No hay pedidos registrados.</p>
            ) : (
              <div className="space-y-2 flex-1">
                {orders.map((ord) => {
                  const isSelected = selectedOrder?.id === ord.id;
                  const label = getOrderStatusLabel(ord.orderStatus);
                  return (
                    <button
                      key={ord.id}
                      onClick={() => setSelectedOrder(ord)}
                      className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-white shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white/70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-xs text-slate-900">#{ord.orderNumber}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-950">
                          {formatCurrency(ord.total)}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${label.colorClass}`}>
                          {label.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Active Order Details & Stepper */}
          <div className="md:col-span-8 p-6 overflow-y-auto space-y-6">
            {selectedOrder ? (
              <>
                {/* Order Meta Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-slate-900 font-mono">
                        Pedido #{selectedOrder.orderNumber}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${
                          getOrderStatusLabel(selectedOrder.orderStatus).colorClass
                        }`}
                      >
                        {getOrderStatusLabel(selectedOrder.orderStatus).label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Realizado el {new Date(selectedOrder.createdAt).toLocaleString()} · Entrega: {selectedOrder.deliverySlot}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReorder(selectedOrder)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Volver a pedir</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      aria-label="Imprimir ticket de compra"
                      className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Visual Status Stepper */}
                <div className="py-2">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                    Estado de Preparación y Reparto
                  </h3>

                  <div className="relative flex items-center justify-between">
                    {/* Connecting Bar */}
                    <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-200 -z-0">
                      <div
                        className="h-full bg-emerald-600 transition-all duration-500"
                        style={{
                          width: `${Math.max(0, (currentStatusIndex / (statusOrder.length - 1)) * 100)}%`,
                        }}
                      />
                    </div>

                    {[
                      { key: 'received', label: 'Recibido' },
                      { key: 'confirmed', label: 'Confirmado' },
                      { key: 'preparing', label: 'Empacando' },
                      { key: 'in_transit', label: 'En Ruta' },
                      { key: 'delivered', label: 'Entregado' },
                    ].map((step, idx) => {
                      const isCompleted = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCurrent
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                                : isCompleted
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {isCompleted ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[11px] mt-1.5 font-medium ${
                              isCurrent ? 'text-emerald-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delivery and Driver details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span>Destino de Envío</span>
                    </div>
                    <p className="font-semibold text-slate-800">{selectedOrder.customerName}</p>
                    <p className="text-slate-600">
                      {selectedOrder.deliveryAddress.street}
                      {selectedOrder.deliveryAddress.apartment ? `, ${selectedOrder.deliveryAddress.apartment}` : ''}
                    </p>
                    <p className="text-slate-600">
                      {selectedOrder.deliveryAddress.postalCode} - {selectedOrder.deliveryAddress.city}
                    </p>
                    <p className="text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {selectedOrder.customerPhone}
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Logística Refrigerada</span>
                    </div>
                    <p className="text-slate-600">
                      Franja: <span className="font-bold text-emerald-900">{selectedOrder.deliverySlot}</span>
                    </p>
                    <p className="text-slate-600">
                      Método de Pago:{' '}
                      <span className="font-medium text-slate-800 uppercase">
                        {selectedOrder.paymentMethod.replace('_', ' ')}
                      </span>
                    </p>
                    <p className="text-slate-600">
                      Estado de Pago:{' '}
                      <span className="text-emerald-700 font-bold">
                        {selectedOrder.paymentStatus === 'paid' ? 'Abonado' : 'Pendiente al entregar'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Itemized summary */}
                <div>
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Artículos en el Pedido ({selectedOrder.items.length})
                  </h3>
                  <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-white">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            />
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            <p className="text-slate-500 text-[11px] font-mono">
                              {item.quantity} {item.unit} x {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                        <span className="font-mono font-bold text-slate-900">
                          {formatCurrency(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Descuento ({selectedOrder.couponCode || 'Cupón'})</span>
                        <span className="font-mono">-{formatCurrency(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Envío</span>
                      <span className="font-mono">
                        {selectedOrder.deliveryFee === 0 ? 'Gratis' : formatCurrency(selectedOrder.deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-black text-slate-900">
                      <span>Total</span>
                      <span className="font-mono text-emerald-950">{formatCurrency(selectedOrder.total)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Selecciona un pedido de la lista para ver su información en tiempo real.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

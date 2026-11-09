import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DeliverySlotOption, Order } from '../types';
import { formatCurrency, isValidLuhn } from '../utils/supermarket';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle,
  Truck,
  CreditCard,
  MapPin,
  Clock,
  Banknote,
  Receipt,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Phone,
  Printer,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { items, totals, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [slots, setSlots] = useState<DeliverySlotOption[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Step 1: Customer & Address Form
  const [formData, setFormData] = useState({
    recipient: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: user?.addresses?.[0]?.street || '',
    apartment: user?.addresses?.[0]?.apartment || '',
    city: user?.addresses?.[0]?.city || 'Madrid',
    postalCode: user?.addresses?.[0]?.postalCode || '28001',
    instructions: user?.addresses?.[0]?.instructions || '',
  });

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cash_on_delivery' | 'bank_transfer'>('credit_card');
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getDeliverySlots().then((res) => {
        setSlots(res.slots);
        if (res.slots.length > 0) {
          setSelectedSlot(res.slots[0].timeRange);
          setSelectedDate(res.slots[0].date);
        }
      });
    }
  }, [isOpen]);

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        recipient: prev.recipient || user.name,
        email: prev.email || user.email,
        phone: prev.phone || user.phone || '',
        street: prev.street || user.addresses?.[0]?.street || '',
        apartment: prev.apartment || user.addresses?.[0]?.apartment || '',
        city: prev.city || user.addresses?.[0]?.city || 'Madrid',
        postalCode: prev.postalCode || user.addresses?.[0]?.postalCode || '28001',
      }));
    }
  }, [user]);

  if (!isOpen) return null;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient || !formData.email || !formData.street || !formData.phone) {
      setErrorMessage('Por favor completa todos los campos obligatorios.');
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setErrorMessage('Selecciona una franja horaria.');
      return;
    }
    setErrorMessage(null);
    setStep(3);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate payment if card
    if (paymentMethod === 'credit_card') {
      const cleanCard = cardData.number.replace(/\s+/g, '');
      if (cleanCard.length < 15 || !isValidLuhn(cleanCard)) {
        setErrorMessage('El número de tarjeta no es válido (verificación de algoritmo Luhn).');
        return;
      }
      if (!cardData.holder || !cardData.expiry || cardData.cvv.length < 3) {
        setErrorMessage('Completa los datos de la tarjeta.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerName: formData.recipient,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        deliveryAddress: {
          id: `addr-${Date.now()}`,
          label: 'Domicilio de Envío',
          recipient: formData.recipient,
          street: formData.street,
          apartment: formData.apartment,
          city: formData.city,
          postalCode: formData.postalCode,
          phone: formData.phone,
          instructions: formData.instructions,
        },
        deliveryDate: selectedDate || new Date().toISOString().split('T')[0],
        deliverySlot: selectedSlot,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.product.name,
          unit: i.product.unit,
          quantity: i.quantity,
          price: i.unitPrice,
          lineTotal: i.lineTotal,
          image: i.product.image,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        couponCode: appliedCoupon?.code,
        deliveryFee: totals.deliveryFee,
        tax: totals.tax,
        total: totals.total,
        paymentMethod,
        notes: formData.instructions,
      };

      const res = await api.createOrder(orderPayload);
      setCompletedOrder(res.order);
      setStep(4);
      clearCart();

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Confetti optional
      }

      onOrderSuccess(res.order);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in"
    >
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {step < 4 ? step : '✓'}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {step === 1 && '1. Dirección de Entrega'}
                {step === 2 && '2. Horario de Reparto'}
                {step === 3 && '3. Método de Pago'}
                {step === 4 && '¡Pedido Confirmado!'}
              </h2>
              <p className="text-xs text-slate-500">
                {step < 4 ? `Paso ${step} de 3 · MercadoFresco` : `Orden #${completedOrder?.orderNumber}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar ventana de pago"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: ADDRESS */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  placeholder="Ej: Laura Gómez"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono Móvil *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej: +34 612 345 678"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico (para comprobante) *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Calle y Número *</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Ej: Calle Gran Vía 28"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Piso / Puerta</label>
                <input
                  type="text"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  placeholder="4º B"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Ciudad *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Código Postal *</label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="28001"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Instrucciones para el repartidor (opcional)</label>
              <input
                type="text"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Ej: Dejar en conserjería si no responde el interfono"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Continuar a Horario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: DELIVERY SLOT */}
        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="p-6 space-y-4">
            <p className="text-xs text-slate-600">
              Selecciona el horario en que deseas recibir tu pedido en transporte refrigerado:
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {slots.map((slot) => {
                const isSelected = selectedSlot === slot.timeRange;
                return (
                  <label
                    key={slot.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-semibold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="delivery_slot"
                        checked={isSelected}
                        onChange={() => {
                          setSelectedSlot(slot.timeRange);
                          setSelectedDate(slot.date);
                        }}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <span className="text-xs font-bold block">{slot.dayLabel}</span>
                        <span className="text-xs text-slate-500 font-mono">{slot.timeRange}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-bold">Disponible</span>
                  </label>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>Continuar al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: PAYMENT METHOD */}
        {step === 3 && (
          <form onSubmit={handlePlaceOrder} className="p-6 space-y-4">
            {/* Method selection */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit_card')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'credit_card'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                <span className="text-xs block">Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                <span className="text-xs block">Contra Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'bank_transfer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Receipt className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                <span className="text-xs block">Transferencia</span>
              </button>
            </div>

            {/* Credit Card Details */}
            {paymentMethod === 'credit_card' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Pago Seguro Encriptado SSL</span>
                  <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">Luhn Validated</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Número de Tarjeta</label>
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardData.number}
                    onChange={(e) => {
                      // Format with space every 4 digits
                      const val = e.target.value.replace(/\D/g, '').substring(0, 16);
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setCardData({ ...cardData, number: formatted });
                    }}
                    placeholder="4532 0151 1283 0366"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Tarjeta de prueba: 4532 0151 1283 0366</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Titular de la Tarjeta</label>
                    <input
                      type="text"
                      required
                      value={cardData.holder}
                      onChange={(e) => setCardData({ ...cardData, holder: e.target.value })}
                      placeholder="Nombre como figura en tarjeta"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Exp (MM/AA)</label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        placeholder="12/28"
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="•••"
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'cash_on_delivery' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-950 space-y-1">
                <p className="font-bold">Pago en puerta al repartidor</p>
                <p>Puedes abonar en efectivo exacto o con datáfono móvil (tarjetas o Bizum) cuando llegue tu furgoneta refrigerada.</p>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 space-y-1">
                <p className="font-bold text-slate-900">Transferencia Bancaria Inmediata</p>
                <p>Al confirmar el pedido recibirás el IBAN de MercadoFresco y tu código de referencia único para la transferencia.</p>
              </div>
            )}

            {/* Total summary */}
            <div className="p-3 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Total a cargar:</span>
              <span className="text-base font-black text-emerald-950 font-mono tabular-nums">
                {formatCurrency(totals.total)}
              </span>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Atrás
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                {isSubmitting ? (
                  <span>Procesando pago...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar y Pagar {formatCurrency(totals.total)}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: ORDER CONFIRMED */}
        {step === 4 && completedOrder && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-900">¡Pedido Realizado con Éxito!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Hemos registrado tu orden <span className="font-mono font-bold text-slate-900">#{completedOrder.orderNumber}</span>. Estamos preparando tus productos frescos en bodega.
              </p>
            </div>

            {/* Printable summary ticket */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Destinatario:</span>
                <span className="font-bold text-slate-800">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Dirección:</span>
                <span className="font-medium text-slate-800 text-right">
                  {completedOrder.deliveryAddress.street}, {completedOrder.deliveryAddress.city}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Horario Estimado:</span>
                <span className="font-bold text-emerald-800">{completedOrder.deliverySlot}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Artículos ({completedOrder.items.length}):</span>
                <span className="font-medium text-slate-800">
                  {completedOrder.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black text-slate-900">
                <span>Total Abonado:</span>
                <span className="font-mono text-emerald-900">{formatCurrency(completedOrder.total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handlePrintReceipt}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Comprobante</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm"
              >
                <span>Finalizar y Ver Tienda</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

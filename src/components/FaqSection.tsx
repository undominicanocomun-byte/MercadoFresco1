import React, { useState } from 'react';
import { HelpCircle, ChevronDown, CheckCircle2 } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Logística & Frío',
    question: '¿Cómo garantizan que los productos refrigerados no se calienten durante el trayecto?',
    answer: 'Nuestra flota propia cuenta con evaporadores y furgones térmicos activos calibrados a 4.0°C constantes para lácteos, carnes y pescados, y compartimento criogénico a -18.0°C para congelados. Los alimentos no viajan en bolsas pasivas con hielo derretible, sino en frío constante monitorizado por sensores.',
  },
  {
    category: 'Garantía de Frescura',
    question: '¿Qué sucede si un aguacate, tomate o fruta no llega en su punto óptimo de maduración?',
    answer: 'Disponemos de la Garantía Incondicional de Frescura MercadoFresco. Si cualquier fruto o producto no cumple tu estándar de sabor o madurez, lo notificas desde tu cuenta y te reembolsamos el importe o te enviamos una reposición gratuita en el siguiente reparto, sin necesidad de devolver el producto.',
  },
  {
    category: 'Envíos & Horarios',
    question: '¿Cómo funcionan las franjas horarias de 2 horas y el envío gratuito?',
    answer: 'Al tramitar el pedido puedes seleccionar la franja de 2 horas exacta que mejor te convenga (por la mañana 09:00 - 11:00, al mediodía 14:00 - 16:00 o express nocturno 19:00 - 21:00). En compras a partir de $40.00, el envío refrigerado es completamente gratuito. Para compras menores, el coste logístico estándar es de $3.99.',
  },
  {
    category: 'Medios de Pago',
    question: '¿Qué opciones de pago tengo al momento de ordenar?',
    answer: 'Aceptamos tarjetas de débito y crédito (Visa, Mastercard, American Express) con cifrado SSL bancario de 256 bits y verificación 3D Secure, pago contra entrega en efectivo o datáfono inalámbrico cuando el repartidor llega a tu puerta, y transferencia instantánea.',
  },
  {
    category: 'Sostenibilidad',
    question: '¿Cómo gestionan los embalajes y residuos de entrega?',
    answer: 'Todos nuestros alimentos se entregan en cajas de cartón reciclable certificado FSC y bolsas de fécula de maíz 100% compostables en hogar. Si lo deseas, el repartidor puede retirar la caja vacía en tu siguiente entrega para reintegrarla en nuestro circuito circular de reutilización.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Preguntas Frecuentes & Garantías</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif italic">
            Claridad Total Sobre tu Compra
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Todo lo que necesitas saber sobre nuestra selección de origen, tiempos de entrega y compromiso sin letra pequeña.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQ_DATA.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-stone-200 rounded-2xl overflow-hidden transition-colors bg-stone-50/50 hover:bg-stone-50"
              >
                <button
                  onClick={() => toggleItem(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 px-2 py-0.5 rounded bg-emerald-100/80">
                      {item.category}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-stone-900">
                      {item.question}
                    </span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-stone-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-stone-600 leading-relaxed border-t border-stone-100 bg-white">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

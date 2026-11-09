import React from 'react';
import { Star, ShieldCheck, Heart, Quote, ArrowRight } from 'lucide-react';

export const CustomerStories: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      author: 'Laura Gómez Martín',
      role: 'Clienta habitual en Madrid Centro',
      rating: 5,
      date: 'Hace 3 días',
      verifiedOrder: 'Pedido #MF-8840 (Plátano IGP, Leche Pastoreo, Aceite Picual)',
      quote: 'Llevo 4 meses haciendo la compra semanal de frescos aquí. Lo que más me fascina es el Tomate Rosa de Barbastro: no tiene nada que ver con el tomate acorchado del supermercado tradicional. Huele a campo desde que abres la caja.',
      avatarBg: 'bg-emerald-600',
      initials: 'LG',
    },
    {
      id: 'rev-2',
      author: 'Carlos Valenzuela',
      role: 'Familia de 4 miembros · Chamartín',
      rating: 5,
      date: 'Hace 1 semana',
      verifiedOrder: 'Pedido #MF-9021 (Salmón Noruego, Entrecot, Espinacas Baby)',
      quote: 'La puntualidad en la franja de 19:00 a 21:00 es matemática. Y el salmón llega sobre lecho refrigerado impecable a 3°C reales. Para quienes trabajamos hasta tarde, este servicio es una bendición de salud y tranquilidad.',
      avatarBg: 'bg-amber-600',
      initials: 'CV',
    },
    {
      id: 'rev-3',
      author: 'Dra. Elena Sanromán',
      role: 'Nutricionista Clínica · Salamanca',
      rating: 5,
      date: 'Hace 2 semanas',
      verifiedOrder: 'Pedido #MF-7559 (Huevos Clase 0, Masa Madre, Kombucha)',
      quote: 'Recomiendo activamente a mis pacientes comprar en MercadoFresco porque certifican la trazabilidad de los huevos clase 0 y la leche de pastoreo sin aditivos. La diferencia en micronutrientes y bienestar digestivo es palpable.',
      avatarBg: 'bg-teal-600',
      initials: 'ES',
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-stone-100/60 border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>4.9 / 5 en más de 3.200 entregas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif italic">
            La Experiencia de las Familias que Comen de Verdad
          </h2>
          <p className="text-stone-600 text-sm mt-3 leading-relaxed">
            Sin opiniones anónimas ni inventadas. Cada testimonio proviene de compras reales procesadas en nuestra plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 rounded-3xl bg-white border border-stone-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header with stars and date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.date}</span>
                </div>

                {/* Quote */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{rev.quote}"
                </p>

                {/* Verified order tag */}
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{rev.verifiedOrder}</span>
                </div>
              </div>

              {/* Author */}
              <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${rev.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0`}>
                  {rev.initials}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{rev.author}</h4>
                  <p className="text-[11px] text-stone-500">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

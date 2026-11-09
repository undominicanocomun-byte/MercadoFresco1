import React from 'react';
import { Clock, ShieldCheck, Truck, Sparkles, ArrowRight, Award } from 'lucide-react';

interface HeroBannerProps {
  onExplore: () => void;
  onSelectTag: (tag: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExplore, onSelectTag }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Supermercado Digital de Alta Gama</span>
              <span aria-hidden="true">·</span>
              <span>Cosecha del Día</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15] text-balance">
              Alimentos frescos de campo y despensa premium en la puerta de tu hogar.
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl">
              Seleccionamos cada fruta, verdura, corte artesanal y pan de masa madre directamente de productores locales certificados. Empacados con cadena de frío garantizada y entregados en la franja horaria que tú elijas.
            </p>

            {/* Quick Action Badges / Filter buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Explorar Catálogo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <button
                  onClick={() => onSelectTag('organico')}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                >
                  🌿 100% Orgánicos
                </button>
                <button
                  onClick={() => onSelectTag('local')}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
                >
                  📍 Productores Locales
                </button>
                <button
                  onClick={() => onSelectTag('oferta')}
                  className="px-3 py-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-amber-400/30"
                >
                  🏷️ Ofertas Especiales
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 aspect-[4/3] bg-emerald-950">
              <img
                src="/src/assets/images/hero_supermarket_fresh_1794193228971.jpg"
                alt="Pasillo de supermercado con frutas, verduras frescas y panadería artesanal"
                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-4 left-4 right-4 text-xs bg-slate-900/80 backdrop-blur-md rounded-xl p-3 border border-white/10 text-slate-200 flex items-center justify-between">
                <div>
                  <p className="font-bold text-white text-sm">Garantía de Frescura Total</p>
                  <p className="text-slate-300">Si un fruto no te convence, lo reponemos al instante.</p>
                </div>
                <Award className="w-6 h-6 text-emerald-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width 4-column trust strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 pt-8 border-t border-white/10 text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-700/50">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Entregas en 90 Min</h2>
              <p className="text-xs text-slate-400 mt-0.5">O programa tu franja de 2h preferida del día.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-700/50">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Envío Gratis desde $40</h2>
              <p className="text-xs text-slate-400 mt-0.5">Cadena de frío activa en furgones térmicos.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-700/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Calidad 100% Cosecha</h2>
              <p className="text-xs text-slate-400 mt-0.5">Control de maduración y frescura por expertos.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800/50 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-700/50">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Pago Seguro</h2>
              <p className="text-xs text-slate-400 mt-0.5">Tarjeta, contra entrega o transferencia instantánea.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

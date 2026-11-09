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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Supermercado Digital de Alta Gama</span>
              <span className="text-emerald-500/40">·</span>
              <span>Cosecha del Día</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12] text-balance">
              Alimentos frescos de campo y despensa <span className="font-serif italic font-normal text-emerald-300">artesanal</span> en la puerta de tu hogar.
            </h1>

            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl font-normal">
              Seleccionamos cada fruta, hortaliza de temporada, corte de pastoreo y pan de masa madre directamente de productores locales certificados. Empacados con cadena de frío activa a 4°C y entregados en franjas puntuales de 2 horas.
            </p>

            {/* Live slot status alert */}
            <div className="flex items-center gap-2.5 text-xs text-emerald-200/90 bg-emerald-950/60 border border-emerald-800/60 rounded-xl px-3.5 py-2 max-w-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="font-medium">
                <strong className="text-white font-bold">Franja Express Hoy 19:00 - 21:00:</strong> Quedan 3 cupos disponibles con envío gratis en pedidos &gt; $40.
              </span>
            </div>

            {/* Quick Action Badges / Filter buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExplore}
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>Explorar Catálogo Completo</span>
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
                  📍 Huerta Local
                </button>
                <button
                  onClick={() => onSelectTag('oferta')}
                  className="px-3 py-2 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-semibold backdrop-blur-xs transition-colors cursor-pointer border border-amber-400/30"
                >
                  🏷️ Ofertas del Día
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 aspect-[4/3] bg-emerald-950">
              <img
                src="/images/hero_supermarket_fresh_1794193228971.jpg"
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

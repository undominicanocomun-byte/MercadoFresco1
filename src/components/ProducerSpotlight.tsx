import React from 'react';
import { HeartHandshake, MapPin, Award, ArrowRight, Sparkles, Sprout, CheckCircle2 } from 'lucide-react';

interface ProducerSpotlightProps {
  onFilterProducer: (tag: string) => void;
}

export const ProducerSpotlight: React.FC<ProducerSpotlightProps> = ({ onFilterProducer }) => {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-stone-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Documentary Photography Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200 aspect-[4/3] bg-stone-900 group">
              <img
                src="/images/artisan_farmer_portrait_1794232791995.jpg"
                alt="Agricultor artesanal en su huerto familiar recolectando hortalizas ecológicas"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent pointer-events-none" />

              <div className="absolute top-4 left-4 bg-stone-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-full text-white text-xs font-bold border border-white/20 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Huerto Familiar Mateo · Barbastro, Huesca</span>
              </div>

              <div className="absolute bottom-5 left-5 right-5 text-white bg-stone-900/80 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <p className="font-serif italic text-base sm:text-lg text-emerald-300">
                  "El tomate no miente: cuando la planta bebe agua de deshielo y madura con sol, la piel es tan fina que casi no necesita cuchillo."
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs text-stone-300">
                  <span>Don Mateo Navarro · 3ª generación hortícola</span>
                  <span className="text-emerald-400 font-bold">Proveedor desde 2021</span>
                </div>
              </div>
            </div>

            {/* Floating verification badge */}
            <div className="hidden sm:flex absolute -bottom-5 -right-5 p-4 rounded-2xl bg-white border border-stone-200 shadow-xl items-center gap-3 max-w-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-stone-900">Precios Justos Garantizados</p>
                <p className="text-stone-500 text-[11px]">Pagamos +28% sobre el precio de lonja mayorista.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Editorial Manifesto & Metrics */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5" />
              <span>Transparencia & Trazabilidad Radical</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight font-serif leading-tight">
              Rostros de la Tierra: Menos Intermediarios, Alimentos con Alma.
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              En el supermercado industrial tradicional, los tomates pasan hasta 14 días en almacenes logísticos refrigerados antes de llegar a la góndola. En MercadoFresco, el pedido que haces por la mañana se recolecta al mediodía y viaja a tu mesa en el furgón refrigerado de la tarde.
            </p>

            {/* 3 Pillar Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">0</div>
                <p className="text-xs font-bold text-stone-800 mt-0.5">Almacenes Mayoristas</p>
                <p className="text-[11px] text-stone-500 mt-1">Directo del productor a nuestra flota fría.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">&lt; 24h</div>
                <p className="text-xs font-bold text-stone-800 mt-0.5">Cosecha a Entrega</p>
                <p className="text-[11px] text-stone-500 mt-1">Conservación máxima de vitaminas activas.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">100%</div>
                <p className="text-xs font-bold text-stone-800 mt-0.5">Trazabilidad en Origen</p>
                <p className="text-[11px] text-stone-500 mt-1">Finca, agricultor y fecha de corte visible.</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs text-stone-700 pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Agricultura regenerativa con rotación de cultivos para no empobrecer la tierra.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Embalajes 100% compostables de papel kraft y fécula de maíz biodegradable.</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Contratos anuales garantizados a pequeños agricultores locales sin regateo de precios.</span>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onFilterProducer('local');
                  document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Explorar alimentos de Productores Locales</span>
                <ArrowRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

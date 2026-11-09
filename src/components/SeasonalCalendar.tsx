import React, { useState } from 'react';
import { Calendar, Sun, Snowflake, CloudRain, Wind, Sparkles, ArrowRight, Check } from 'lucide-react';

interface SeasonalCalendarProps {
  onSelectTagOrCategory: (categoryOrTag: string) => void;
}

interface SeasonalProduce {
  id: string;
  name: string;
  category: string;
  origin: string;
  peakMonths: string;
  brixIndex: string;
  flavorNote: string;
  tag: string;
  season: 'primavera' | 'verano' | 'otono' | 'invierno';
}

const SEASONAL_DATA: SeasonalProduce[] = [
  // Otoño (Actual)
  {
    id: 'sp-1',
    name: 'Tomate Rosa de Barbastro',
    category: 'Verdura de Huerto',
    origin: 'Huesca, España',
    peakMonths: 'Septiembre - Noviembre',
    brixIndex: '6.8° Brix (Alta Dulzura)',
    flavorNote: 'Piel finísima, pulpa carnosa sin acidez',
    tag: 'organico',
    season: 'otono',
  },
  {
    id: 'sp-2',
    name: 'Manzana Fuji de Montaña',
    category: 'Fruta de Altura',
    origin: 'Girona, España',
    peakMonths: 'Octubre - Enero',
    brixIndex: '14.5° Brix (Máximo Crujido)',
    flavorNote: 'Notas aromáticas a miel y textura tersa',
    tag: 'local',
    season: 'otono',
  },
  {
    id: 'sp-3',
    name: 'Espinacas Baby Orgánicas',
    category: 'Hoja Verde Tierna',
    origin: 'Navarra, España',
    peakMonths: 'Octubre - Marzo',
    brixIndex: 'Rico en Clorofila & Hierro',
    flavorNote: 'Brote recolectado al alba a menos de 10°C',
    tag: 'organico',
    season: 'otono',
  },
  {
    id: 'sp-4',
    name: 'Aceite Picual Primera Prensada',
    category: 'Zumo de Oliva Virgen Extra',
    origin: 'Sierra de Jaén, España',
    peakMonths: 'Noviembre (Cosecha Temprana)',
    brixIndex: 'Polifenoles > 650 mg/kg',
    flavorNote: 'Hierba verde recién cortada, tomatera e higuera',
    tag: 'organico',
    season: 'otono',
  },

  // Invierno
  {
    id: 'sp-5',
    name: 'Naranja Valencia Late',
    category: 'Cítricos de Riberas',
    origin: 'Valencia, España',
    peakMonths: 'Diciembre - Marzo',
    brixIndex: '12.2° Brix (Equilibrio Dulce/Ácido)',
    flavorNote: 'Alto contenido en jugo natural sin pasteurizar',
    tag: 'organico',
    season: 'invierno',
  },
  {
    id: 'sp-6',
    name: 'Limón Primofiori Ecológico',
    category: 'Cítrico Aromático',
    origin: 'Murcia, España',
    peakMonths: 'Noviembre - Febrero',
    brixIndex: 'Acidez limpia y corteza perfumada',
    flavorNote: 'Cultivado en huertos libres de ceras químicas',
    tag: 'organico',
    season: 'invierno',
  },

  // Primavera
  {
    id: 'sp-7',
    name: 'Fresas Silvestres de Huelva',
    category: 'Fruto Rojo',
    origin: 'Huelva, España',
    peakMonths: 'Marzo - Mayo',
    brixIndex: '10.5° Brix',
    flavorNote: 'Aroma embriagador y maduración en planta',
    tag: 'local',
    season: 'primavera',
  },
  {
    id: 'sp-8',
    name: 'Espárragos Trigueros Verdes',
    category: 'Tallo Tierno',
    origin: 'Navarra, España',
    peakMonths: 'Abril - Junio',
    brixIndex: 'Cosecha Manual Diaria',
    flavorNote: 'Punta crujiente con toque mineral',
    tag: 'local',
    season: 'primavera',
  },

  // Verano
  {
    id: 'sp-9',
    name: 'Aguacate Hass de la Axarquía',
    category: 'Fruta Tropical Europea',
    origin: 'Málaga, España',
    peakMonths: 'Junio - Septiembre',
    brixIndex: 'Materia grasa saludable > 21%',
    flavorNote: 'Untuosidad mantequillosa con regusto a nuez',
    tag: 'organico',
    season: 'verano',
  },
  {
    id: 'sp-10',
    name: 'Melocotón de Calanda D.O.',
    category: 'Fruta de Hueso',
    origin: 'Teruel, España',
    peakMonths: 'Julio - Septiembre',
    brixIndex: '13.8° Brix',
    flavorNote: 'Embolsado en árbol de forma artesanal',
    tag: 'local',
    season: 'verano',
  },
];

export const SeasonalCalendar: React.FC<SeasonalCalendarProps> = ({ onSelectTagOrCategory }) => {
  const [activeSeason, setActiveSeason] = useState<'otono' | 'invierno' | 'primavera' | 'verano'>('otono');

  const filteredItems = SEASONAL_DATA.filter((item) => item.season === activeSeason);

  const seasonsConfig = [
    { id: 'otono', label: 'Otoño (En Temporada)', icon: Wind, badge: 'Cosecha Actual' },
    { id: 'invierno', label: 'Invierno', icon: Snowflake, badge: 'Próxima Estación' },
    { id: 'primavera', label: 'Primavera', icon: CloudRain, badge: 'Brote & Huerto' },
    { id: 'verano', label: 'Verano', icon: Sun, badge: 'Fruta de Sol' },
  ];

  return (
    <section className="py-16 sm:py-20 bg-stone-900 text-stone-100 relative overflow-hidden border-t border-stone-800">
      {/* Background ambient subtle glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-emerald-950/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-amber-950/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-stone-800">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-2">
              <Calendar className="w-4 h-4" />
              <span>Observatorio de Temporada</span>
              <span className="text-stone-600">·</span>
              <span className="text-stone-400">Respeto al Ciclo de la Tierra</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif italic">
              Calendario de Cosecha & Maduración en Vivo
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
              No forzamos la naturaleza. Solo ofrecemos alimentos que han alcanzado su índice óptimo de azúcares naturales, minerales y agua de manantial en el árbol.
            </p>
          </div>

          {/* Season Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-stone-950/70 border border-stone-800 rounded-2xl shrink-0">
            {seasonsConfig.map((s) => {
              const Icon = s.icon;
              const isActive = activeSeason === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSeason(s.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 scale-[1.02]'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Seasonal Produce Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group p-5 rounded-2xl bg-stone-950/60 border border-stone-800/80 hover:border-emerald-600/60 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/30 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-semibold tracking-wide uppercase">
                    {item.category}
                  </span>
                  <span className="text-stone-400 font-mono text-[10px] px-2 py-0.5 rounded-full bg-stone-800/80 border border-stone-700/50">
                    {item.origin}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {item.name}
                </h3>

                <div className="space-y-1.5 pt-1 border-t border-stone-800/60">
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span className="text-stone-400">Pico Sabor:</span>
                    <span className="font-medium text-stone-200">{item.peakMonths}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-stone-300">
                    <span className="text-stone-400">Índice Grado:</span>
                    <span className="font-semibold text-emerald-400 font-mono text-[11px]">{item.brixIndex}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-400 leading-relaxed italic bg-stone-900/60 p-2.5 rounded-xl border border-stone-800/40">
                  "{item.flavorNote}"
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-800/60">
                <button
                  onClick={() => onSelectTagOrCategory(item.tag)}
                  className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Ver alimentos de este perfil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner Commitment */}
        <div className="mt-10 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-stone-950 to-stone-950 border border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">Certificación de Cosecha Cero Cámaras Químicas</p>
              <p className="text-stone-400 text-[11px]">Nuestros alimentos se recolectan bajo pedido del cliente, no maduran en almacenes con gas etileno.</p>
            </div>
          </div>
          <span className="text-emerald-400 font-bold shrink-0 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-800/50">
            Trazabilidad 100% Auditada
          </span>
        </div>
      </div>
    </section>
  );
};

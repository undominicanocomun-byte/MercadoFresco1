import React, { useState } from 'react';
import { Snowflake, Thermometer, Truck, ShieldCheck, RefreshCw, AlertCircle, Check } from 'lucide-react';

export const ColdChainShowcase: React.FC = () => {
  const [activeZone, setActiveZone] = useState<'chilled' | 'frozen' | 'ambient'>('chilled');

  const zones = [
    {
      id: 'chilled',
      name: 'Zona Fría Activa (4.0°C)',
      temp: '4.0°C',
      idealFor: 'Lácteos ecológicos, carnes maduradas, pescados salvajes y hojas tiernas',
      explanation: 'Previene la proliferación bacteriana y mantiene intactas las proteínas sin llegar a congelar la textura natural de los alimentos frescos.',
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40 border-sky-800/50',
    },
    {
      id: 'frozen',
      name: 'Compartimento Criogénico (-18.0°C)',
      temp: '-18.0°C',
      idealFor: 'Helados artesanos, hielo puro y pescados de captura ultracongelados',
      explanation: 'Conserva el tejido celular sin generar cristales de hielo grandes, asegurando que al descongelar no pierdan sus jugos esenciales.',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/40 border-cyan-800/50',
    },
    {
      id: 'ambient',
      name: 'Cámara Fresca Templada (12.0°C)',
      temp: '12.0°C',
      idealFor: 'Tomates de huerto, plátanos de Canarias, panes de masa madre',
      explanation: 'El frío excesivo destruye las enzimas volátiles del tomate y vuelve harinosa su pulpa. Los transportamos a temperatura suave para respetar su perfume.',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/50',
    },
  ];

  const currentZone = zones.find((z) => z.id === activeZone) || zones[0];

  return (
    <section className="py-16 sm:py-24 bg-stone-950 text-white border-t border-stone-800 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Context & Interactive Temperature Controls */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 text-cyan-300 text-xs font-bold uppercase tracking-wider border border-cyan-800/60">
              <Snowflake className="w-3.5 h-3.5" />
              <span>Logística Fría Activa de Precisión</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-serif italic leading-tight">
              Trazabilidad Térmica Ininterrumpida: 4.0°C Constantes
            </h2>

            <p className="text-stone-400 text-sm leading-relaxed">
              La mayoría de los repartos a domicilio utilizan simples bolsas isotérmicas pasivas con hielo gel que pierden eficacia tras 20 minutos de tráfico. Nuestros vehículos cuentan con evaporadores eléctricos y telemetría en vivo conectada a la central.
            </p>

            {/* Zone Selector Pills */}
            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                Selecciona la cámara para inspeccionar los parámetros:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {zones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setActiveZone(zone.id as any)}
                    className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                      activeZone === zone.id
                        ? 'bg-stone-800 text-white border-cyan-500 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                        : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:border-stone-700 hover:text-stone-200'
                    }`}
                  >
                    <span className="font-mono text-base font-black text-cyan-400 block">{zone.temp}</span>
                    <span className="text-[11px] font-bold mt-1 line-clamp-1 block">{zone.name.split('(')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Detail Card of selected zone */}
            <div className={`p-5 rounded-2xl border ${currentZone.bgColor} transition-all duration-300 space-y-2`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className={currentZone.color}>{currentZone.name}</span>
                <span className="font-mono text-white text-sm">{currentZone.temp}</span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed">
                <strong className="text-white">Alimentos protegidos: </strong>{currentZone.idealFor}.
              </p>
              <p className="text-xs text-stone-400 leading-relaxed italic pt-1">
                {currentZone.explanation}
              </p>
            </div>

            {/* Refund & guarantee badge */}
            <div className="flex items-center gap-3 pt-2 text-xs text-stone-400">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Garantía de Cadena Térmica: Si tu pedido llega a temperatura inadecuada, te reembolsamos el 100% al instante.</span>
            </div>
          </div>

          {/* Right Column: Visual Cold Chain Photo Asset with HUD Overlay */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-800 aspect-[4/3] bg-stone-900 group">
              <img
                src="/images/cold_chain_logistics_1794232826360.jpg"
                alt="Compartimento refrigerado de furgón de entrega MercadoFresco con verduras frescas y monitor digital de temperatura"
                className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent pointer-events-none" />

              {/* HUD Sensor Simulator */}
              <div className="absolute top-4 right-4 bg-stone-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-cyan-500/40 text-cyan-300 flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div className="font-mono text-xs">
                  <span className="font-bold text-white">SENSOR BODEGA:</span> 4.0°C CALIBRADO
                </div>
              </div>

              {/* Bottom Card Summary */}
              <div className="absolute bottom-4 left-4 right-4 bg-stone-950/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs text-stone-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">Flota Eco-Eléctrica Activa</p>
                    <p className="text-stone-400 text-[11px]">Compresores independientes alimentados por paneles solares del vehículo.</p>
                  </div>
                  <Thermometer className="w-6 h-6 text-cyan-400 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

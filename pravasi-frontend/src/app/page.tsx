'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ArcLayer, ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, Map as MapIcon, TrendingUp, Users, ShieldAlert } from 'lucide-react';
import dynamic from 'next/dynamic';

/**
 * FIX 1: Dynamic Import with ssr:false
 * This prevents the 'maxTextureDimension2D' error by ensuring the Deck.gl engine 
 * is only loaded in the browser environment.
 */
const DeckGL = dynamic(() => import('@deck.gl/react'), { 
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-[#020617] flex items-center justify-center text-cyan-500 font-mono italic">INITIALIZING CYBER ENGINE...</div>
});

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

// --- UI COMPONENTS ---
const StatCard = ({ title, value, trend, icon: Icon, color }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl mb-4 shadow-2xl relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 p-3 opacity-20 ${color}`}><Icon size={40} /></div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
    <div className="flex items-baseline gap-2 mt-2">
      <h2 className="text-3xl font-mono font-bold text-white">{value}</h2>
      <span className={`text-xs ${trend.includes('+') ? 'text-emerald-400' : 'text-red-400'}`}>{trend}</span>
    </div>
  </motion.div>
);

const AlertItem = ({ district, msg }: any) => (
  <div className="flex gap-3 p-3 bg-red-500/10 border-l-4 border-red-500 rounded-r-lg mb-3 shadow-lg">
    <AlertTriangle className="text-red-500 shrink-0" size={18} />
    <div>
      <p className="text-white text-xs font-bold uppercase">{district}</p>
      <p className="text-slate-400 text-[10px] leading-tight mt-0.5">{msg}</p>
    </div>
  </div>
);

export default function PravasiDashboard() {
  /**
   * FIX 2: Mounting Guard
   * Prevents hydration mismatches between server-rendered HTML and client WebGL.
   */
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState(75);
  const [viewState, setViewState] = useState({
    longitude: 78.9629, latitude: 20.5937, zoom: 4.5, pitch: 45, bearing: 0
  });

  useEffect(() => {
    setIsMounted(true);
    fetch('https://uidaihackathon.onrender.com')
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Backend offline:", err));
  }, []);

  // OPTIMIZATION: Memoize data slicing to keep the slider smooth
  const filteredData = useMemo(() => {
    if (!data?.historical) return [];
    const totalCount = data.historical.length;
    const limit = Math.max(1, Math.floor((sliderValue / 100) * totalCount));
    return data.historical.slice(0, limit);
  }, [data, sliderValue]);

  // OPTIMIZATION: Memoize layers array to prevent unnecessary re-renders of the map
  const layers = useMemo(() => [
    new ScatterplotLayer({
      id: 'dest-points',
      data: filteredData,
      getPosition: (d: any) => [d.lng_dest || 77.5946, d.lat_dest || 12.9716],
      getFillColor: [34, 211, 238, 200],
      getRadius: 12000,
      pickable: true,
    }),
    new ArcLayer({
      id: 'migration-arcs',
      data: filteredData,
      getSourcePosition: (d: any) => [d.lng_origin || 85.1376, d.lat_origin || 25.5941],
      getTargetPosition: (d: any) => [d.lng_dest || 77.5946, d.lat_dest || 12.9716],
      getSourceColor: [236, 72, 153],
      getTargetColor: [34, 211, 238],
      getWidth: 2.5,
    })
  ], [filteredData]);

  if (!isMounted) return <div className="h-screen w-screen bg-[#020617]" />;

  return (
    <div className="h-screen w-screen bg-[#020617] text-slate-200 font-sans overflow-hidden relative">
      {/* --- HEADER --- */}
      <header className="absolute top-0 left-0 w-full z-30 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500 p-2 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Activity className="text-black" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
              PRAVASI <span className="text-cyan-500 text-sm font-mono ml-2 lowercase font-normal italic">v1.0-ai</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.2em]">UIDAI Migration Intelligence Engine</p>
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-full text-xs font-mono text-cyan-400">
            SYSTEM STATUS: OPTIMAL
        </div>
      </header>

      {/* --- AI ENGINE OVERLAY --- */}
      <AnimatePresence>
        {sliderValue > 85 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-cyan-500/10 border border-cyan-500/50 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
          >
            <ShieldAlert className="text-cyan-400 animate-pulse" size={20} />
            <span className="text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest">
              XGBoost Predictive Engine Active: Q1 2026 Projections
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SIDEBARS --- */}
      <aside className="absolute top-24 left-6 z-20 w-80">
        <StatCard title="Total Migration Events" value="12,842" trend="+14.2%" icon={Users} color="text-cyan-400" />
        <StatCard title="Predicted Inflow (Q1)" value="45,200" trend="+22.1%" icon={TrendingUp} color="text-pink-500" />
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-2xl">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 font-mono">AI Anomaly Alerts</h3>
          <AlertItem district="Patna Central" msg="Spike in biometric updates for Age Group 5-17. High probability of family migration unit." />
          <AlertItem district="Bangalore Urban" msg="Inflow exceeds infrastructure capacity forecast by 12% for March 2026." />
        </div>
      </aside>

      <aside className="absolute top-24 right-6 z-20 w-80 font-sans text-sm italic text-slate-300">
         <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-5 rounded-2xl shadow-2xl">
            <h3 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2 font-mono"><MapIcon size={14} /> Policy Impact</h3>
            <div className="space-y-4 border-l border-slate-700 pl-4">
                <p>"Expand school enrollment capacity in Bangalore North by 15%."</p>
                <p>"Deploy mobile Aadhaar update vans to regional construction hubs."</p>
            </div>
         </div>
      </aside>

      {/* --- MAIN MAP CANVAS --- */}
      <div className="absolute inset-0 z-10">
        <DeckGL
          initialViewState={viewState}
          onViewStateChange={(v: any) => setViewState(v.viewState)}
          controller={true}
          layers={layers}
          getTooltip={({ object }: any) => object && {
              html: `<div style="background: #0f172a; color: #22d3ee; padding: 12px; border: 1px solid #1e293b; border-radius: 8px; font-family: monospace;">
                  <strong style="color:#fff">Origin:</strong> ${object.district ?? 'Unknown'}<br/>
                  <strong style="color:#fff">Predicted Flow:</strong> ${Math.round(object.migration_events ?? 0)}
                </div>`,
              style: { backgroundColor: 'transparent' }
          }}
        >
          <Map mapLib={maplibregl} mapStyle={MAP_STYLE} />
        </DeckGL>
      </div>

      {/* --- TIMELINE FOOTER --- */}
      <footer className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 text-center font-mono">
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-700 p-4 rounded-full flex flex-col items-center shadow-2xl">
            <input 
                type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400" 
                min="0" max="100" value={sliderValue} onChange={(e) => setSliderValue(Number(e.target.value))}
            />
            <div className="flex justify-between w-full mt-3 px-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <span>Dec 2024</span>
                <span className="text-cyan-400 border-b border-cyan-400/30 pb-0.5">
                  {sliderValue > 85 ? "AI FORECAST ACTIVE" : "HISTORICAL VIEW"}
                </span>
                <span>Q2 2026</span>
            </div>
        </div>
      </footer>
    </div>
  );
}
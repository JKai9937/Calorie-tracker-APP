import React from 'react';
import { DailyStats, AppView } from '../types';

interface HomeProps {
  stats: DailyStats;
  onChangeView: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ stats, onChangeView }) => {
  // Macros calculation
  const currentMacros = stats.logs.reduce((acc, log) => ({
    protein: acc.protein + log.macros.protein,
    carbs: acc.carbs + log.macros.carbs,
    fat: acc.fat + log.macros.fat
  }), { protein: 0, carbs: 0, fat: 0 });

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

  return (
    <div className="flex flex-col h-full bg-black text-white font-display overflow-hidden">
      
      {/* 1. Header (Compact) */}
      <div className="flex-none p-4 pb-2 relative border-b border-white/10">
        <div className="flex justify-between items-start mb-2">
           <div className="flex flex-col">
             <span className="text-white text-2xl font-black tracking-tighter uppercase leading-none">
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
             </span>
             <span className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long' })}
             </span>
           </div>
           
           <button 
             onClick={() => onChangeView(AppView.CAMERA)}
             className="text-white w-10 h-10 flex items-center justify-center transition-transform active:scale-90 group"
           >
             <span className="material-symbols-outlined text-3xl drop-shadow-md group-hover:scale-110 transition-transform">photo_camera</span>
           </button>
        </div>

        {/* Main Donut - Compact */}
        <div className="flex items-center justify-center py-2">
            <DonutChart 
                size={140} 
                strokeWidth={6} 
                current={stats.currentCalories} 
                max={stats.targetCalories} 
                label="INTAKE"
                showPercent={false} 
                color="#FFFFFF" 
                trackColor="#262626" 
            />
        </div>
      </div>

      {/* 2. PWA Install Hint (Only shows in browser) */}
      {!isStandalone && (
        <div className="mx-4 mt-2 p-3 bg-white/5 border border-white/10 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-white text-sm">install_mobile</span>
             <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Install as App for full experience</span>
           </div>
           <button onClick={() => onChangeView(AppView.SETTINGS)} className="text-[10px] font-black uppercase text-white underline">How?</button>
        </div>
      )}

      {/* 3. Macros Section (Compact) */}
      <div className="flex-none flex flex-col p-4 gap-4 justify-center items-center border-b border-white/10">
         <div className="grid grid-cols-1 w-full gap-3">
             <MacroRow 
                label="Pro" 
                current={currentMacros.protein} 
                max={stats.targetMacros?.protein || 150} 
             />
             <MacroRow 
                label="Carb" 
                current={currentMacros.carbs} 
                max={stats.targetMacros?.carbs || 200} 
             />
             <MacroRow 
                label="Fat" 
                current={currentMacros.fat} 
                max={stats.targetMacros?.fat || 65} 
             />
         </div>
      </div>

      {/* 4. Recent Intake List (Scrollable Area) */}
      <div className="flex-1 flex flex-col p-4 min-h-0 bg-black overflow-hidden">
        <div className="flex items-center gap-2 mb-2 opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white">Recent Logs</span>
            <div className="h-[1px] flex-1 bg-white/30"></div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
            {stats.logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-white/10 gap-2">
                    <span className="material-symbols-outlined text-3xl">no_food</span>
                    <span className="font-bold uppercase tracking-widest text-[10px]">No Data</span>
                </div>
            ) : (
                <div className="flex flex-col gap-2">
                    {[...stats.logs].reverse().slice(0, 10).map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-[#111] p-3 border-l-2 border-white group hover:bg-[#1a1a1a] transition-colors">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold uppercase truncate max-w-[150px] text-white tracking-wider">{log.name}</span>
                                <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-black text-white leading-none">{log.calories}</span>
                                    <span className="text-[8px] text-gray-500 font-bold uppercase">KCAL</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>

      {/* 5. Actions (Fixed Height) */}
      <div className="flex-none h-14 flex border-t border-white/20">
        <button 
          onClick={() => onChangeView(AppView.INPUT)}
          className="group relative flex-1 bg-[#050505] hover:bg-[#111] transition-colors flex items-center justify-center gap-2 border-r border-white/10"
        >
          <span className="material-symbols-outlined text-lg text-white group-hover:scale-110 transition-transform">keyboard</span>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Input</span>
        </button>
        <button 
          onClick={() => onChangeView(AppView.SAVED)}
          className="group relative flex-1 bg-[#050505] hover:bg-[#111] transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg text-white group-hover:scale-110 transition-transform">list_alt</span>
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white">Diary</span>
        </button>
      </div>
    </div>
    );
};

const DonutChart = ({ size, strokeWidth, current, max, label, showPercent, color = "white", trackColor = "#333" }: any) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(current / max, 1);
    const dashoffset = circumference - progress * circumference;

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="transparent" />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="butt"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white leading-none tracking-tighter">{showPercent ? `${Math.round(progress * 100)}%` : current}</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-1">{label}</span>
            </div>
        </div>
    );
};

const MacroRow = ({ label, current, max }: any) => {
    return (
        <div className="flex items-center gap-4 w-full">
            <div className="flex flex-col flex-1 gap-1">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 w-10">{label}</span>
                    <div className="flex-1 mx-2 bg-[#262626] h-1.5 overflow-hidden">
                        <div className="bg-white h-full transition-all duration-1000 ease-out" style={{width: `${Math.min(100, (current/max)*100)}%`}}></div>
                    </div>
                    <div className="flex items-baseline gap-1 min-w-[50px] justify-end">
                        <span className="text-xs font-bold text-white">{current}</span>
                        <span className="text-[8px] text-gray-600 font-medium">/ {max}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
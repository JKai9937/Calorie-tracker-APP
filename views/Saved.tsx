import React from 'react';
import { FoodItem, AppView } from '../types';

interface SavedProps {
  logs: FoodItem[];
  onBack: () => void;
}

export const Saved: React.FC<SavedProps> = ({ logs, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-black text-white font-display">
      <div className="flex items-center justify-between p-6 border-b border-white/20 flex-none">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] group">
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back
        </button>
        <h2 className="text-xl font-black uppercase tracking-tight">Daily Logs</h2>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20">
            <span className="material-symbols-outlined text-6xl">folder_open</span>
            <span className="font-bold uppercase tracking-widest text-xs">No Records Found</span>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {[...logs].reverse().map((log, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-[#111] border-l-2 border-white hover:bg-[#1a1a1a] transition-colors group">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{log.name}</span>
                  <div className="flex gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    <span>P: <span className="text-gray-300">{log.macros.protein}</span></span>
                    <span>C: <span className="text-gray-300">{log.macros.carbs}</span></span>
                    <span>F: <span className="text-gray-300">{log.macros.fat}</span></span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-white leading-none">{log.calories}</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">kcal</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
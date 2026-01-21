import React from 'react';
import { FoodItem } from '../types';

interface ResultProps {
  image: string;
  result: FoodItem | null;
  isLoading: boolean;
  targetCalories: number;
  onConfirm: (item: FoodItem) => void;
  onRetake: () => void;
}

export const Result: React.FC<ResultProps> = ({ image, result, isLoading, targetCalories, onConfirm, onRetake }) => {
  
  // Determine if there is an error based on the result name/status
  const isError = result?.name === "Analysis Failed" || result?.name === "System Error";

  if (isError) {
      return (
        <div className="bg-black text-white font-display h-screen w-full flex flex-col items-center justify-center p-6 text-center z-50 relative">
             <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/30">
                <span className="material-symbols-outlined text-4xl text-red-500">signal_disconnected</span>
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">Connection Failed</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto mb-10">
                {result?.evaluation || "The server took too long to respond."}
             </p>
             <button 
                onClick={onRetake} 
                className="w-full max-w-[200px] py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
             >
                Try Again
             </button>
        </div>
      );
  }

  // Default Placeholder while loading
  const item = result || {
    name: "SCANNING...",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
    confidence: 0,
    evaluation: "Analysing structure...",
    timestamp: new Date()
  };

  const percentOfDaily = targetCalories > 0 ? Math.round((item.calories / targetCalories) * 100) : 0;
  
  // Validation: Allow confirm only if we have data and not loading
  const isValid = !isLoading && !isError && item.calories >= 0;

  return (
    <div className="bg-black text-white font-display overflow-hidden h-screen w-full flex flex-col">
      {/* Image Header */}
      <div className="relative h-[45vh] w-full shrink-0 group overflow-hidden bg-black">
        <div 
          className="absolute inset-0 bg-center bg-cover" 
          style={{ backgroundImage: `url('${image}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none"></div>
        
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 pt-8">
          <button 
            onClick={onRetake}
            className="text-white hover:text-gray-300 transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined text-3xl drop-shadow-md">arrow_back</span>
          </button>
        </div>
        
        {!isLoading && !isError && (
            <div className="absolute bottom-6 right-6 z-10 animate-in fade-in slide-in-from-right duration-700">
                <div className="flex flex-col items-end text-right">
                    <span className="text-4xl font-black leading-none text-white drop-shadow-lg">{percentOfDaily}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 drop-shadow-md">of Daily Budget</span>
                </div>
            </div>
        )}

        {/* Loading Overlay inside Image Area */}
        {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center">
                 <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white animate-pulse">Processing</span>
            </div>
        )}
      </div>

      {/* Content Body */}
      <div className="relative flex-1 w-full bg-black flex flex-col border-t border-white/10 overflow-y-auto">
        
        {/* Evaluation Box */}
        {!isLoading && item.evaluation && (
            <div className="p-6 pb-2 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                 <p className="text-sm font-medium leading-relaxed text-gray-300 italic border-l-2 border-white pl-4">
                    "{item.evaluation}"
                </p>
            </div>
        )}

        {/* Title Block */}
        <div className="flex justify-between items-end px-6 py-4">
          <div className="w-full overflow-hidden">
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] mb-1 uppercase">Analysis Result</p>
            <h2 className={`text-3xl font-black leading-none tracking-tight text-white uppercase break-words ${isLoading ? 'opacity-50' : ''}`}>
              {item.name}
            </h2>
          </div>
        </div>

        {/* Macros Grid */}
        <div className={`grid grid-cols-4 divide-x divide-white/10 border-y border-white/10 bg-[#050505] min-h-[100px] transition-opacity duration-500 ${isLoading ? 'opacity-20 blur-sm' : 'opacity-100'}`}>
          <div className="flex flex-col items-center justify-center p-2 bg-[#111]">
             <span className="text-2xl font-black text-white">{item.calories}</span>
             <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">KCAL</span>
          </div>
          <MacroBox label="PRO" value={`${item.macros.protein}g`} />
          <MacroBox label="CARB" value={`${item.macros.carbs}g`} />
          <MacroBox label="FAT" value={`${item.macros.fat}g`} />
        </div>

        {/* Action Buttons */}
        <div className="p-6 mt-auto border-t border-white/10 bg-black">
          <button 
            onClick={() => onConfirm(item)}
            disabled={!isValid}
            className="w-full bg-white text-black h-16 text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
             <span>Confirm & Log</span>
             <span className="material-symbols-outlined">add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const MacroBox = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col items-center justify-center p-2">
       <span className="text-lg font-black text-white">{value}</span>
       <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    </div>
);
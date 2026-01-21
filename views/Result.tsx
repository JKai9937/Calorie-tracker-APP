
import React, { useEffect, useState } from 'react';
import { FoodItem } from '../types';

interface ResultProps {
  image: string;
  analysisPromise: Promise<FoodItem>;
  targetCalories: number; // passed from app state
  onConfirm: (item: FoodItem) => void;
  onRetake: () => void;
}

export const Result: React.FC<ResultProps> = ({ image, analysisPromise, targetCalories, onConfirm, onRetake }) => {
  const [data, setData] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    analysisPromise
      .then((result) => {
        if (active) {
            setData(result);
            setLoading(false);
        }
      })
      .catch((err) => {
        console.error("View Promise Error:", err);
        if (active) {
            setLoading(false);
        }
      });
    return () => { active = false; };
  }, [analysisPromise]);

  const item = data || {
    name: "ANALYZING...",
    calories: 0,
    macros: { protein: 0, carbs: 0, fat: 0 },
    confidence: 0,
    evaluation: "AI 正在全力解析图片，请稍后...",
    timestamp: new Date()
  };

  // Synchronize error checks with service naming
  const isError = item.name === "API Key Error" || item.name === "Analysis Failed" || item.name === "Configuration Error";

  if (!loading && isError) {
      return (
        <div className="bg-black text-white font-display h-screen w-full flex flex-col items-center justify-center p-6 text-center z-50 absolute inset-0">
             <div className="w-20 h-20 bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/30">
                <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
             </div>
             <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-4">{item.name}</h2>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto mb-10">
                {item.evaluation}
             </p>
             <button 
                onClick={onRetake} 
                className="w-full max-w-[200px] py-4 bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors"
             >
                Return to Scan
             </button>
        </div>
      );
  }

  const percentOfDaily = targetCalories > 0 ? Math.round((item.calories / targetCalories) * 100) : 0;
  
  // Validation: Allow only if we have successful data
  const isValid = !loading && !isError && item.calories >= 0 && item.name && item.name !== "ANALYZING...";

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
        
        {!loading && !isError && (
            <div className="absolute bottom-6 right-6 z-10">
                <div className="flex flex-col items-end text-right">
                    <span className="text-4xl font-black leading-none text-white drop-shadow-lg">{percentOfDaily}%</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 drop-shadow-md">of Daily Budget</span>
                </div>
            </div>
        )}
      </div>

      {/* Content Body */}
      <div className="relative flex-1 w-full bg-black flex flex-col border-t border-white/10 overflow-y-auto">
        
        {/* Evaluation Box */}
        {!loading && item.evaluation && !isError && (
            <div className="p-6 pb-2">
                 <p className="text-sm font-medium leading-relaxed text-gray-300 italic border-l-2 border-white pl-4">
                    "{item.evaluation}"
                </p>
            </div>
        )}

        {/* Title Block */}
        <div className="flex justify-between items-end px-6 py-4">
          <div className="w-full overflow-hidden">
            <p className="text-gray-500 text-[10px] font-bold tracking-[0.2em] mb-1 uppercase">Analysis Result</p>
            <h2 className={`text-3xl font-black leading-none tracking-tight text-white uppercase break-words ${loading ? 'animate-pulse' : ''}`}>
              {item.name}
            </h2>
          </div>
        </div>

        {/* Macros Grid */}
        <div className="grid grid-cols-4 divide-x divide-white/10 border-y border-white/10 bg-[#050505] min-h-[100px]">
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
            {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent animate-spin"></div>
                    <span>Processing</span>
                </>
            ) : (
                <>
                    <span>Confirm & Log</span>
                    <span className="material-symbols-outlined">add</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for macro display
const MacroBox = ({ label, value }: { label: string, value: string }) => (
    <div className="flex flex-col items-center justify-center p-2">
       <span className="text-lg font-black text-white">{value}</span>
       <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    </div>
);

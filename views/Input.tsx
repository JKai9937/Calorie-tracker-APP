import React, { useState } from 'react';
import { FoodItem, AppView } from '../types';

interface InputProps {
  onAdd: (item: FoodItem) => void;
  onCancel: () => void;
}

export const Input: React.FC<InputProps> = ({ onAdd, onCancel }) => {
  const [mode, setMode] = useState<'food' | 'exercise'>('food');
  
  // Common State
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<string>('');

  // Food State
  const [protein, setProtein] = useState<string>('');
  const [carbs, setCarbs] = useState<string>('');
  const [fat, setFat] = useState<string>('');

  // Exercise State
  const [environment, setEnvironment] = useState<'indoor' | 'outdoor'>('indoor');
  const [duration, setDuration] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !calories) return;

    const calValue = parseInt(calories);
    
    // For exercise, calories are technically "burnt", so we might store them as negative 
    // or keep positive but handle subtraction in stats logic. 
    // Usually trackers store positive numbers but type='exercise' implies subtraction.
    // However, to make the donut chart math easier in existing App structure which sums logs, 
    // let's store it as negative.
    const finalCalories = mode === 'exercise' ? -Math.abs(calValue) : Math.abs(calValue);

    const newItem: FoodItem = {
      name,
      calories: finalCalories,
      macros: {
        protein: mode === 'food' ? parseInt(protein) || 0 : 0,
        carbs: mode === 'food' ? parseInt(carbs) || 0 : 0,
        fat: mode === 'food' ? parseInt(fat) || 0 : 0
      },
      confidence: 100,
      timestamp: new Date(),
      type: mode,
      activityDetails: mode === 'exercise' ? {
          environment,
          duration: parseInt(duration) || 0
      } : undefined
    };
    onAdd(newItem);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white font-display">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 flex-none bg-black">
        <button onClick={onCancel} className="text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[10px] flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">close</span>
            Cancel
        </button>
        <h2 className="text-xl font-black uppercase tracking-tight">New Log</h2>
        <div className="w-16"></div>
      </div>

      {/* Mode Toggle */}
      <div className="flex p-6 pb-0 gap-4">
          <button 
            onClick={() => setMode('food')}
            className={`flex-1 py-4 border border-white/20 font-black uppercase tracking-widest transition-all ${mode === 'food' ? 'bg-white text-black' : 'bg-[#111] text-gray-500 hover:border-white'}`}
          >
              Intake
          </button>
          <button 
            onClick={() => setMode('exercise')}
            className={`flex-1 py-4 border border-white/20 font-black uppercase tracking-widest transition-all ${mode === 'exercise' ? 'bg-white text-black' : 'bg-[#111] text-gray-500 hover:border-white'}`}
          >
              Burn
          </button>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-6 gap-6 overflow-y-auto">
        
        {/* Render based on Mode */}
        {mode === 'food' ? (
            /* FOOD FORM */
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Food Name</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-[#111] border border-white/20 p-4 text-xl font-bold text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                        placeholder="e.g. Avocado Toast"
                        autoFocus
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Calories (kcal)</label>
                    <input 
                        type="number" 
                        value={calories}
                        onChange={e => setCalories(e.target.value)}
                        className="bg-[#111] border border-white/20 p-4 text-4xl font-black text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                        placeholder="0"
                    />
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Pro (g)</label>
                        <input 
                        type="number" 
                        value={protein}
                        onChange={e => setProtein(e.target.value)}
                        className="bg-[#111] border border-white/20 p-3 text-lg font-bold text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                        placeholder="0"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Carb (g)</label>
                        <input 
                        type="number" 
                        value={carbs}
                        onChange={e => setCarbs(e.target.value)}
                        className="bg-[#111] border border-white/20 p-3 text-lg font-bold text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                        placeholder="0"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Fat (g)</label>
                        <input 
                        type="number" 
                        value={fat}
                        onChange={e => setFat(e.target.value)}
                        className="bg-[#111] border border-white/20 p-3 text-lg font-bold text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                        placeholder="0"
                        />
                    </div>
                </div>
            </div>
        ) : (
            /* EXERCISE FORM */
            <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Environment Selector */}
                <div className="flex gap-4">
                     <button 
                        type="button"
                        onClick={() => setEnvironment('indoor')}
                        className={`flex-1 h-20 border border-white/20 flex flex-col items-center justify-center gap-1 transition-all ${environment === 'indoor' ? 'bg-white text-black' : 'bg-[#111] text-gray-500 hover:text-white'}`}
                     >
                         <span className="material-symbols-outlined">home</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Indoor</span>
                     </button>
                     <button 
                        type="button"
                        onClick={() => setEnvironment('outdoor')}
                        className={`flex-1 h-20 border border-white/20 flex flex-col items-center justify-center gap-1 transition-all ${environment === 'outdoor' ? 'bg-white text-black' : 'bg-[#111] text-gray-500 hover:text-white'}`}
                     >
                         <span className="material-symbols-outlined">park</span>
                         <span className="text-[10px] font-bold uppercase tracking-widest">Outdoor</span>
                     </button>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Activity Type</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="bg-[#111] border border-white/20 p-4 text-xl font-bold text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                        placeholder="e.g. Running, Yoga"
                    />
                </div>

                <div className="flex gap-4">
                     <div className="flex flex-col gap-2 flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Duration (min)</label>
                        <input 
                            type="number" 
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
                            className="bg-[#111] border border-white/20 p-4 text-2xl font-black text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                            placeholder="0"
                        />
                    </div>
                    <div className="flex flex-col gap-2 flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Burned (kcal)</label>
                        <input 
                            type="number" 
                            value={calories}
                            onChange={e => setCalories(e.target.value)}
                            className="bg-[#111] border border-white/20 p-4 text-2xl font-black text-white placeholder:text-gray-700 focus:border-white focus:ring-0 outline-none rounded-none"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>
        )}
      </form>

      <div className="p-6 border-t border-white/20 bg-black">
        <button 
          onClick={handleSubmit}
          disabled={!name || !calories}
          className="w-full bg-white text-black h-16 text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          <span>{mode === 'food' ? 'Log Intake' : 'Log Workout'}</span>
          <span className="material-symbols-outlined">{mode === 'food' ? 'add' : 'remove'}</span>
        </button>
      </div>
    </div>
  );
};
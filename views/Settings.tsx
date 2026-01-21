import React, { useState } from 'react';
import { UserProfile, Macros } from '../types';

interface SettingsProps {
    profile: UserProfile | null;
    onUpdateProfile: (p: UserProfile, t: number, m: Macros) => void;
}

// Logic reuse
const calculateTarget = (weight: number, height: number, goal: string, lifestyle: string, gender: string) => {
    const s = gender === 'male' ? 5 : -161;
    const bmr = (10 * weight) + (6.25 * height) - (5 * 25) + s;
    const activity = lifestyle === 'athlete' ? 1.55 : 1.2;
    let goalMod = 1.0;
    if (goal === 'lose') goalMod = 0.85;
    if (goal === 'gain') goalMod = 1.15;
    return Math.round(bmr * activity * goalMod);
};

export const Settings: React.FC<SettingsProps> = ({ profile, onUpdateProfile }) => {
    // Local state for editing form
    const [weight, setWeight] = useState(profile?.weight || 75);
    const [height, setHeight] = useState(profile?.height || 175);
    const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>(profile?.goal || 'maintain');
    const [lifestyle, setLifestyle] = useState<'general' | 'athlete'>(profile?.lifestyle || 'general');
    const [showSaved, setShowSaved] = useState(false);

    const handleSave = () => {
        if (!profile) return;
        const newTarget = calculateTarget(weight, height, goal, lifestyle, profile.gender);
        
        // Recalc Macros
        let pSplit = 0.3, cSplit = 0.4, fSplit = 0.3;
        if (goal === 'gain') { pSplit = 0.3; cSplit = 0.5; fSplit = 0.2; }
        if (goal === 'lose') { pSplit = 0.4; cSplit = 0.3; fSplit = 0.3; }

        const newMacros: Macros = {
          protein: Math.round((newTarget * pSplit) / 4),
          carbs: Math.round((newTarget * cSplit) / 4),
          fat: Math.round((newTarget * fSplit) / 9),
        };

        onUpdateProfile({ ...profile, weight, height, goal, lifestyle }, newTarget, newMacros);
        
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    };

    if (showSaved) {
        return (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
                <div className="w-20 h-20 border border-white flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl text-white">check</span>
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Changes Saved</h2>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Configuration Updated</p>
            </div>
        );
    }

    return (
        <div className="bg-black h-full flex flex-col font-display text-white relative">
            <div className="p-6 pt-10 border-b border-white/20 flex justify-between items-end" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))' }}>
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-white">Settings</h1>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">System Configuration</p>
                </div>
                <div className="w-2 h-2 bg-white"></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-10">
                {/* Installation Tip */}
                 <div className="bg-[#111] p-4 border-l-2 border-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-white text-sm">install_mobile</span>
                        <span className="text-xs font-bold uppercase tracking-widest text-white">Install App</span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase font-bold">
                        To install: Tap your browser's Share/Menu button and select "Add to Home Screen".
                    </p>
                </div>

                {/* API Key Tip */}
                <div className="flex items-start gap-4 p-4 border border-white/10 bg-[#0a0a0a]">
                     <span className="material-symbols-outlined text-gray-500 text-lg mt-0.5">key</span>
                     <div>
                         <h3 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">API Key Config</h3>
                         <p className="text-[10px] text-gray-500 leading-relaxed">
                             This app requires a Google Gemini API Key. Get one at 
                             <span className="text-white mx-1">aistudio.google.com</span>
                             and add it to your deployment environment variables as <code className="text-white">API_KEY</code>.
                         </p>
                     </div>
                </div>

                {/* Profile Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">01 // Metrics</span>
                        <div className="h-[1px] flex-1 bg-white/30"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                        <InputRow label="Weight (KG)" value={weight} onChange={setWeight} />
                        <InputRow label="Height (CM)" value={height} onChange={setHeight} />
                    </div>
                </section>

                {/* Goal Section */}
                <section>
                    <div className="flex items-center gap-2 mb-6 opacity-60">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white">02 // Parameters</span>
                        <div className="h-[1px] flex-1 bg-white/30"></div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Target Goal</span>
                            <div className="relative">
                                <select 
                                    value={goal} 
                                    onChange={(e) => setGoal(e.target.value as any)}
                                    className="w-full bg-[#111] border border-white/20 p-4 font-bold uppercase text-white focus:border-white focus:ring-0 outline-none appearance-none rounded-none"
                                >
                                    <option value="lose" className="bg-black text-white">Lose Weight</option>
                                    <option value="maintain" className="bg-black text-white">Maintain</option>
                                    <option value="gain" className="bg-black text-white">Gain Muscle</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Lifestyle</span>
                             <div className="relative">
                                <select 
                                    value={lifestyle} 
                                    onChange={(e) => setLifestyle(e.target.value as any)}
                                    className="w-full bg-[#111] border border-white/20 p-4 font-bold uppercase text-white focus:border-white focus:ring-0 outline-none appearance-none rounded-none"
                                >
                                    <option value="general" className="bg-black text-white">General (Sedentary)</option>
                                    <option value="athlete" className="bg-black text-white">Athlete (Active)</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white">
                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </section>

                {/* Estimated Target Display */}
                <div className="mt-auto pt-8 pb-4">
                     <div className="border border-white/20 bg-[#111] p-6 flex flex-col items-center justify-center gap-2 mb-4">
                         <span className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em]">Daily Calorie Budget</span>
                         <span className="text-5xl font-black text-white tracking-tighter">
                             {calculateTarget(weight, height, goal, lifestyle, profile?.gender || 'male')}
                         </span>
                         <span className="text-xs font-bold text-gray-400">KCAL</span>
                     </div>

                    <button 
                        onClick={handleSave}
                        className="w-full h-16 bg-white text-black text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <span>Confirm Changes</span>
                        <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputRow = ({ label, value, onChange }: any) => (
    <div className="flex flex-col gap-2">
        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">{label}</span>
        <div className="relative">
            <input 
                type="number" 
                value={value}
                onChange={(e) => onChange(parseInt(e.target.value))}
                className="w-full bg-[#111] border border-white/20 p-4 font-black text-2xl text-white focus:border-white focus:ring-0 outline-none rounded-none"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                <span className="material-symbols-outlined text-sm">edit</span>
            </div>
        </div>
    </div>
);
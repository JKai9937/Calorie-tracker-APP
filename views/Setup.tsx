import React, { useState, useEffect } from 'react';
import { UserProfile, Macros } from '../types';

interface SetupProps {
  onComplete: (profile: UserProfile, calculatedTarget: number, calculatedMacros: Macros) => void;
}

export const Setup: React.FC<SetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');
  const [lifestyle, setLifestyle] = useState<'general' | 'athlete'>('general');
  const [target, setTarget] = useState<number>(2000);

  // Dynamic calculation
  useEffect(() => {
    const s = gender === 'male' ? 5 : -161;
    const bmr = (10 * weight) + (6.25 * height) - (5 * 25) + s; 
    const activity = lifestyle === 'athlete' ? 1.55 : 1.2;
    let goalMod = 1.0;
    if (goal === 'lose') goalMod = 0.85;
    if (goal === 'gain') goalMod = 1.15;

    setTarget(Math.round(bmr * activity * goalMod));
  }, [weight, height, gender, lifestyle, goal]);

  const handleStart = () => {
    let pSplit = 0.3, cSplit = 0.4, fSplit = 0.3;
    if (goal === 'gain') { pSplit = 0.3; cSplit = 0.5; fSplit = 0.2; }
    if (goal === 'lose') { pSplit = 0.4; cSplit = 0.3; fSplit = 0.3; }

    const calculatedMacros: Macros = {
      protein: Math.round((target * pSplit) / 4),
      carbs: Math.round((target * cSplit) / 4),
      fat: Math.round((target * fSplit) / 9),
    };

    onComplete({ gender, weight, height, goal, lifestyle, isSetup: true }, target, calculatedMacros);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-black text-white overflow-hidden font-display">
      {/* Header */}
      <header className="pt-8 pb-4 px-6 border-b border-white/20 flex justify-between items-end flex-none">
        <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-white">Setup</h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="w-2 h-2 bg-white"></span>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Step 0{step}</p>
            </div>
        </div>
        {step === 2 && (
            <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Back</button>
        )}
      </header>
      
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Step 1: All Inputs */}
        {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right duration-500 p-6 flex flex-col gap-8 pb-32">
                <div>
                    <SectionLabel title="Biological Details" />
                    <div className="flex gap-4 mb-4">
                        <RadioBox label="Male" active={gender === 'male'} onClick={() => setGender('male')} />
                        <RadioBox label="Female" active={gender === 'female'} onClick={() => setGender('female')} />
                    </div>
                    
                    <div className="flex flex-col gap-4">
                       <CompactInput label="Weight (KG)" value={weight} onChange={setWeight} max={200} />
                       <CompactInput label="Height (CM)" value={height} onChange={setHeight} max={250} />
                    </div>
                </div>
                
                <div>
                    <SectionLabel title="Lifestyle & Goal" />
                    <div className="flex flex-col gap-3">
                        <div className="flex gap-2">
                            <SmallRadio label="Sedentary" active={lifestyle === 'general'} onClick={() => setLifestyle('general')} />
                            <SmallRadio label="Athlete" active={lifestyle === 'athlete'} onClick={() => setLifestyle('athlete')} />
                        </div>
                        <div className="h-[1px] bg-white/10 w-full my-1"></div>
                        <div className="flex flex-col gap-2">
                            <RadioRow label="Lose Weight" active={goal === 'lose'} onClick={() => setGoal('lose')} />
                            <RadioRow label="Maintain" active={goal === 'maintain'} onClick={() => setGoal('maintain')} />
                            <RadioRow label="Gain Muscle" active={goal === 'gain'} onClick={() => setGoal('gain')} />
                        </div>
                    </div>
                </div>
            </div>
        )}
        
        {/* Step 2: Confirmation */}
        {step === 2 && (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center animate-in fade-in slide-in-from-right duration-500">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 max-w-[200px] leading-relaxed">
                    Based on your metrics, this is your daily requirement
                </span>
                
                <div className="border border-white/20 p-10 w-full flex flex-col items-center bg-[#111] mb-8">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-4">Calorie Budget</span>
                    <span className="text-7xl font-black tracking-tighter text-white leading-none mb-2">{target}</span>
                    <span className="text-xs font-bold uppercase text-white tracking-widest bg-white/10 px-3 py-1 mt-2">KCAL / DAY</span>
                </div>
                
                <div className="grid grid-cols-3 gap-0 w-full border border-white/20">
                    <SummaryMacro label="Protein" val="High" />
                    <SummaryMacro label="Carbs" val={goal === 'lose' ? 'Med' : 'High'} />
                    <SummaryMacro label="Fat" val="Med" />
                </div>
            </div>
        )}
      </main>

      <footer className="p-6 bg-black border-t border-white/20 z-20 flex-none">
        {step === 1 ? (
            <button 
                onClick={() => setStep(2)}
                className="w-full bg-white text-black h-14 text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 group"
            >
                <span>Calculate</span>
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
        ) : (
            <button 
                onClick={handleStart}
                className="w-full bg-white text-black h-14 text-sm font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors flex items-center justify-center gap-3 group"
            >
                <span>Initialize System</span>
                <span className="material-symbols-outlined group-hover:scale-110 transition-transform">check</span>
            </button>
        )}
      </footer>
    </div>
  );
};

const SectionLabel = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mb-4 opacity-60">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white">{title}</span>
        <div className="h-[1px] flex-1 bg-white/30"></div>
    </div>
);

const RadioBox = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`flex-1 h-16 flex items-center justify-center cursor-pointer transition-all border border-white/20 ${active ? 'bg-white text-black' : 'bg-black text-gray-500 hover:text-white hover:border-white'}`}>
        <span className="font-black text-sm tracking-widest uppercase">{label}</span>
    </div>
);

const SmallRadio = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`flex-1 h-12 flex items-center justify-center cursor-pointer transition-all border border-white/20 ${active ? 'bg-white text-black' : 'bg-black text-gray-500 hover:text-white hover:border-white'}`}>
        <span className="font-bold text-[10px] tracking-widest uppercase">{label}</span>
    </div>
);

const RadioRow = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <div onClick={onClick} className={`relative cursor-pointer h-12 w-full border border-white/20 flex items-center justify-between px-4 transition-all ${active ? 'bg-white text-black' : 'bg-black text-gray-500 hover:border-white'}`}>
        <span className="font-bold text-xs uppercase tracking-tight">{label}</span>
        {active && <span className="material-symbols-outlined text-sm">check</span>}
    </div>
);

const CompactInput = ({ label, value, onChange, max }: any) => (
    <div className="flex items-center gap-4 bg-[#111] p-3 border border-white/20">
        <span className="text-[10px] font-bold uppercase text-gray-500 w-24">{label}</span>
        <input 
            type="number" 
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="bg-transparent text-white text-xl font-bold w-full p-0 border-none focus:ring-0 outline-none text-right" 
        />
    </div>
);

const SummaryMacro = ({ label, val }: { label: string, val: string }) => (
    <div className="flex flex-col items-center justify-center p-4 border-r border-white/20 last:border-r-0">
        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest mb-1">{label}</span>
        <span className="font-black uppercase text-xl text-white">{val}</span>
    </div>
);
import React, { useState } from 'react';
import { UserProfile, FoodItem } from '../types';

interface ProfileProps {
    profile: UserProfile | null;
    logs: FoodItem[]; // Need logs for Daily/Month views
}

export const Profile: React.FC<ProfileProps> = ({ profile, logs }) => {
  const [viewMode, setViewMode] = useState<'daily' | 'week' | 'month'>('daily');

  // Filter logs for "Today" (mock logic for demo, using all logs or recent)
  const todayLogs = logs; // In a real app, filter by date.

  const getMealTime = (date: Date) => {
      const h = date.getHours();
      if(h < 11) return 'Breakfast';
      if(h < 17) return 'Lunch';
      return 'Dinner';
  };

  const meals = {
      Breakfast: todayLogs.filter(l => getMealTime(new Date(l.timestamp)) === 'Breakfast'),
      Lunch: todayLogs.filter(l => getMealTime(new Date(l.timestamp)) === 'Lunch'),
      Dinner: todayLogs.filter(l => getMealTime(new Date(l.timestamp)) === 'Dinner'),
  };

  return (
    <div className="bg-black text-white font-display antialiased h-full flex flex-col overflow-hidden">
       {/* Toggle Header */}
      <div className="flex w-full border-b border-white/20 sticky top-0 z-10 bg-black pt-2 shrink-0">
        <button 
            onClick={() => setViewMode('daily')}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all group`}
        >
          <span className={`text-xs font-black uppercase tracking-[0.2em] ${viewMode === 'daily' ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>Daily</span>
          <div className={`h-[2px] bg-white transition-all duration-300 ${viewMode === 'daily' ? 'w-8' : 'w-0'}`}></div>
        </button>

        <button 
            onClick={() => setViewMode('week')}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all group`}
        >
          <span className={`text-xs font-black uppercase tracking-[0.2em] ${viewMode === 'week' ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>Week</span>
          <div className={`h-[2px] bg-white transition-all duration-300 ${viewMode === 'week' ? 'w-8' : 'w-0'}`}></div>
        </button>
        
        <button 
            onClick={() => setViewMode('month')}
            className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all group`}
        >
          <span className={`text-xs font-black uppercase tracking-[0.2em] ${viewMode === 'month' ? 'text-white' : 'text-gray-600 group-hover:text-gray-400'}`}>Month</span>
          <div className={`h-[2px] bg-white transition-all duration-300 ${viewMode === 'month' ? 'w-8' : 'w-0'}`}></div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'daily' && (
             /* DAILY VIEW */
            <div className="flex flex-col p-6 animate-in fade-in duration-300 gap-8">
                 <div className="flex items-center justify-between">
                    <span className="text-white text-2xl font-black uppercase tracking-tight">Today</span>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">{new Date().toLocaleDateString()}</span>
                 </div>
                 
                 <div className="flex flex-col gap-8">
                    <MealSection title="Breakfast" logs={meals.Breakfast} />
                    <MealSection title="Lunch" logs={meals.Lunch} />
                    <MealSection title="Dinner" logs={meals.Dinner} />
                 </div>
            </div>
        )}

        {viewMode === 'week' && (
            /* WEEK VIEW */
            <div className="flex flex-col p-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-white text-2xl font-black uppercase tracking-tight">Performance</span>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">Current Week</span>
                </div>

                {/* Calendar Grid Header */}
                <div className="grid grid-cols-7 mb-4">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-gray-600 text-[10px] font-bold text-center h-8 flex items-center justify-center uppercase tracking-widest">{day}</div>
                ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-y-6">
                <div className="h-10"></div><div className="h-10"></div><div className="h-10"></div><div className="h-10"></div>
                <DayCell day={1} status="limit" />
                <DayCell day={2} status="target" />
                <DayCell day={3} status="target" />
                <DayCell day={4} status="limit" />
                {/* Active Day */}
                <div className="h-10 w-full flex flex-col items-center justify-start relative">
                    <div className="w-8 h-8 bg-white flex items-center justify-center absolute top-[-6px] rounded-none">
                    <span className="text-sm font-black text-black">5</span>
                    </div>
                </div>
                <DayCell day={6} status="target" />
                <DayCell day={7} status="limit" />
                </div>

                <div className="mt-10 pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center bg-[#111] p-6 border border-white/10">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Weekly Average</span>
                        <div className="flex flex-col items-end">
                            <span className="text-3xl font-black text-white leading-none">1,940</span>
                            <span className="text-[8px] text-gray-500 font-bold uppercase mt-1">KCAL / DAY</span>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {viewMode === 'month' && (
            /* MONTH VIEW - Fixed Rendering */
            <div className="flex flex-col p-6 animate-in fade-in duration-300 min-h-min">
                <div className="flex items-center justify-between mb-8">
                    <span className="text-white text-2xl font-black uppercase tracking-tight">History</span>
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">October</span>
                </div>
                {/* Use a flex container with explicit gap */}
                <div className="flex flex-col gap-3 w-full pb-8">
                    {/* Mock Data for Month View */}
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="flex justify-between items-center p-4 bg-[#111] border-l-2 border-white/20 hover:border-white transition-all hover:bg-[#1a1a1a]">
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white uppercase tracking-widest">Oct {10 - i}</span>
                                <span className="text-[8px] text-gray-500 font-bold uppercase mt-1">4 Meals</span>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                {/* Visual Bar */}
                                <div className="w-16 h-1 bg-[#333] hidden sm:block">
                                    <div className="h-full bg-white" style={{width: `${40 + Math.random() * 60}%`}}></div>
                                </div>
                                <div className="flex flex-col items-end min-w-[50px]">
                                    <span className="text-lg font-black text-white leading-none">{1800 + Math.floor(Math.random() * 500)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const MealSection = ({ title, logs }: { title: string, logs: FoodItem[] }) => (
    <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 mb-1 opacity-60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white w-20">{title}</span>
            <div className="h-[1px] flex-1 bg-white/30"></div>
        </div>
        {logs.length === 0 ? (
            <div className="p-4 border border-dashed border-white/10 text-center">
                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No Entry</span>
            </div>
        ) : (
             logs.map((log, idx) => (
                <div key={idx} className="flex justify-between items-center bg-[#111] p-4 border-l border-white/50">
                    <div className="flex flex-col">
                        <span className="text-sm font-black uppercase text-white">{log.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <span className="text-lg font-bold text-white">{log.calories}</span>
                </div>
             ))
        )}
    </div>
);

const DayCell = ({ day, status }: { day: number, status: 'target' | 'limit' }) => (
  <button className="group h-10 w-full flex flex-col items-center justify-start gap-1">
    <span className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors">{day}</span>
    <div className={`w-1 h-1 rounded-none ${status === 'target' ? 'bg-white' : 'bg-gray-800'}`}></div>
  </button>
);
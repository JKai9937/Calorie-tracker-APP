import React, { useState, useEffect } from 'react';
import { BodyLog } from '../types';

interface BodyTrackerProps {
  logs: BodyLog[];
  onAddLog: (image: string, note: string) => void;
  onOpenCamera: () => void;
  pendingImage: string | null;
  onClearPending: () => void;
}

export const BodyTracker: React.FC<BodyTrackerProps> = ({ logs, onAddLog, onOpenCamera, pendingImage, onClearPending }) => {
  const [note, setNote] = useState('');

  // Handle saving when a new image is pending
  const handleSave = () => {
    if (pendingImage) {
        onAddLog(pendingImage, note || "No evaluation provided.");
        setNote('');
        onClearPending();
    }
  };

  // If there's a pending image (just returned from camera), show the input form
  if (pendingImage) {
      return (
          <div className="bg-black h-full flex flex-col font-display text-white p-6 animate-in fade-in slide-in-from-bottom duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tight mb-6">New Entry</h2>
              
              <div className="flex-1 flex flex-col gap-6 overflow-y-auto">
                  <div className="w-full aspect-square bg-[#111] border border-white/20 overflow-hidden relative">
                      <img src={pendingImage} className="absolute inset-0 w-full h-full object-cover" alt="Physique" />
                  </div>
                  
                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Date</span>
                      <div className="p-4 bg-[#111] border border-white/10">
                          <span className="text-white font-bold uppercase">{new Date().toLocaleString()}</span>
                      </div>
                  </div>

                  <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold uppercase text-gray-500 tracking-widest">Self Evaluation</span>
                      <textarea 
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          className="w-full bg-[#111] border border-white/20 p-4 font-bold text-white focus:border-white focus:ring-0 outline-none h-32 rounded-none resize-none"
                          placeholder="Note down measurements, feelings, or progress..."
                      />
                  </div>
              </div>

              <div className="flex gap-4 mt-6">
                   <button 
                      onClick={() => { setNote(''); onClearPending(); }}
                      className="flex-1 h-14 border border-white/30 text-white font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                   >
                      Discard
                   </button>
                   <button 
                      onClick={handleSave}
                      className="flex-[2] h-14 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                   >
                      <span>Save Record</span>
                      <span className="material-symbols-outlined">save</span>
                   </button>
              </div>
          </div>
      );
  }

  // Main View: Gallery/List
  return (
    <div className="bg-black h-full flex flex-col font-display text-white">
      <div className="p-6 border-b border-white/20 flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Physique</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Body Composition Tracker</p>
        </div>
        <button 
            onClick={onOpenCamera}
            className="flex items-center gap-2 bg-[#111] hover:bg-[#222] border border-white/20 px-4 py-2 transition-colors active:scale-95"
        >
            <span className="material-symbols-outlined text-sm">add_a_photo</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Add New</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
         {logs.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center gap-4 text-white/20">
                 <span className="material-symbols-outlined text-6xl">accessibility_new</span>
                 <span className="font-bold uppercase tracking-widest text-xs">No Physique Logs</span>
             </div>
         ) : (
             <div className="flex flex-col gap-8">
                 {[...logs].reverse().map((log) => (
                     <div key={log.id} className="flex flex-col bg-[#050505] border border-white/10">
                         {/* Header */}
                         <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#111]">
                             <span className="text-xs font-bold uppercase text-white tracking-widest">{new Date(log.date).toLocaleDateString()}</span>
                             <span className="text-[10px] font-bold uppercase text-gray-500">{new Date(log.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         </div>
                         
                         {/* Image */}
                         <div className="w-full aspect-[4/3] relative bg-black">
                             <img src={log.imageUrl} alt="Physique Log" className="w-full h-full object-contain" />
                         </div>

                         {/* Note */}
                         <div className="p-4 border-t border-white/5">
                             <p className="text-xs font-medium text-gray-400 italic">"{log.note}"</p>
                         </div>
                     </div>
                 ))}
             </div>
         )}
      </div>
    </div>
  );
};
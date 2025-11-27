import React, { useRef } from 'react';
import { DisplayMode } from '../types';

interface UIProps {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  onUpload: (files: FileList | null) => void;
  photoCount: number;
}

export const UI: React.FC<UIProps> = ({ mode, setMode, onUpload, photoCount }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10 text-white font-sans">
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-sm font-bold tracking-widest text-emerald-400 opacity-80 uppercase">Memories</h1>
          <div className="text-4xl font-light text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            {photoCount} <span className="text-xs align-middle text-white opacity-60">POLAROIDS</span>
          </div>
        </div>
        
        {/* Simple Camera Feed Visual (Static representation based on user request context) */}
        <div className="w-32 h-24 border border-emerald-800 bg-black/50 rounded-lg overflow-hidden relative hidden md:block">
           <div className="absolute inset-0 flex items-center justify-center text-[10px] text-emerald-500/50">
             CAMERA FEED
           </div>
           <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        
        {/* Debug/Status info */}
        <div className="text-xs text-emerald-600 space-y-1 font-mono hidden md:block">
           <p>FOLIAGE: 1.5K EMERALD NEEDLES</p>
           <p>LIGHTING: CINEMATIC BLOOM</p>
           <p>STATUS: {mode === 'TREE' ? 'ASSEMBLED' : 'DISPERSED'}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pointer-events-auto">
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={(e) => onUpload(e.target.files)}
          />
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-emerald-900/40 border border-emerald-500/30 backdrop-blur-md rounded hover:bg-emerald-800/60 transition-colors text-xs font-bold tracking-widest uppercase hover:text-emerald-300"
          >
            Import Photos
          </button>

          <div className="flex bg-black/40 backdrop-blur-md rounded border border-white/10 overflow-hidden">
             <button
               onClick={() => setMode('DISPERSED')}
               className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all ${mode === 'DISPERSED' ? 'bg-yellow-500 text-black' : 'text-white hover:bg-white/10'}`}
             >
               Disperse
             </button>
             <button
               onClick={() => setMode('TREE')}
               className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-all ${mode === 'TREE' ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'text-white hover:bg-white/10'}`}
             >
               Assemble Tree
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

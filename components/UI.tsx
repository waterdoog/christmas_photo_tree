import React, { useRef, useState } from 'react';
import { DisplayMode } from '../types';
import { HandTracker } from './HandTracker';

interface UIProps {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  onUpload: (files: FileList | null) => void;
  photoCount: number;
  rotationInputRef: React.MutableRefObject<number>;
  isUploading: boolean;
}

export const UI: React.FC<UIProps> = ({ mode, setMode, onUpload, photoCount, rotationInputRef, isUploading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files);
    }
  };

  return (
    <div 
      className={`absolute inset-0 z-10 flex flex-col justify-between p-6 text-white font-sans transition-colors duration-300 ${isDragging ? 'bg-emerald-900/30 backdrop-blur-sm' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      
      {/* Full screen drop overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center z-50 border-4 border-dashed border-emerald-400 m-8 rounded-3xl pointer-events-none">
          <div className="bg-black/80 px-8 py-4 rounded-xl text-emerald-400 font-bold text-2xl tracking-widest uppercase shadow-[0_0_50px_rgba(16,185,129,0.5)]">
            Drop Memories Here
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-sm font-bold tracking-widest text-emerald-400 opacity-80 uppercase">Memories</h1>
          <div className="text-4xl font-light text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            {photoCount} <span className="text-xs align-middle text-white opacity-60">POLAROIDS</span>
          </div>
          {isUploading && (
             <div className="text-xs text-white/50 mt-1 animate-pulse">SYNCING WITH NEON DB...</div>
          )}
        </div>
        
        {/* Camera Feed / Hand Tracker Area */}
        <div className="w-40 h-32 pointer-events-auto hidden md:block relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
           <HandTracker 
             setMode={setMode} 
             currentMode={mode} 
             rotationInputRef={rotationInputRef}
           />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pointer-events-none">
        
        {/* Debug/Status info */}
        <div className="text-xs text-emerald-600 space-y-1 font-mono hidden md:block">
           <p>FOLIAGE: 1.5K EMERALD NEEDLES</p>
           <p>DATABASE: NEON (SERVERLESS PG)</p>
           <p>STATUS: {mode === 'TREE' ? 'ASSEMBLED' : 'DISPERSED'}</p>
           <p className="text-yellow-600/70">GESTURES: OPEN (DISPERSE) / FIST (ASSEMBLE)</p>
           <p className="text-yellow-600/50">DRAG & DROP PHOTOS TO UPLOAD</p>
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
            disabled={isUploading}
            className="px-6 py-3 bg-emerald-900/40 border border-emerald-500/30 backdrop-blur-md rounded hover:bg-emerald-800/60 transition-colors text-xs font-bold tracking-widest uppercase hover:text-emerald-300 disabled:opacity-50 disabled:cursor-wait"
          >
            {isUploading ? 'Uploading...' : 'Import Photos'}
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
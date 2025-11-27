import React, { useState, useEffect, useRef, Suspense } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { PhotoDetailModal } from './components/PhotoDetailModal';
import { PhotoData, DisplayMode } from './types';
import { initDB, loadPhotos, savePhoto } from './utils/db';

// Fallback images if DB is empty - Increased to 150 for density
const DEFAULT_IMAGES = Array.from({ length: 150 }).map((_, i) => ({
  id: uuidv4(),
  url: `https://picsum.photos/seed/${i + 100}/400/500`,
  aspectRatio: 0.8
}));

function App() {
  const [photos, setPhotos] = useState<PhotoData[]>(DEFAULT_IMAGES);
  const [mode, setMode] = useState<DisplayMode>('TREE');
  const [isUploading, setIsUploading] = useState(false);
  const [dbInitialized, setDbInitialized] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoData | null>(null);
  
  // Shared ref for rotation velocity
  const rotationInputRef = useRef<number>(0);

  // Initialize DB and load photos on mount
  useEffect(() => {
    const setup = async () => {
      // Set initialized immediately to prevent black screen
      setDbInitialized(true);
      
      try {
        // Try to connect to DB in background
        await initDB();
        const savedPhotos = await loadPhotos();
        
        if (savedPhotos.length > 0) {
          setPhotos(savedPhotos);
        }
      } catch (error) {
        console.error('Database setup failed:', error);
        // Continue with default images even if DB fails
      }
    };
    setup();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Clear default images if we are uploading for the first time
    if (photos.length === DEFAULT_IMAGES.length && photos[0].url.includes('picsum')) {
        setPhotos([]);
    }

    const promises = Array.from(files).map(file => savePhoto(file));
    const results = await Promise.all(promises);
    
    // Filter out failed uploads (nulls)
    const newPhotos = results.filter((p): p is PhotoData => p !== null);

    if (newPhotos.length > 0) {
      setPhotos((prev) => {
          // Double check defaults removal in case state update batched
          const isDefaults = prev.length === DEFAULT_IMAGES.length && prev[0].url.includes('picsum');
          return isDefaults ? newPhotos : [...prev, ...newPhotos];
      });
    }
    
    setIsUploading(false);
  };

  return (
    <div className="w-full h-full relative bg-black">
      {/* Visual Loader */}
      {!dbInitialized && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black text-emerald-500 font-mono text-sm tracking-widest">
            CONNECTING TO NEON...
         </div>
      )}

      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Experience 
              photos={photos} 
              mode={mode} 
              rotationInputRef={rotationInputRef}
              onPhotoClick={setSelectedPhoto}
          />
        </Suspense>
      </div>

      {/* UI Overlay Layer with Drag & Drop */}
      <UI 
        mode={mode} 
        setMode={setMode} 
        onUpload={handleUpload}
        photoCount={photos.length}
        rotationInputRef={rotationInputRef}
        isUploading={isUploading}
      />

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        photo={selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        onUpdate={(updatedPhoto) => {
          setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
        }}
      />
    </div>
  );
}

export default App;
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Experience } from './components/Experience';
import { UI } from './components/UI';
import { PhotoData, DisplayMode } from './types';

// Default images for demo purposes (Picsum)
const DEFAULT_IMAGES = Array.from({ length: 40 }).map((_, i) => ({
  id: uuidv4(),
  url: `https://picsum.photos/seed/${i + 100}/400/500`,
  aspectRatio: 0.8
}));

function App() {
  const [photos, setPhotos] = useState<PhotoData[]>(DEFAULT_IMAGES);
  const [mode, setMode] = useState<DisplayMode>('TREE');
  
  // Shared ref for rotation velocity from hand tracking
  // Values: 0 = no input, positive = right, negative = left
  const rotationInputRef = useRef<number>(0);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;

    const newPhotos: PhotoData[] = [];
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      newPhotos.push({
        id: uuidv4(),
        url,
        aspectRatio: 0.8 // Default assumption, actual display handles crop
      });
    });

    if (newPhotos.length > 0) {
      setPhotos((prev) => {
          // If we are still on defaults, replace entirely
          if (prev.length === DEFAULT_IMAGES.length && prev[0].url.includes('picsum')) {
              return newPhotos;
          }
          return [...prev, ...newPhotos];
      });
    }
  };

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      photos.forEach(p => {
        if (p.url.startsWith('blob:')) {
            URL.revokeObjectURL(p.url);
        }
      });
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-black">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Experience 
            photos={photos} 
            mode={mode} 
            rotationInputRef={rotationInputRef}
        />
      </div>

      {/* UI Overlay Layer */}
      <UI 
        mode={mode} 
        setMode={setMode} 
        onUpload={handleUpload}
        photoCount={photos.length}
        rotationInputRef={rotationInputRef}
      />
    </div>
  );
}

export default App;
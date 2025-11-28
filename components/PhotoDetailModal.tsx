import React, { useState, useEffect } from 'react';
import { PhotoData } from '../types';
import { updatePhotoCaption } from '../utils/db';

interface PhotoDetailModalProps {
  photo: PhotoData | null;
  onClose: () => void;
  onUpdate: (photo: PhotoData) => void;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ photo, onClose, onUpdate }) => {
  const [caption, setCaption] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || '');
      setIsEditing(false);
    }
  }, [photo]);

  const handleSave = async () => {
    if (!photo) return;
    
    const success = await updatePhotoCaption(photo.id, caption);
    if (success) {
      onUpdate({ ...photo, caption });
      setIsEditing(false);
    }
  };

  if (!photo) return null;

  // Calculate polaroid dimensions - exactly match 3D scene style
  // 3D scene: white frame (#fdfdfd), photo centered, gray bottom area (#e5e5e5) for text
  // Ratio: 1.2:1.5 (width:height), photo at [0, 0.15], bottom gray at [0, -0.6] with size [1.1, 0.15]
  const photoAspectRatio = photo.aspectRatio || 0.8;
  const margin = 40; // margin on all sides
  const maxWidth = window.innerWidth - margin * 2;
  const maxHeight = window.innerHeight - margin * 2;
  
  // Polaroid aspect ratio: 1.2:1.5 = 0.8
  // Calculate based on polaroid ratio, not photo ratio
  let polaroidWidth = Math.min(maxWidth * 0.9, 600);
  let polaroidHeight = polaroidWidth / 0.8; // 1.2:1.5 ratio
  
  // If too tall, adjust
  if (polaroidHeight > maxHeight) {
    polaroidHeight = maxHeight;
    polaroidWidth = polaroidHeight * 0.8;
  }
  
  // Photo dimensions: in 3D scene, photo scale is [1, 1] within 1.2x1.5 frame
  // Photo is positioned at [0, 0.15], so it takes most of the frame height
  // Bottom gray area is at [0, -0.6] with height 0.15
  const photoWidth = polaroidWidth * 0.9; // approximate photo width within frame
  const photoHeight = photoWidth / photoAspectRatio;
  const captionHeight = polaroidHeight * 0.1; // bottom gray area height

  const handleBackgroundClick = async () => {
    // Save if editing before closing
    if (isEditing && photo) {
      await handleSave();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" 
      onClick={handleBackgroundClick}
    >
      {/* Polaroid-style container - exactly match 3D scene: white frame (#fdfdfd) */}
      <div 
        className="relative shadow-2xl"
        style={{ 
          width: `${polaroidWidth}px`,
          height: `${polaroidHeight}px`,
          backgroundColor: '#fdfdfd', // white frame like 3D scene
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - subtle */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full text-white text-xl flex items-center justify-center transition-colors z-10"
          style={{ fontSize: '20px', lineHeight: '1' }}
        >
          ×
        </button>

        {/* Photo - centered, matching 3D scene position [0, 0.15] */}
        <div 
          className="w-full flex-shrink-0"
          style={{ 
            height: `${photoHeight}px`,
            overflow: 'hidden',
            marginTop: `${polaroidHeight * 0.1}px` // approximate [0, 0.15] offset
          }}
        >
          <img 
            src={photo.url} 
            alt="Photo" 
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Caption area - bottom gray section (#e5e5e5), transparent text, white handwriting */}
        <div 
          className="flex items-center justify-center px-4 flex-shrink-0"
          style={{ 
            height: `${captionHeight}px`,
            backgroundColor: '#e5e5e5', // gray bottom area like 3D scene
            width: '100%'
          }}
        >
          {isEditing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border-none outline-none resize-none text-white handwriting"
              style={{ 
                fontFamily: "'Caveat', cursive",
                backgroundColor: 'transparent', // transparent background
                minHeight: '40px',
                lineHeight: '1.4',
                color: '#ffffff',
                fontSize: '20px'
              }}
              placeholder="Write your memory..."
              autoFocus
              rows={2}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSave();
                }
              }}
            />
          ) : (
            <div 
              className="w-full text-center cursor-text handwriting text-white"
              style={{ 
                fontFamily: "'Caveat', cursive",
                fontSize: '20px',
                minHeight: '40px',
                lineHeight: '1.4',
                color: '#ffffff',
                backgroundColor: 'transparent' // transparent background
              }}
              onClick={() => setIsEditing(true)}
            >
              {caption || <span className="text-white/60 italic">Tap to write...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


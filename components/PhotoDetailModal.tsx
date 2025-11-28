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

  // Calculate polaroid dimensions so that the enlarged view matches the flat card mockup
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
  const photoAspectRatio = photo.aspectRatio || 0.8;
  const margin = 48;
  const framePadding = 28;
  const noteHeight = 160;
  const maxWidth = viewportWidth - margin * 2;
  const maxHeight = viewportHeight - margin * 2;

  let photoWidth = Math.min(maxWidth, 640) - framePadding * 2;
  let photoHeight = photoWidth / photoAspectRatio;

  // If height is constrained, resize to keep the entire polaroid visible
  if (photoHeight + noteHeight + framePadding * 2 > maxHeight) {
    photoHeight = Math.max(220, maxHeight - noteHeight - framePadding * 2);
    photoWidth = photoHeight * photoAspectRatio;
  }

  const polaroidWidth = photoWidth + framePadding * 2;

  const handleBackgroundClick = async () => {
    // Save if editing before closing
    if (isEditing && photo) {
      await handleSave();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" 
      onClick={handleBackgroundClick}
    >
      <div 
        className="relative"
        style={{ width: `${polaroidWidth}px`, maxWidth: '95vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-black/70 hover:bg-black/80 rounded-full text-white text-2xl flex items-center justify-center transition-colors shadow-lg"
          style={{ lineHeight: '1' }}
        >
          ×
        </button>

        <div 
          className="w-full rounded-[22px] shadow-[0_40px_120px_rgba(0,0,0,0.65)] flex flex-col"
          style={{
            background: '#bfbfbf',
            padding: `${framePadding}px ${framePadding + 4}px ${framePadding}px`,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {/* Photo slab */}
          <div 
            className="rounded-[14px] overflow-hidden bg-[#ebebeb] shadow-[0_25px_60px_rgba(0,0,0,0.4)]"
            style={{ height: `${photoHeight}px` }}
          >
            <img 
              src={photo.url} 
              alt="Photo" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Writable note area */}
          <div 
            className="mt-10 rounded-[12px] border border-white/30 px-4 py-3 flex items-center justify-center bg-[#cfcfcf]"
            style={{ height: `${noteHeight}px` }}
          >
            {isEditing ? (
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none resize-none text-white text-center handwriting"
                style={{ 
                  fontFamily: "'Caveat', cursive",
                  fontSize: '32px',
                  lineHeight: '1.4'
                }}
                placeholder="Write your memory..."
                autoFocus
                onBlur={handleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSave();
                  }
                }}
              />
            ) : (
              <div 
                className="w-full h-full text-center cursor-text handwriting flex items-center justify-center text-white px-4"
                style={{ 
                  fontFamily: "'Caveat', cursive",
                  fontSize: '32px',
                  lineHeight: '1.4'
                }}
                onClick={() => setIsEditing(true)}
              >
                {caption || <span className="text-white/60 italic">Tap to write...</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Calculate polaroid dimensions based on photo aspect ratio
  // Adapt to screen with margins on all sides
  const photoAspectRatio = photo.aspectRatio || 0.8;
  const margin = 40; // margin on all sides
  const maxWidth = window.innerWidth - margin * 2;
  const maxHeight = window.innerHeight - margin * 2;
  
  // Calculate dimensions to fit screen
  let photoWidth = Math.min(maxWidth * 0.9, 600);
  let photoHeight = photoWidth / photoAspectRatio;
  
  // If too tall, adjust width
  const captionHeight = 80;
  if (photoHeight + captionHeight > maxHeight) {
    photoHeight = maxHeight - captionHeight;
    photoWidth = photoHeight * photoAspectRatio;
  }
  
  const polaroidHeight = photoHeight + captionHeight;
  const polaroidWidth = photoWidth;

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
      {/* Polaroid-style container - gray background like small images */}
      <div 
        className="relative bg-gray-200 shadow-2xl"
        style={{ 
          width: `${polaroidWidth}px`,
          height: `${polaroidHeight}px`,
          padding: '0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - subtle */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-black/60 hover:bg-black/80 rounded-full text-white text-xl flex items-center justify-center transition-colors"
          style={{ fontSize: '20px', lineHeight: '1' }}
        >
          ×
        </button>

        {/* Photo */}
        <div className="w-full" style={{ height: `${photoHeight}px`, overflow: 'hidden' }}>
          <img 
            src={photo.url} 
            alt="Photo" 
            className="w-full h-full object-cover"
            style={{ objectFit: 'cover' }}
          />
        </div>

        {/* Caption area - bottom gray section, white handwriting text */}
        <div 
          className="bg-gray-200 flex items-center justify-center px-4"
          style={{ height: `${captionHeight}px` }}
        >
          {isEditing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none text-white handwriting text-lg"
              style={{ 
                fontFamily: "'Caveat', cursive",
                minHeight: '40px',
                lineHeight: '1.4',
                color: '#ffffff'
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
                fontSize: '24px',
                minHeight: '40px',
                lineHeight: '1.4',
                color: '#ffffff'
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


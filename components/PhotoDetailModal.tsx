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
  // Polaroid ratio: ~0.8 (width:height), photo takes ~80% of height, caption area ~20%
  const photoAspectRatio = photo.aspectRatio || 0.8;
  const maxWidth = Math.min(600, window.innerWidth * 0.9);
  const photoWidth = maxWidth * 0.9;
  const photoHeight = photoWidth / photoAspectRatio;
  const captionHeight = 80;
  const polaroidHeight = photoHeight + captionHeight;
  const polaroidWidth = photoWidth + 40; // padding

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
      {/* Polaroid-style container */}
      <div 
        className="relative bg-white shadow-2xl"
        style={{ 
          width: `${polaroidWidth}px`,
          height: `${polaroidHeight}px`,
          padding: '20px 20px 0 20px'
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

        {/* Caption area - bottom gray section, always editable */}
        <div 
          className="bg-gray-200 flex items-center justify-center px-4"
          style={{ height: `${captionHeight}px` }}
        >
          {isEditing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-800 handwriting text-lg"
              style={{ 
                fontFamily: "'Caveat', cursive",
                minHeight: '40px',
                lineHeight: '1.4'
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
              className="w-full text-center cursor-text handwriting text-gray-800"
              style={{ 
                fontFamily: "'Caveat', cursive",
                fontSize: '24px',
                minHeight: '40px',
                lineHeight: '1.4'
              }}
              onClick={() => setIsEditing(true)}
            >
              {caption || <span className="text-gray-400 italic">Tap to write...</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


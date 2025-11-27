import React, { useState, useEffect, useRef } from 'react';
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
  const [useVoice, setUseVoice] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || '');
      setIsEditing(false);
      setUseVoice(false);
    }
  }, [photo]);

  useEffect(() => {
    // Cleanup speech recognition on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSave = async () => {
    if (!photo) return;
    
    const success = await updatePhotoCaption(photo.id, caption);
    if (success) {
      onUpdate({ ...photo, caption });
      setIsEditing(false);
    }
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCaption(prev => prev + (prev ? ' ' : '') + transcript);
      setUseVoice(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setUseVoice(false);
    };

    recognition.onend = () => {
      setUseVoice(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setUseVoice(true);
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setUseVoice(false);
    }
  };

  if (!photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-[#010b07] border border-emerald-500/30 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-300 text-2xl w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        {/* Photo */}
        <div className="mb-4">
          <img src={photo.url} alt="Photo" className="w-full h-auto rounded" />
        </div>

        {/* Caption section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm text-emerald-400 uppercase tracking-widest">Caption</label>
            <div className="flex gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 border border-emerald-500/30 rounded"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-black/50 border border-emerald-500/30 rounded p-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                rows={3}
                placeholder="Type your caption here or use voice recognition..."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={useVoice ? stopVoiceRecognition : startVoiceRecognition}
                  className={`px-3 py-1 text-xs border rounded ${
                    useVoice 
                      ? 'bg-red-500/20 text-red-400 border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  } hover:opacity-80`}
                >
                  {useVoice ? 'Stop Voice' : 'Voice'}
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded hover:bg-emerald-500/30"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setUseVoice(false);
                    setCaption(photo.caption || '');
                  }}
                  className="px-4 py-2 bg-black/50 text-white border border-gray-500/30 rounded hover:bg-black/70"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-black/50 border border-emerald-500/30 rounded p-3 min-h-[3rem]">
              {caption ? (
                <p className="text-white text-sm">{caption}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">No caption yet. Click Edit to add one.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


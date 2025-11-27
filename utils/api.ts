import { PhotoData } from '../types';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3000';

/**
 * 初始化数据库表
 */
export const initDB = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/api/photos/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to init DB:', error);
    return false;
  }
};

/**
 * 从数据库加载所有照片
 */
export const loadPhotos = async (): Promise<PhotoData[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/photos`);
    if (!response.ok) {
      throw new Error('Failed to load photos');
    }
    const photos = await response.json();
    return photos;
  } catch (error) {
    console.error('Failed to load photos:', error);
    return [];
  }
};

/**
 * 处理图片文件并转换为 Base64
 */
const processImageFile = (file: File): Promise<{ base64: string, aspectRatio: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const MAX_SIZE = 800;
      let width = img.width;
      let height = img.height;
      const aspectRatio = width / height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      
      URL.revokeObjectURL(url);
      resolve({ base64, aspectRatio });
    };
    
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * 保存新照片到数据库
 */
export const savePhoto = async (file: File): Promise<PhotoData | null> => {
  try {
    const { base64, aspectRatio } = await processImageFile(file);
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    
    const response = await fetch(`${API_BASE}/api/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, url: base64, aspectRatio }),
    });

    if (!response.ok) {
      throw new Error('Failed to save photo');
    }

    const photo = await response.json();
    return photo;
  } catch (error) {
    console.error('Failed to save photo:', error);
    return null;
  }
};


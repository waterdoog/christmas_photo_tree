import { neon } from '@neondatabase/serverless';
import { v4 as uuidv4 } from 'uuid';
import { PhotoData } from '../types';

// Get database URL from environment variable, fallback to hardcoded for development
// Note: In Vite, only VITE_* env vars are exposed to client code
let DATABASE_URL = (import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL || 'postgresql://neondb_owner:npg_Ze0yU8GdlCxb@ep-long-heart-ab9b1fqo-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require') as string;

// Clean up the URL if it has unwanted prefixes/suffixes (e.g., from Vercel copy-paste)
// Remove common prefixes like "psql", "psql_", etc.
DATABASE_URL = DATABASE_URL.replace(/^psql[\s_']*/i, '');
// Remove quotes from start and end
DATABASE_URL = DATABASE_URL.replace(/^['"]+|['"]+$/g, '');
// Remove any leading/trailing whitespace
DATABASE_URL = DATABASE_URL.trim();
// Remove channel_binding parameter as it may cause issues with Neon serverless
if (DATABASE_URL.includes('channel_binding=')) {
  DATABASE_URL = DATABASE_URL.replace(/[&?]channel_binding=[^&]*/g, '');
  // Clean up any double ? or & 
  DATABASE_URL = DATABASE_URL.replace(/\?&/, '?').replace(/&&/g, '&').replace(/&$/, '');
}

// Debug logging - always log in production to help diagnose issues
console.log('🔍 Database URL configured:', DATABASE_URL ? `Yes (length: ${DATABASE_URL.length}, starts with: ${DATABASE_URL.substring(0, 20)}...)` : 'No');
console.log('🔍 Environment variables:', {
  hasVITE_DATABASE_URL: !!import.meta.env.VITE_DATABASE_URL,
  hasDATABASE_URL: !!import.meta.env.DATABASE_URL,
  mode: import.meta.env.MODE
});

// Initialize the HTTP SQL client
const sql = neon(DATABASE_URL);

/**
 * Initializes the database table if it doesn't exist.
 */
export const initDB = async () => {
  try {
    // Add a simple test query first to verify connection
    await sql`SELECT 1 as test`;
    
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        aspect_ratio REAL NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to init DB:', error);
    console.error('Database URL used:', DATABASE_URL ? DATABASE_URL.substring(0, 50) + '...' : 'NOT SET');
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    throw error; // Re-throw to let caller know it failed
  }
};

/**
 * Loads all photos from the database.
 */
export const loadPhotos = async (): Promise<PhotoData[]> => {
  try {
    const rows = await sql`SELECT id, url, aspect_ratio FROM photos ORDER BY created_at DESC`;
    console.log(`✅ Loaded ${rows.length} photos from database`);
    return rows.map(row => ({
      id: row.id,
      url: row.url,
      aspectRatio: row.aspect_ratio
    }));
  } catch (error) {
    console.error('❌ Failed to load photos:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    return [];
  }
};

/**
 * Resizes an image file and returns it as a Base64 string to save DB space.
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
      // Compress to JPEG 0.7 quality to save space
      const base64 = canvas.toDataURL('image/jpeg', 0.7);
      
      URL.revokeObjectURL(url);
      resolve({ base64, aspectRatio });
    };
    
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Saves a new photo to the database.
 */
export const savePhoto = async (file: File): Promise<PhotoData | null> => {
  try {
    const { base64, aspectRatio } = await processImageFile(file);
    const id = uuidv4();
    
    await sql`
      INSERT INTO photos (id, url, aspect_ratio) 
      VALUES (${id}, ${base64}, ${aspectRatio})
    `;
    
    return { id, url: base64, aspectRatio };
  } catch (error) {
    console.error('Failed to save photo:', error);
    return null;
  }
};
import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        aspect_ratio REAL NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    return res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Init error:', error);
    return res.status(500).json({ error: 'Failed to initialize database' });
  }
}


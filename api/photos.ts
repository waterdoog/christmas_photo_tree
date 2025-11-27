import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'Database not configured' });
  }

  try {
    if (req.method === 'GET') {
      // 获取所有照片
      const rows = await sql`
        SELECT id, url, aspect_ratio 
        FROM photos 
        ORDER BY created_at DESC
      `;
      
      const photos = rows.map(row => ({
        id: row.id,
        url: row.url,
        aspectRatio: row.aspect_ratio
      }));
      
      return res.status(200).json(photos);
    }

    if (req.method === 'POST') {
      // 保存新照片
      const { id, url, aspectRatio } = req.body;
      
      if (!id || !url || aspectRatio === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      await sql`
        INSERT INTO photos (id, url, aspect_ratio) 
        VALUES (${id}, ${url}, ${aspectRatio})
      `;
      
      return res.status(201).json({ id, url, aspectRatio });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: 'Database operation failed' });
  }
}


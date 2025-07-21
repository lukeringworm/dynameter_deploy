
import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { category } = req.query;
    if (typeof category !== 'string') {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const news = await storage.getCategoryNews(category);
    res.json(news);
  } catch (error) {
    console.error("Error fetching category news:", error);
    res.status(500).json({ message: "Failed to fetch category news" });
  }
}


import { VercelRequest, VercelResponse } from '@vercel/node';
import { rssService } from '../server/rssService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const scores = rssService.getCategoryScores();
    res.json(scores);
  } catch (error) {
    console.error("Error fetching category scores:", error);
    res.status(500).json({ message: "Failed to fetch category scores" });
  }
}

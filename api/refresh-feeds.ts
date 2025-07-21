
import { VercelRequest, VercelResponse } from '@vercel/node';
import { rssService } from '../server/rssService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await rssService.fetchAndParseFeeds();
    res.json({ message: "RSS feeds refreshed successfully" });
  } catch (error) {
    console.error("Error refreshing feeds:", error);
    res.status(500).json({ message: "Failed to refresh RSS feeds" });
  }
}

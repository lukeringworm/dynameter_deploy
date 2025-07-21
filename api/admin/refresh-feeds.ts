
import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../../server/adminAuth';
import { rssService } from '../../server/rssService';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check admin authentication
  const authResult = requireAdminAuth(req);
  if (!authResult.isAuthenticated) {
    return res.status(401).json({ message: authResult.message });
  }

  try {
    await rssService.fetchAndParseFeeds();
    res.json({ 
      message: "RSS feeds refreshed successfully",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error refreshing feeds:", error);
    res.status(500).json({ message: "Failed to refresh RSS feeds" });
  }
}

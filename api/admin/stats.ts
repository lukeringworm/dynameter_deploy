
import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../../server/adminAuth';
import { adminStatsTracker } from '../../server/adminStats';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check admin authentication
  const authResult = requireAdminAuth(req);
  if (!authResult.isAuthenticated) {
    return res.status(401).json({ message: authResult.message });
  }

  try {
    const stats = adminStatsTracker.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch statistics" });
  }
}

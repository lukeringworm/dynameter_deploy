
import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../../server/adminAuth';
import { adminStatsTracker } from '../../server/adminStats';

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
    adminStatsTracker.resetStats();
    res.json({ message: "Statistics reset successfully" });
  } catch (error) {
    console.error("Error resetting stats:", error);
    res.status(500).json({ message: "Failed to reset statistics" });
  }
}


import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../../server/adminAuth';
import { milestoneService } from '../../server/milestoneService';

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
    const updated = await milestoneService.checkAndUpdateMilestones();
    res.json({ 
      message: updated ? "All milestones completed! New targets generated." : "Milestones check completed - targets still in progress",
      updated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error checking milestones:", error);
    res.status(500).json({ message: "Failed to check milestones" });
  }
}

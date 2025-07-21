
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
    const updated = await milestoneService.forceUpdateMilestones();
    if (updated) {
      res.json({ 
        message: "Milestones updated successfully with new AI-generated targets",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(400).json({ message: "Failed to generate new milestones" });
    }
  } catch (error) {
    console.error("Error updating milestones:", error);
    res.status(500).json({ 
      message: error instanceof Error ? error.message : "Failed to update milestones"
    });
  }
}

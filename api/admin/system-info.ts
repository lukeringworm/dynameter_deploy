
import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdminAuth } from '../../server/adminAuth';

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
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      hasOpenAIKey: !!process.env.OPENAI_API_KEY
    };
    res.json(systemInfo);
  } catch (error) {
    console.error("Error fetching system info:", error);
    res.status(500).json({ message: "Failed to fetch system information" });
  }
}


import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { categoryKey } = req.query;
    if (typeof categoryKey !== 'string') {
      return res.status(400).json({ message: 'Invalid category key' });
    }

    const categoryDetails = await storage.getCategoryDetails(categoryKey);
    if (!categoryDetails) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(categoryDetails);
  } catch (error) {
    console.error("Error fetching category details:", error);
    res.status(500).json({ message: "Failed to fetch category details" });
  }
}

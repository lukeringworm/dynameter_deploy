
import { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../server/storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const adIndexData = await storage.getADIndexData();
    res.json(adIndexData);
  } catch (error) {
    console.error("Error fetching AD Index data:", error);
    res.status(500).json({ message: "Failed to fetch AD Index data" });
  }
}

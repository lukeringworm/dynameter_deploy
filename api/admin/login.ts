
import { VercelRequest, VercelResponse } from '@vercel/node';
import { authenticateAdmin } from '../../server/adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    const token = authenticateAdmin(password);
    if (!token) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Set HTTP-only cookie
    res.setHeader('Set-Cookie', `adminToken=${token}; HttpOnly; Secure; Max-Age=${24 * 60 * 60}; SameSite=Strict; Path=/`);
    res.json({ message: "Admin authenticated successfully", token });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
}

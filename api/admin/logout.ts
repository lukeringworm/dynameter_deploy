
import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  res.setHeader('Set-Cookie', 'adminToken=; HttpOnly; Secure; Max-Age=0; SameSite=Strict; Path=/');
  res.json({ message: "Logged out successfully" });
}

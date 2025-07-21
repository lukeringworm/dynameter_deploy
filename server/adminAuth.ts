import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

// Simple password-based authentication for admin panel
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'; // Should be set via environment variable
const ADMIN_SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// In-memory session storage (could be moved to database for production)
const adminSessions = new Map<string, { createdAt: number; lastAccessed: number }>();

export function generateAdminToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  adminSessions.set(token, {
    createdAt: now,
    lastAccessed: now
  });
  return token;
}

export function validateAdminToken(token: string): boolean {
  const session = adminSessions.get(token);
  if (!session) return false;

  const now = Date.now();

  // Check if session has expired
  if (now - session.createdAt > ADMIN_SESSION_DURATION) {
    adminSessions.delete(token);
    return false;
  }

  // Update last accessed time
  session.lastAccessed = now;
  return true;
}

export function cleanupExpiredSessions(): void {
  const now = Date.now();
  const tokensToDelete: string[] = [];

  adminSessions.forEach((session, token) => {
    if (now - session.createdAt > ADMIN_SESSION_DURATION) {
      tokensToDelete.push(token);
    }
  });

  tokensToDelete.forEach(token => adminSessions.delete(token));
}

export function authenticateAdmin(password: string): string | null {
  if (password === ADMIN_PASSWORD) {
    return generateAdminToken();
  }
  return null;
}

// Overloaded function for both Express and Vercel
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void;
export function requireAdminAuth(req: VercelRequest): { isAuthenticated: boolean; message?: string };
export function requireAdminAuth(req: Request | VercelRequest, res?: Response, next?: NextFunction): void | { isAuthenticated: boolean; message?: string } {
  // Vercel function mode
  if (!res || !next) {
    const vReq = req as VercelRequest;
    const token = vReq.cookies?.adminToken;

    if (!token) {
      return { isAuthenticated: false, message: 'Admin authentication required' };
    }

    const sessionData = activeSessions.get(token);
    if (!sessionData) {
      return { isAuthenticated: false, message: 'Invalid or expired session' };
    }

    if (Date.now() > sessionData.expiresAt) {
      activeSessions.delete(token);
      return { isAuthenticated: false, message: 'Session expired' };
    }

    return { isAuthenticated: true };
  }

  // Express middleware mode
  const expressReq = req as Request;

  const token = expressReq.headers.authorization?.replace('Bearer ', '') || expressReq.cookies?.adminToken;

  if (!token || !validateAdminToken(token)) {
    res.status(401).json({ message: 'Admin authentication required' });
    return;
  }

  next();
}

// Cleanup expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
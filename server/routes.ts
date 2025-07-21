import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { rssService } from "./rssService";
import { requireAdminAuth, authenticateAdmin } from "./adminAuth";
import { adminStatsTracker } from "./adminStats";
import { milestoneService } from "./milestoneService";
import cookieParser from 'cookie-parser';

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());

  // AD Index API endpoint
  app.get("/api/score", async (req, res) => {
    try {
      const adIndexData = await storage.getADIndexData();
      res.json(adIndexData);
    } catch (error) {
      console.error("Error fetching AD Index data:", error);
      res.status(500).json({ message: "Failed to fetch AD Index data" });
    }
  });

  // Category details endpoint
  app.get("/api/category/:categoryKey", async (req, res) => {
    try {
      const { categoryKey } = req.params;
      const categoryDetails = await storage.getCategoryDetails(categoryKey);
      if (!categoryDetails) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(categoryDetails);
    } catch (error) {
      console.error("Error fetching category details:", error);
      res.status(500).json({ message: "Failed to fetch category details" });
    }
  });

  // News API endpoint - returns all news articles by category
  app.get("/api/news", async (req, res) => {
    try {
      const news = await storage.getNews();
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });

  // Category news endpoint - returns news for specific category
  app.get("/api/news/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const news = await storage.getCategoryNews(category);
      res.json(news);
    } catch (error) {
      console.error("Error fetching category news:", error);
      res.status(500).json({ message: "Failed to fetch category news" });
    }
  });

  // RSS feed refresh endpoint for manual triggers
  app.post("/api/refresh-feeds", async (req, res) => {
    try {
      await rssService.fetchAndParseFeeds();
      res.json({ message: "RSS feeds refreshed successfully" });
    } catch (error) {
      console.error("Error refreshing feeds:", error);
      res.status(500).json({ message: "Failed to refresh RSS feeds" });
    }
  });

  // Category scores endpoint based on AI-scored articles
  app.get("/api/category-scores", async (req, res) => {
    try {
      const scores = rssService.getCategoryScores();
      res.json(scores);
    } catch (error) {
      console.error("Error fetching category scores:", error);
      res.status(500).json({ message: "Failed to fetch category scores" });
    }
  });

  // Admin authentication endpoints
  app.post("/api/admin/login", async (req, res) => {
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
      res.cookie('adminToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict' as const
      });

      res.json({ message: "Admin authenticated successfully", token });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    res.clearCookie('adminToken');
    res.json({ message: "Logged out successfully" });
  });

  // Admin-only endpoints (protected)
  app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
    try {
      const stats = adminStatsTracker.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  app.post("/api/admin/refresh-feeds", requireAdminAuth, async (req, res) => {
    try {
      // Force refresh RSS feeds
      await rssService.fetchAndParseFeeds();
      res.json({ 
        message: "RSS feeds refreshed successfully",
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error refreshing feeds:", error);
      res.status(500).json({ message: "Failed to refresh RSS feeds" });
    }
  });

  app.post("/api/admin/reset-stats", requireAdminAuth, async (req, res) => {
    try {
      adminStatsTracker.resetStats();
      res.json({ message: "Statistics reset successfully" });
    } catch (error) {
      console.error("Error resetting stats:", error);
      res.status(500).json({ message: "Failed to reset statistics" });
    }
  });

  app.get("/api/admin/system-info", requireAdminAuth, async (req, res) => {
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
  });

  app.post("/api/admin/update-milestones", requireAdminAuth, async (req, res) => {
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
  });

  app.post("/api/admin/check-milestones", requireAdminAuth, async (req, res) => {
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
  });

  const httpServer = createServer(app);
  return httpServer;
}

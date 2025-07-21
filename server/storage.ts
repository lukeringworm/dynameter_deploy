
import { db } from "./db";
import { 
  adIndexScores, 
  categories, 
  milestones, 
  newsArticles, 
  rssFeeds,
  systemStats 
} from "../shared/schema";
import type { 
  ADIndexData, 
  CategoryDetails, 
  NewsResponse, 
  RSSArticle,
  InsertNewsArticle,
  InsertMilestone,
  InsertCategory
} from "../shared/schema";
import { eq, desc, gte, sql } from "drizzle-orm";

class DatabaseStorage {
  async initializeDefaultData(): Promise<void> {
    console.log("Initializing default data...");
    
    // Check if categories exist
    const existingCategories = await db.select().from(categories).limit(1);
    
    if (existingCategories.length === 0) {
      console.log("Creating default categories...");
      
      const defaultCategories: InsertCategory[] = [
        {
          key: "defense",
          name: "Defense Technology",
          score: 72,
          change: 2.3,
          icon: "Shield",
          color: "#dc2626",
          description: "Advanced military systems, cybersecurity, and defense innovation",
          currentStatus: "Strong growth in defense contracts and R&D investments"
        },
        {
          key: "manufacturing",
          name: "Manufacturing Reshoring",
          score: 68,
          change: 1.8,
          icon: "Factory",
          color: "#ea580c",
          description: "Bringing production capabilities back to America",
          currentStatus: "287,000 reshored jobs announced in 2023, cumulatively"
        },
        {
          key: "energy",
          name: "Energy Infrastructure",
          score: 75,
          change: 3.2,
          icon: "Zap",
          color: "#fbbf24",
          description: "Clean energy transition, grid modernization, and energy independence",
          currentStatus: "Record renewable energy capacity additions nationwide"
        },
        {
          key: "workforce",
          name: "Workforce Development",
          score: 64,
          change: -0.5,
          icon: "Users",
          color: "#10b981",
          description: "Skills training, STEM education, and talent pipeline development",
          currentStatus: "Skills gap persists in key manufacturing and tech sectors"
        },
        {
          key: "techPolicy",
          name: "Technology Policy",
          score: 70,
          change: 1.2,
          icon: "Cpu",
          color: "#3b82f6",
          description: "AI governance, semiconductor policy, and technology leadership",
          currentStatus: "CHIPS Act implementation showing early positive results"
        },
        {
          key: "supplyChain",
          name: "Supply Chain Resilience",
          score: 66,
          change: 2.1,
          icon: "Truck",
          color: "#8b5cf6",
          description: "Diversifying supply sources and strengthening critical supply chains",
          currentStatus: "Critical minerals and semiconductor supply chains strengthening"
        }
      ];

      await db.insert(categories).values(defaultCategories);
      
      // Create default milestones for each category
      const defaultMilestones: InsertMilestone[] = [
        {
          milestoneId: "defense-1",
          categoryKey: "defense",
          title: "5th Generation Fighter Readiness",
          target: 400,
          current: 285,
          unit: "aircraft",
          targetDate: "2025-12-31",
          status: "on-track",
          description: "Achieve full operational capability of 400 5th-generation fighter aircraft"
        },
        {
          milestoneId: "manufacturing-1",
          categoryKey: "manufacturing",
          title: "Manufacturing Jobs Reshored",
          target: 500000,
          current: 287000,
          unit: "jobs",
          targetDate: "2025-06-30",
          status: "on-track",
          description: "Total cumulative manufacturing jobs brought back to the US"
        },
        {
          milestoneId: "energy-1",
          categoryKey: "energy",
          title: "Renewable Energy Capacity",
          target: 300,
          current: 185,
          unit: "GW",
          targetDate: "2026-01-01",
          status: "on-track",
          description: "Total installed renewable energy capacity nationwide"
        },
        {
          milestoneId: "workforce-1",
          categoryKey: "workforce",
          title: "STEM Graduates Annual",
          target: 150000,
          current: 120000,
          unit: "graduates",
          targetDate: "2025-05-31",
          status: "at-risk",
          description: "Annual STEM graduates from US universities"
        },
        {
          milestoneId: "techPolicy-1",
          categoryKey: "techPolicy",
          title: "Semiconductor Fab Capacity",
          target: 25,
          current: 12,
          unit: "percent",
          targetDate: "2028-12-31",
          status: "on-track",
          description: "US share of global advanced semiconductor manufacturing"
        },
        {
          milestoneId: "supplyChain-1",
          categoryKey: "supplyChain",
          title: "Critical Mineral Independence",
          target: 50,
          current: 28,
          unit: "percent",
          targetDate: "2027-12-31",
          status: "behind",
          description: "Percentage of critical minerals sourced domestically or from allies"
        }
      ];

      await db.insert(milestones).values(defaultMilestones);
      
      // Create initial AD index score
      const currentDate = new Date();
      const overallScore = 69.2; // Average of category scores
      
      await db.insert(adIndexScores).values({
        overallScore,
        defense: 72,
        manufacturing: 68,
        energy: 75,
        workforce: 64,
        techPolicy: 70,
        supplyChain: 66,
        date: currentDate
      });
      
      console.log("Default data initialized successfully");
    }
  }

  async getADIndexData(): Promise<ADIndexData> {
    await this.initializeDefaultData();
    
    // Get latest scores
    const [latestScore] = await db
      .select()
      .from(adIndexScores)
      .orderBy(desc(adIndexScores.date))
      .limit(1);

    if (!latestScore) {
      throw new Error("No AD Index data found");
    }

    // Get categories with milestones
    const categoryData = await db.select().from(categories);
    const allMilestones = await db.select().from(milestones);
    
    // Build category details
    const categoryDetails: Record<string, CategoryDetails> = {};
    
    for (const cat of categoryData) {
      const categoryMilestones = allMilestones
        .filter(m => m.categoryKey === cat.key)
        .map(m => ({
          id: m.milestoneId,
          title: m.title,
          target: m.target,
          current: m.current,
          unit: m.unit,
          targetDate: m.targetDate,
          status: m.status as "on-track" | "at-risk" | "behind" | "completed",
          description: m.description,
          completed: m.completed
        }));

      categoryDetails[cat.key] = {
        name: cat.name,
        score: cat.score,
        change: cat.change,
        icon: cat.icon,
        color: cat.color,
        description: cat.description,
        currentStatus: cat.currentStatus,
        milestones: categoryMilestones,
        keyMetrics: (cat.keyMetrics as any) || []
      };
    }

    // Get recent news
    const recentNews = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.processed, true))
      .orderBy(desc(newsArticles.createdAt))
      .limit(20);

    const news = recentNews.map(article => ({
      category: article.category,
      title: article.title,
      impact_score: article.impactScore || 0,
      link: article.link,
      description: article.description,
      timestamp: article.createdAt.toISOString()
    }));

    // Get trend data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const trendScores = await db
      .select()
      .from(adIndexScores)
      .where(gte(adIndexScores.date, thirtyDaysAgo))
      .orderBy(adIndexScores.date);

    const trendData = trendScores.map((score, index) => ({
      day: `D${index + 1}`,
      score: score.overallScore,
      date: score.date.toISOString().split('T')[0]
    }));

    return {
      adIndex: latestScore.overallScore,
      categories: {
        defense: latestScore.defense,
        manufacturing: latestScore.manufacturing,
        energy: latestScore.energy,
        workforce: latestScore.workforce,
        techPolicy: latestScore.techPolicy,
        supplyChain: latestScore.supplyChain
      },
      categoryDetails,
      news,
      trendData
    };
  }

  async getCategoryDetails(categoryKey: string): Promise<CategoryDetails | null> {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.key, categoryKey))
      .limit(1);

    if (!category[0]) return null;

    const categoryMilestones = await db
      .select()
      .from(milestones)
      .where(eq(milestones.categoryKey, categoryKey));

    const milestonesFormatted = categoryMilestones.map(m => ({
      id: m.milestoneId,
      title: m.title,
      target: m.target,
      current: m.current,
      unit: m.unit,
      targetDate: m.targetDate,
      status: m.status as "on-track" | "at-risk" | "behind" | "completed",
      description: m.description,
      completed: m.completed
    }));

    return {
      name: category[0].name,
      score: category[0].score,
      change: category[0].change,
      icon: category[0].icon,
      color: category[0].color,
      description: category[0].description,
      currentStatus: category[0].currentStatus,
      milestones: milestonesFormatted,
      keyMetrics: (category[0].keyMetrics as any) || []
    };
  }

  async getNews(): Promise<NewsResponse> {
    const articles = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.processed, true))
      .orderBy(desc(newsArticles.createdAt))
      .limit(100);

    const newsResponse: NewsResponse = {
      defense: [],
      manufacturing: [],
      energy: [],
      workforce: [],
      techPolicy: [],
      supplyChain: []
    };

    articles.forEach(article => {
      const rssArticle: RSSArticle = {
        title: article.title,
        link: article.link,
        pubDate: article.pubDate,
        description: article.description || undefined,
        category: article.category,
        impactScore: article.impactScore || undefined,
        aiSummary: article.aiSummary || undefined,
        processed: article.processed
      };

      if (article.category in newsResponse) {
        (newsResponse as any)[article.category].push(rssArticle);
      }
    });

    return newsResponse;
  }

  async getCategoryNews(category: string): Promise<RSSArticle[]> {
    const articles = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.category, category))
      .orderBy(desc(newsArticles.createdAt))
      .limit(50);

    return articles.map(article => ({
      title: article.title,
      link: article.link,
      pubDate: article.pubDate,
      description: article.description || undefined,
      category: article.category,
      impactScore: article.impactScore || undefined,
      aiSummary: article.aiSummary || undefined,
      processed: article.processed
    }));
  }

  async saveNewsArticle(article: RSSArticle): Promise<void> {
    const insertData: InsertNewsArticle = {
      title: article.title,
      link: article.link,
      pubDate: article.pubDate,
      description: article.description,
      category: article.category,
      impactScore: article.impactScore,
      aiSummary: article.aiSummary,
      processed: article.processed
    };

    await db.insert(newsArticles).values(insertData).onConflictDoNothing();
  }

  async updateArticleScore(link: string, impactScore: number, aiSummary: string): Promise<void> {
    await db
      .update(newsArticles)
      .set({
        impactScore,
        aiSummary,
        processed: true
      })
      .where(eq(newsArticles.link, link));
  }

  async updateCategoryScore(categoryKey: string, score: number, change: number): Promise<void> {
    await db
      .update(categories)
      .set({
        score,
        change,
        updatedAt: new Date()
      })
      .where(eq(categories.key, categoryKey));
  }

  async recordDailyScore(scores: {
    overallScore: number;
    defense: number;
    manufacturing: number;
    energy: number;
    workforce: number;
    techPolicy: number;
    supplyChain: number;
  }): Promise<void> {
    await db.insert(adIndexScores).values({
      ...scores,
      date: new Date()
    });
  }

  async updateMilestone(milestoneId: string, updates: Partial<{
    current: number;
    status: string;
    completed: boolean;
  }>): Promise<void> {
    await db
      .update(milestones)
      .set({
        ...updates,
        updatedAt: new Date()
      })
      .where(eq(milestones.milestoneId, milestoneId));
  }

  async getAllMilestones(): Promise<any[]> {
    return await db.select().from(milestones);
  }

  async replaceMilestones(categoryKey: string, newMilestones: any[]): Promise<void> {
    // Delete existing milestones for this category
    await db.delete(milestones).where(eq(milestones.categoryKey, categoryKey));
    
    // Insert new milestones
    const insertData: InsertMilestone[] = newMilestones.map(m => ({
      milestoneId: m.id,
      categoryKey,
      title: m.title,
      target: m.target,
      current: m.current,
      unit: m.unit,
      targetDate: m.targetDate,
      status: m.status,
      description: m.description,
      completed: m.completed || false
    }));
    
    await db.insert(milestones).values(insertData);
  }
}

export const storage = new DatabaseStorage();

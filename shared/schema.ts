
import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AD Index scores table
export const adIndexScores = pgTable("ad_index_scores", {
  id: serial("id").primaryKey(),
  overallScore: real("overall_score").notNull(),
  defense: real("defense").notNull().default(0),
  manufacturing: real("manufacturing").notNull().default(0),
  energy: real("energy").notNull().default(0),
  workforce: real("workforce").notNull().default(0),
  techPolicy: real("tech_policy").notNull().default(0),
  supplyChain: real("supply_chain").notNull().default(0),
  date: timestamp("date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  score: real("score").notNull().default(0),
  change: real("change").notNull().default(0),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  description: text("description").notNull(),
  currentStatus: text("current_status").notNull(),
  keyMetrics: jsonb("key_metrics").default([]),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Milestones table
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  milestoneId: text("milestone_id").notNull(),
  categoryKey: varchar("category_key", { length: 50 }).notNull(),
  title: text("title").notNull(),
  target: real("target").notNull(),
  current: real("current").notNull().default(0),
  unit: text("unit").notNull(),
  targetDate: text("target_date").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("on-track"),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// News articles table
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  link: text("link").notNull().unique(),
  pubDate: text("pub_date").notNull(),
  description: text("description"),
  category: varchar("category", { length: 50 }).notNull(),
  impactScore: real("impact_score"),
  aiSummary: text("ai_summary"),
  processed: boolean("processed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RSS feeds table
export const rssFeeds = pgTable("rss_feeds", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  category: varchar("category", { length: 50 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastFetched: timestamp("last_fetched"),
  totalArticles: integer("total_articles").notNull().default(0),
  successCount: integer("success_count").notNull().default(0),
  errorCount: integer("error_count").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Admin sessions table
export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// System stats table
export const systemStats = pgTable("system_stats", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles);
export const insertMilestoneSchema = createInsertSchema(milestones);
export const insertCategorySchema = createInsertSchema(categories);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;
export type ADIndexScore = typeof adIndexScores.$inferSelect;
export type InsertADIndexScore = typeof adIndexScores.$inferInsert;

// Legacy schemas for backward compatibility
export const milestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  target: z.number(),
  current: z.number(),
  unit: z.string(),
  targetDate: z.string(),
  status: z.enum(["on-track", "at-risk", "behind", "completed"]),
  description: z.string(),
  completed: z.boolean().optional(),
});

export const categoryDetailsSchema = z.object({
  name: z.string(),
  score: z.number(),
  change: z.number(),
  icon: z.string(),
  color: z.string(),
  description: z.string(),
  currentStatus: z.string(),
  milestones: z.array(milestoneSchema),
  keyMetrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    trend: z.string(),
  })),
});

export type CategoryDetails = z.infer<typeof categoryDetailsSchema>;

export const adIndexSchema = z.object({
  adIndex: z.number(),
  categories: z.object({
    defense: z.number(),
    manufacturing: z.number(),
    energy: z.number(),
    workforce: z.number(),
    techPolicy: z.number(),
    supplyChain: z.number(),
  }),
  categoryDetails: z.record(categoryDetailsSchema).optional(),
  news: z.array(z.object({
    category: z.string(),
    title: z.string(),
    impact_score: z.number(),
    link: z.string(),
    description: z.string().optional(),
    timestamp: z.string().optional(),
  })),
  trendData: z.array(z.object({
    day: z.string(),
    score: z.number(),
    date: z.string(),
  })).optional(),
});

export type ADIndexData = z.infer<typeof adIndexSchema>;

export const rssArticleSchema = z.object({
  title: z.string(),
  link: z.string(),
  pubDate: z.string(),
  description: z.string().optional(),
  category: z.string(),
  impactScore: z.number().optional(),
  aiSummary: z.string().optional(),
  processed: z.boolean().default(false),
});

export type RSSArticle = z.infer<typeof rssArticleSchema>;

export const newsResponseSchema = z.object({
  defense: z.array(rssArticleSchema),
  manufacturing: z.array(rssArticleSchema),
  energy: z.array(rssArticleSchema),
  workforce: z.array(rssArticleSchema),
  techPolicy: z.array(rssArticleSchema),
  supplyChain: z.array(rssArticleSchema),
});

export type NewsResponse = z.infer<typeof newsResponseSchema>;

import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Milestone tracking schema
export const milestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  target: z.number(),
  current: z.number(),
  unit: z.string(),
  targetDate: z.string(),
  status: z.enum(["on-track", "at-risk", "behind", "completed"]),
  description: z.string(),
});

export type Milestone = z.infer<typeof milestoneSchema>;

// Enhanced category schema with milestones
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

// AD Index data schemas
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

export const categorySchema = z.object({
  name: z.string(),
  score: z.number(),
  change: z.number(),
  icon: z.string(),
  color: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

// RSS News Article schema
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

// News API response schema
export const newsResponseSchema = z.object({
  defense: z.array(rssArticleSchema),
  manufacturing: z.array(rssArticleSchema),
  energy: z.array(rssArticleSchema),
  workforce: z.array(rssArticleSchema),
  techPolicy: z.array(rssArticleSchema),
  supplyChain: z.array(rssArticleSchema),
});

export type NewsResponse = z.infer<typeof newsResponseSchema>;

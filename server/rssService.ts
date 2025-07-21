import Parser from 'rss-parser';
import OpenAI from 'openai';
import * as cron from 'node-cron';
import type { RSSArticle, NewsResponse } from '../shared/schema';
import { adminStatsTracker } from './adminStats';
import { milestoneService } from './milestoneService';

// RSS Feed URLs
const RSS_FEEDS = {
  defense: [
    'https://breakingdefense.com/full-rss-feed/?v=2',
    'https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml'
  ],
  manufacturing: [
    'https://www.manufacturingdive.com/feeds/news/'
  ],
  workforce: [
    'https://www.bls.gov/feed/empsit.rss',
    'https://www.laborrelationsupdate.com/feed/'
  ],
  energy: [
    'https://www.energylivenews.com/feed/'
  ],
  techPolicy: [
    'https://thehill.com/policy/technology/feed/'
  ],
  supplyChain: [
    'https://www.supplychaindive.com/feeds/news/'
  ]
};

// In-memory storage for articles
let articlesCache: NewsResponse = {
  defense: [],
  manufacturing: [],
  energy: [],
  workforce: [],
  techPolicy: [],
  supplyChain: []
};

// Track processed articles to avoid duplicates
const processedArticles = new Set<string>();

class RSSService {
  private parser: Parser;
  private openai: OpenAI | null = null;
  private processingQueue: Array<{ article: RSSArticle; category: string }> = [];
  private isProcessing = false;

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'American-Dynamism-Tracker/1.0'
      }
    });

    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not found. AI scoring will be disabled.');
    } else {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  async fetchAndParseFeeds(): Promise<void> {
    console.log('Starting RSS feed fetch...');
    adminStatsTracker.setProcessingState(true, this.processingQueue.length);
    
    for (const [category, urls] of Object.entries(RSS_FEEDS)) {
      for (const url of urls) {
        try {
          adminStatsTracker.recordFeedAttempt(url, category);
          await this.fetchFeed(url, category as keyof NewsResponse);
        } catch (error) {
          console.error(`Error fetching feed ${url}:`, error);
          adminStatsTracker.recordFeedError(url, error instanceof Error ? error.message : 'Unknown error');
        }
      }
    }

    // Process articles through AI scoring
    await this.processArticleQueue();
    adminStatsTracker.setProcessingState(false, 0);

    // Check if all milestones are completed and update if needed
    try {
      const updated = await milestoneService.checkAndUpdateMilestones();
      if (updated) {
        console.log('✅ Milestones automatically updated - all targets achieved!');
      }
    } catch (error) {
      console.error('Error checking milestones:', error);
    }
  }

  private async fetchFeed(url: string, category: keyof NewsResponse): Promise<void> {
    try {
      console.log(`Fetching ${category} feed: ${url}`);
      const feed = await this.parser.parseURL(url);
      
      if (!feed.items) {
        console.warn(`No items found in feed: ${url}`);
        return;
      }

      const newArticles: RSSArticle[] = [];

      for (const item of feed.items.slice(0, 10)) { // Limit to 10 most recent
        if (!item.link || processedArticles.has(item.link)) {
          continue; // Skip if no link or already processed
        }

        const article: RSSArticle = {
          title: item.title || 'Untitled',
          link: item.link,
          pubDate: item.pubDate || new Date().toISOString(),
          description: item.contentSnippet || item.content || '',
          category,
          processed: false
        };

        newArticles.push(article);
        processedArticles.add(item.link);
        
        // Add to processing queue for AI scoring
        this.processingQueue.push({ article, category });
      }

      // Add to cache
      articlesCache[category] = [
        ...newArticles,
        ...articlesCache[category]
      ].slice(0, 20); // Keep only 20 most recent per category

      console.log(`Added ${newArticles.length} new articles for ${category}`);
      adminStatsTracker.recordFeedSuccess(url, newArticles.length);
      adminStatsTracker.recordArticleFetched(newArticles.length);
    } catch (error) {
      console.error(`Failed to fetch feed ${url}:`, error);
      adminStatsTracker.recordFeedError(url, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async processArticleQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    console.log(`Processing ${this.processingQueue.length} articles for AI scoring...`);
    adminStatsTracker.setProcessingState(true, this.processingQueue.length);

    while (this.processingQueue.length > 0) {
      const { article, category } = this.processingQueue.shift()!;
      
      try {
        await this.scoreArticle(article, category);
        adminStatsTracker.recordArticleProcessed();
        // 1-second delay between API calls to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error scoring article: ${article.title}`, error);
        adminStatsTracker.recordScoringFailure();
      }
      
      adminStatsTracker.setProcessingState(true, this.processingQueue.length);
    }

    this.isProcessing = false;
    adminStatsTracker.setProcessingState(false, 0);
    console.log('Finished processing article queue');
  }

  private async scoreArticle(article: RSSArticle, category: string): Promise<void> {
    if (!this.openai) {
      return;
    }

    const categoryDisplayName = {
      defense: 'Defense Technology',
      manufacturing: 'Manufacturing Reshoring',
      workforce: 'Workforce Development',
      energy: 'Energy Infrastructure',
      techPolicy: 'Technology Policy',
      supplyChain: 'Supply Chain Resilience'
    }[category] || category;

    const prompt = `You are an analyst scoring news for American Dynamism.
Analyze the article below and provide:
1. A numerical impact score from -5 (very negative) to +5 (very positive) reflecting its impact on ${categoryDisplayName}. Be nuanced:
   - Small operational updates or minor industry news: +1 to -1
   - Moderate developments with limited scope: +2 to -2  
   - Significant policy changes or major contracts: +3 to -3
   - Transformative developments with national impact: +4 to -4
   - Game-changing events with generational implications: +5 to -5
   - Use 0 for truly neutral news with no clear impact
2. A concise one-sentence summary of the article.

Title: ${article.title}
Summary: ${article.description || 'No summary available'}

Respond only with valid JSON in this format:
{
  "impact_score": 1,
  "summary": "Minor operational update on F-35 maintenance hosting interests."
}`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.3
      });

      const responseText = response.choices[0]?.message?.content;
      if (!responseText) {
        throw new Error('No response from OpenAI');
      }

      const aiResult = JSON.parse(responseText);
      
      // Update article with AI scoring
      article.impactScore = Math.max(-5, Math.min(5, aiResult.impact_score || 0));
      article.aiSummary = aiResult.summary || article.description;
      article.processed = true;

      console.log(`Scored article: ${article.title} (${article.impactScore})`);
      adminStatsTracker.recordScoringSuccess('ai');
    } catch (error) {
      console.error(`Failed to score article: ${article.title}`, error);
      
      // Check if it's a quota error
      if (error instanceof Error && error.message.includes('quota')) {
        adminStatsTracker.recordOpenAIQuotaExceeded();
      }
      
      // Set default values if AI scoring fails
      article.impactScore = this.generateBasicScore(article, category);
      article.aiSummary = article.description || article.title;
      article.processed = true;
      adminStatsTracker.recordScoringSuccess('keyword');
    }
  }

  // Get all cached articles
  getArticles(): NewsResponse {
    return articlesCache;
  }

  // Get articles for a specific category
  getCategoryArticles(category: keyof NewsResponse): RSSArticle[] {
    return articlesCache[category] || [];
  }

  // Calculate category scores based on recent articles
  getCategoryScores(): Record<string, number> {
    const scores: Record<string, number> = {};
    
    for (const [category, articles] of Object.entries(articlesCache)) {
      const recentArticles = articles
        .filter(a => a.processed && a.impactScore !== undefined)
        .slice(0, 10); // Last 10 articles
      
      if (recentArticles.length === 0) {
        scores[category] = 0;
        continue;
      }

      const totalScore = recentArticles.reduce((sum, article) => 
        sum + (article.impactScore || 0), 0);
      
      // Convert to 0-100 scale (where 0 impact = 50, +5 = 100, -5 = 0)
      const avgScore = totalScore / recentArticles.length;
      scores[category] = Math.max(0, Math.min(100, 50 + (avgScore * 10)));
    }
    
    return scores;
  }

  // Generate basic impact score based on keywords when AI scoring is unavailable
  private generateBasicScore(article: RSSArticle, category: string): number {
    const title = article.title.toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = `${title} ${description}`;

    // Define positive and negative keywords by category
    const keywords = {
      defense: {
        positive: ['contract', 'investment', 'innovation', 'breakthrough', 'success', 'award', 'modernization', 'capability'],
        negative: ['delay', 'budget cut', 'failure', 'setback', 'scandal', 'violation', 'loss']
      },
      manufacturing: {
        positive: ['reshoring', 'factory', 'production', 'jobs', 'investment', 'expansion', 'growth', 'domestic'],
        negative: ['layoffs', 'closure', 'offshoring', 'decline', 'shortage', 'disruption']
      },
      energy: {
        positive: ['renewable', 'clean', 'efficiency', 'breakthrough', 'investment', 'capacity', 'grid'],
        negative: ['outage', 'shortage', 'price spike', 'emissions', 'accident', 'delay']
      },
      workforce: {
        positive: ['training', 'skills', 'employment', 'wages', 'certification', 'education', 'hiring'],
        negative: ['unemployment', 'layoffs', 'shortage', 'decline', 'automation', 'displacement']
      },
      techPolicy: {
        positive: ['innovation', 'funding', 'breakthrough', 'leadership', 'competitiveness', 'research'],
        negative: ['regulation', 'restriction', 'ban', 'lag', 'dependence', 'vulnerability']
      },
      supplyChain: {
        positive: ['resilience', 'domestic', 'diversification', 'investment', 'capacity', 'security'],
        negative: ['disruption', 'shortage', 'delay', 'bottleneck', 'dependency', 'vulnerability']
      }
    };

    const categoryKeywords = keywords[category as keyof typeof keywords];
    if (!categoryKeywords) return 0;

    let score = 0;
    
    // Check for positive keywords
    categoryKeywords.positive.forEach(keyword => {
      if (content.includes(keyword)) score += 1;
    });

    // Check for negative keywords
    categoryKeywords.negative.forEach(keyword => {
      if (content.includes(keyword)) score -= 1;
    });

    // Normalize to -5 to +5 range
    return Math.max(-5, Math.min(5, Math.round(score)));
  }

  // Start the cron job for fetching feeds every 15 minutes
  startScheduler(): void {
    console.log('Starting RSS scheduler (every 15 minutes)...');
    
    // Run immediately on startup
    this.fetchAndParseFeeds();
    
    // Schedule to run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      console.log('Running scheduled RSS fetch...');
      this.fetchAndParseFeeds();
    });
  }
}

// Export singleton instance
export const rssService = new RSSService();
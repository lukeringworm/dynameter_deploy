// Admin statistics tracking for RSS processing

interface AdminStats {
  rssFeeds: {
    totalFeeds: number;
    successfulFeeds: number;
    failedFeeds: number;
    lastFetchTime?: string;
    feedStats: Record<string, {
      url: string;
      category: string;
      lastSuccess?: string;
      lastError?: string;
      totalArticles: number;
      successCount: number;
      errorCount: number;
    }>;
  };
  articles: {
    totalFetched: number;
    totalProcessed: number;
    successfullyScored: number;
    failedScoring: number;
    aiScoredCount: number;
    keywordScoredCount: number;
  };
  processing: {
    isCurrentlyProcessing: boolean;
    queueLength: number;
    lastProcessingTime?: string;
    averageProcessingTime?: number;
  };
  system: {
    uptime: number;
    openaiQuotaExceeded: boolean;
    memoryUsage?: NodeJS.MemoryUsage;
  };
}

class AdminStatsTracker {
  private stats: AdminStats;
  private processingStartTime?: number;
  private processingTimes: number[] = [];

  constructor() {
    this.stats = {
      rssFeeds: {
        totalFeeds: 0,
        successfulFeeds: 0,
        failedFeeds: 0,
        feedStats: {}
      },
      articles: {
        totalFetched: 0,
        totalProcessed: 0,
        successfullyScored: 0,
        failedScoring: 0,
        aiScoredCount: 0,
        keywordScoredCount: 0
      },
      processing: {
        isCurrentlyProcessing: false,
        queueLength: 0
      },
      system: {
        uptime: Date.now(),
        openaiQuotaExceeded: false
      }
    };
  }

  // RSS Feed tracking methods
  recordFeedAttempt(url: string, category: string): void {
    if (!this.stats.rssFeeds.feedStats[url]) {
      this.stats.rssFeeds.feedStats[url] = {
        url,
        category,
        totalArticles: 0,
        successCount: 0,
        errorCount: 0
      };
      this.stats.rssFeeds.totalFeeds++;
    }
  }

  recordFeedSuccess(url: string, articleCount: number): void {
    const feedStat = this.stats.rssFeeds.feedStats[url];
    if (feedStat) {
      feedStat.lastSuccess = new Date().toISOString();
      feedStat.totalArticles += articleCount;
      feedStat.successCount++;
      this.stats.rssFeeds.successfulFeeds++;
      this.stats.rssFeeds.lastFetchTime = new Date().toISOString();
    }
  }

  recordFeedError(url: string, error: string): void {
    const feedStat = this.stats.rssFeeds.feedStats[url];
    if (feedStat) {
      feedStat.lastError = error;
      feedStat.errorCount++;
      this.stats.rssFeeds.failedFeeds++;
    }
  }

  // Article processing tracking methods
  recordArticleFetched(count: number = 1): void {
    this.stats.articles.totalFetched += count;
  }

  recordArticleProcessed(): void {
    this.stats.articles.totalProcessed++;
  }

  recordScoringSuccess(method: 'ai' | 'keyword'): void {
    this.stats.articles.successfullyScored++;
    if (method === 'ai') {
      this.stats.articles.aiScoredCount++;
    } else {
      this.stats.articles.keywordScoredCount++;
    }
  }

  recordScoringFailure(): void {
    this.stats.articles.failedScoring++;
  }

  recordOpenAIQuotaExceeded(): void {
    this.stats.system.openaiQuotaExceeded = true;
  }

  // Processing state tracking
  setProcessingState(isProcessing: boolean, queueLength: number = 0): void {
    this.stats.processing.isCurrentlyProcessing = isProcessing;
    this.stats.processing.queueLength = queueLength;

    if (isProcessing) {
      this.processingStartTime = Date.now();
    } else if (this.processingStartTime) {
      const duration = Date.now() - this.processingStartTime;
      this.processingTimes.push(duration);
      
      // Keep only last 10 processing times for average calculation
      if (this.processingTimes.length > 10) {
        this.processingTimes.shift();
      }
      
      this.stats.processing.averageProcessingTime = 
        this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length;
      this.stats.processing.lastProcessingTime = new Date().toISOString();
    }
  }

  // Get current statistics
  getStats(): AdminStats {
    return {
      ...this.stats,
      system: {
        ...this.stats.system,
        uptime: Date.now() - this.stats.system.uptime,
        memoryUsage: process.memoryUsage()
      }
    };
  }

  // Reset statistics
  resetStats(): void {
    const currentUptime = this.stats.system.uptime;
    this.stats = {
      rssFeeds: {
        totalFeeds: 0,
        successfulFeeds: 0,
        failedFeeds: 0,
        feedStats: {}
      },
      articles: {
        totalFetched: 0,
        totalProcessed: 0,
        successfullyScored: 0,
        failedScoring: 0,
        aiScoredCount: 0,
        keywordScoredCount: 0
      },
      processing: {
        isCurrentlyProcessing: false,
        queueLength: 0
      },
      system: {
        uptime: currentUptime,
        openaiQuotaExceeded: false
      }
    };
    this.processingTimes = [];
  }
}

export const adminStatsTracker = new AdminStatsTracker();
export type { AdminStats };
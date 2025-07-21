import { useQuery } from "@tanstack/react-query";
import { ExternalLink, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import type { NewsResponse } from "@shared/schema";

interface NewsSectionProps {
  categoryFilter?: string;
  maxItems?: number;
}

export function NewsSection({ categoryFilter, maxItems = 5 }: NewsSectionProps) {
  const { data: newsData, isLoading, refetch } = useQuery<NewsResponse>({
    queryKey: ["/api/news"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary dark:text-white">Real-Time News Impact</h3>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!newsData) {
    return (
      <section className="mb-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-secondary dark:text-white">Real-Time News Impact</h3>
            <button
              onClick={handleRefresh}
              className="p-2 text-neutral dark:text-slate-300 hover:text-primary transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-neutral dark:text-slate-300">No news data available. RSS feeds are being processed...</p>
        </div>
      </section>
    );
  }

  // Combine and filter news articles
  const allArticles = Object.entries(newsData)
    .flatMap(([category, articles]) => 
      articles
        .filter(article => !categoryFilter || category === categoryFilter)
        .filter(article => article.processed && article.impactScore !== undefined)
        .map(article => ({ ...article, category }))
    )
    .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
    .slice(0, maxItems);

  const getImpactIcon = (score: number) => {
    if (score > 0) return <TrendingUp className="w-4 h-4 text-success" />;
    if (score < 0) return <TrendingDown className="w-4 h-4 text-danger" />;
    return <Minus className="w-4 h-4 text-neutral dark:text-slate-400" />;
  };

  const getImpactColor = (score: number) => {
    if (score > 2) return "text-green-600 dark:text-green-400";
    if (score > 0) return "text-green-500 dark:text-green-400";
    if (score < -2) return "text-red-600 dark:text-red-400";
    if (score < 0) return "text-red-500 dark:text-red-400";
    return "text-neutral dark:text-slate-400";
  };

  const categoryDisplayNames = {
    defense: "Defense",
    manufacturing: "Manufacturing",
    energy: "Energy",
    workforce: "Workforce",
    techPolicy: "Tech Policy",
    supplyChain: "Supply Chain"
  };

  return (
    <section className="mb-12">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-secondary dark:text-white">
            {categoryFilter ? `${categoryDisplayNames[categoryFilter as keyof typeof categoryDisplayNames]} News` : "Real-Time News Impact"}
          </h3>
          <button
            onClick={handleRefresh}
            className="p-2 text-neutral dark:text-slate-300 hover:text-primary transition-colors"
            title="Refresh news"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {allArticles.length === 0 ? (
          <p className="text-neutral dark:text-slate-300">
            {categoryFilter 
              ? "No recent news for this category. RSS feeds are being processed..." 
              : "No news articles available yet. RSS feeds are being processed..."}
          </p>
        ) : (
          <div className="space-y-4">
            {allArticles.map((article, index) => (
              <div key={article.link} className="border-b border-slate-200 dark:border-slate-600 pb-4 last:border-b-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded">
                        {categoryDisplayNames[article.category as keyof typeof categoryDisplayNames]}
                      </span>
                      <div className="flex items-center gap-1">
                        {getImpactIcon(article.impactScore || 0)}
                        <span className={`text-sm font-medium ${getImpactColor(article.impactScore || 0)}`}>
                          {(article.impactScore || 0) > 0 ? '+' : ''}{article.impactScore || 0}
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-secondary dark:text-white font-medium mb-2 line-clamp-2">
                      {article.title}
                    </h4>
                    
                    <p className="text-sm text-neutral dark:text-slate-300 mb-2 line-clamp-2">
                      {article.aiSummary || article.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral dark:text-slate-400">
                        {new Date(article.pubDate).toLocaleDateString()}
                      </span>
                      <a
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
                      >
                        Read more <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
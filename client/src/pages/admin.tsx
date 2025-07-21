import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  RefreshCw, 
  Shield, 
  Activity, 
  Server, 
  Database, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  LogOut,
  Eye,
  EyeOff,
  Target
} from "lucide-react";

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

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
  environment: string;
  hasOpenAIKey: boolean;
}

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if already authenticated on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await apiRequest("/api/admin/stats");
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      await apiRequest("/api/admin/login", {
        method: "POST",
        body: { password }
      });

      setIsAuthenticated(true);
      setPassword("");
      toast({
        title: "Success",
        description: "Admin authentication successful",
      });
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Invalid password",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiRequest("/api/admin/logout", { method: "POST" });
      setIsAuthenticated(false);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "Admin session ended",
      });
    } catch (error) {
      // Logout locally even if API fails
      setIsAuthenticated(false);
      queryClient.clear();
    }
  };

  // Queries for admin data (only when authenticated)
  const { data: stats, refetch: refetchStats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: systemInfo } = useQuery<SystemInfo>({
    queryKey: ["/api/admin/system-info"],
    enabled: isAuthenticated,
  });

  // Mutations for admin actions
  const refreshFeedsMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/refresh-feeds", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "RSS feeds refreshed successfully",
      });
      refetchStats();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to refresh RSS feeds",
        variant: "destructive",
      });
    },
  });

  const resetStatsMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/reset-stats", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Statistics reset successfully",
      });
      refetchStats();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset statistics",
        variant: "destructive",
      });
    },
  });

  const updateMilestonesMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/update-milestones", { method: "POST" }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "New AI-generated milestones created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update milestones",
        variant: "destructive",
      });
    },
  });

  const checkMilestonesMutation = useMutation({
    mutationFn: () => apiRequest("/api/admin/check-milestones", { method: "POST" }),
    onSuccess: (data: any) => {
      toast({
        title: data.updated ? "Milestones Updated!" : "Check Complete",
        description: data.message,
        variant: data.updated ? "default" : "destructive",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to check milestones",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>Enter admin password to access RSS management</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={authLoading}>
                {authLoading ? "Authenticating..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m ${seconds % 60}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Panel</h1>
            <p className="text-slate-600 dark:text-slate-300">RSS Feed Management & System Statistics</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <Button 
            onClick={() => refreshFeedsMutation.mutate()}
            disabled={refreshFeedsMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshFeedsMutation.isPending ? 'animate-spin' : ''}`} />
            {refreshFeedsMutation.isPending ? 'Refreshing...' : 'Force Refresh Feeds'}
          </Button>
          <Button 
            onClick={() => checkMilestonesMutation.mutate()}
            disabled={checkMilestonesMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            {checkMilestonesMutation.isPending ? 'Checking...' : 'Check Milestones'}
          </Button>
          <Button 
            onClick={() => updateMilestonesMutation.mutate()}
            disabled={updateMilestonesMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {updateMilestonesMutation.isPending ? 'Generating...' : 'Force Update Milestones'}
          </Button>
          <Button 
            onClick={() => resetStatsMutation.mutate()}
            disabled={resetStatsMutation.isPending}
            variant="destructive"
          >
            Reset Statistics
          </Button>
        </div>

        {stats && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    RSS Feeds
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rssFeeds.totalFeeds}</div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default" className="text-xs">
                      {stats.rssFeeds.successfulFeeds} Success
                    </Badge>
                    <Badge variant="destructive" className="text-xs">
                      {stats.rssFeeds.failedFeeds} Failed
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.articles.totalFetched}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {stats.articles.totalProcessed} processed
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    AI Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.articles.successfullyScored}</div>
                  <div className="flex gap-1 mt-2 text-xs">
                    <span className="text-green-600">{stats.articles.aiScoredCount} AI</span>
                    <span>•</span>
                    <span className="text-blue-600">{stats.articles.keywordScoredCount} Keyword</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {stats.processing.isCurrentlyProcessing ? (
                      <Badge variant="default" className="text-xs">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Processing
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Idle
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                    Queue: {stats.processing.queueLength}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            {systemInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    System Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Environment</Label>
                      <div className="text-sm">{systemInfo.environment}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Node Version</Label>
                      <div className="text-sm">{systemInfo.nodeVersion}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Platform</Label>
                      <div className="text-sm">{systemInfo.platform}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Uptime</Label>
                      <div className="text-sm">{formatUptime(systemInfo.uptime * 1000)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Memory (RSS)</Label>
                      <div className="text-sm">{formatBytes(systemInfo.memoryUsage.rss)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Memory (Heap)</Label>
                      <div className="text-sm">{formatBytes(systemInfo.memoryUsage.heapUsed)}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">OpenAI API</Label>
                      <div className="flex items-center gap-2">
                        {systemInfo.hasOpenAIKey ? (
                          <Badge variant="default" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <XCircle className="w-3 h-3 mr-1" />
                            No Key
                          </Badge>
                        )}
                        {stats.system.openaiQuotaExceeded && (
                          <Badge variant="outline" className="text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Quota Exceeded
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Feed Status Details */}
            <Card>
              <CardHeader>
                <CardTitle>RSS Feed Status</CardTitle>
                <CardDescription>Detailed status for each RSS feed source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.rssFeeds.feedStats).map(([url, feedStat]) => (
                    <div key={url} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{feedStat.category.toUpperCase()}</div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-md">
                            {feedStat.url}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {feedStat.successCount > 0 ? (
                            <Badge variant="default" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              <XCircle className="w-3 h-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <Label className="text-xs">Articles</Label>
                          <div>{feedStat.totalArticles}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Success Count</Label>
                          <div>{feedStat.successCount}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Error Count</Label>
                          <div>{feedStat.errorCount}</div>
                        </div>
                        <div>
                          <Label className="text-xs">Last Success</Label>
                          <div className="text-xs">
                            {feedStat.lastSuccess ? new Date(feedStat.lastSuccess).toLocaleString() : 'Never'}
                          </div>
                        </div>
                      </div>
                      
                      {feedStat.lastError && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                          <strong>Last Error:</strong> {feedStat.lastError}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
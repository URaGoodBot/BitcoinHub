import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown, Minus, ExternalLink, MessageCircle, ArrowUp, Users } from 'lucide-react';

interface WSBSentimentPost {
  id: string;
  title: string;
  content: string;
  score: number;
  comments: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number;
  confidence: number;
  bitcoinMentions: number;
  cryptoKeywords: string[];
  timeAgo: string;
  url: string;
  author: string;
}

interface WSBSentimentData {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  overallScore: number;
  confidence: number;
  posts: WSBSentimentPost[];
  totalPosts: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  lastUpdated: string;
}

interface WSBSentimentWidgetProps {
  className?: string;
}

function getSentimentIcon(sentiment: 'bullish' | 'bearish' | 'neutral') {
  switch (sentiment) {
    case 'bullish':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'bearish':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-yellow-500" />;
  }
}

function getSentimentColor(sentiment: 'bullish' | 'bearish' | 'neutral') {
  switch (sentiment) {
    case 'bullish':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'bearish':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
  }
}

function formatSentimentScore(score: number): string {
  return `${score > 0 ? '+' : ''}${(score * 100).toFixed(1)}%`;
}

export function WSBSentimentWidget({ className = '' }: WSBSentimentWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: sentimentData, isLoading, error, refetch } = useQuery<WSBSentimentData>({
    queryKey: ['wsb-sentiment', refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/sentiment/wallstreetbets${refreshKey > 0 ? '?refresh=true' : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch WSB sentiment data');
      }
      return response.json();
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (error) {
    return (
      <Card className={`bg-card shadow-lg ${className}`}>
        <CardHeader className="py-4 px-6 border-b border-muted/50">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
              WSB
            </div>
            WallStreetBets Sentiment
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <p>Unable to load WSB sentiment data</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-card shadow-lg ${className}`} data-testid="wsb-sentiment-widget">
      <CardHeader className="py-4 px-6 border-b border-muted/50 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
            WSB
          </div>
          WallStreetBets Sentiment
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={handleRefresh} data-testid="button-refresh-wsb">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <WSBSentimentSkeleton />
        ) : sentimentData ? (
          <div className="space-y-4">
            {/* Overall Sentiment Overview */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSentimentIcon(sentimentData.overallSentiment)}
                  <span className="font-medium text-sm">Overall Sentiment</span>
                </div>
                <Badge className={getSentimentColor(sentimentData.overallSentiment)}>
                  {sentimentData.overallSentiment.toUpperCase()}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-center">
                  <div className="font-medium text-lg">{formatSentimentScore(sentimentData.overallScore)}</div>
                  <div className="text-muted-foreground text-xs">Sentiment Score</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg">{sentimentData.totalPosts}</div>
                  <div className="text-muted-foreground text-xs">Crypto Posts</div>
                </div>
              </div>

              {/* Sentiment Breakdown */}
              <div className="flex justify-between text-xs gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Bullish: {sentimentData.bullishCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>Bearish: {sentimentData.bearishCount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Neutral: {sentimentData.neutralCount}</span>
                </div>
              </div>
            </div>

            {/* Top Keywords */}
            {sentimentData.topKeywords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">Trending Keywords</h4>
                <div className="flex flex-wrap gap-1">
                  {sentimentData.topKeywords.slice(0, 8).map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-xs"
                      data-testid={`keyword-${keyword.keyword}`}
                    >
                      {keyword.keyword} ({keyword.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Posts */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Recent Crypto Posts</h4>
              
              {sentimentData.posts.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-4">
                  No crypto-related posts found
                </div>
              ) : (
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-4">
                    {sentimentData.posts.slice(0, 10).map((post) => (
                      <div 
                        key={post.id} 
                        className="border rounded-lg p-3 space-y-2 hover:bg-muted/50 transition-colors"
                        data-testid={`post-${post.id}`}
                      >
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {getSentimentIcon(post.sentiment)}
                            <span className="text-xs text-muted-foreground truncate">
                              u/{post.author} • {post.timeAgo}
                            </span>
                          </div>
                          <Badge className={`${getSentimentColor(post.sentiment)} text-xs flex-shrink-0`}>
                            {formatSentimentScore(post.sentimentScore)}
                          </Badge>
                        </div>

                        {/* Post Title */}
                        <h5 className="font-medium text-sm line-clamp-2 leading-relaxed">
                          {post.title}
                        </h5>

                        {/* Post Content Preview */}
                        {post.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {post.content}
                          </p>
                        )}

                        {/* Keywords */}
                        {post.cryptoKeywords.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.cryptoKeywords.slice(0, 3).map((keyword, index) => (
                              <span 
                                key={index} 
                                className="inline-block bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs px-1.5 py-0.5 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Post Stats */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <ArrowUp className="h-3 w-3" />
                              <span>{formatNumber(post.score)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{formatNumber(post.comments)}</span>
                            </div>
                            {post.bitcoinMentions > 0 && (
                              <span className="text-orange-600 dark:text-orange-400 font-medium">
                                ₿{post.bitcoinMentions}
                              </span>
                            )}
                          </div>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            data-testid={`link-post-${post.id}`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>Reddit</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground text-center">
              Last updated: {new Date(sentimentData.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No sentiment data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const WSBSentimentSkeleton = () => (
  <div className="space-y-4">
    {/* Overall sentiment skeleton */}
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-12 mx-auto" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
        <div className="text-center space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      </div>
      <div className="flex justify-between gap-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>

    {/* Keywords skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <div className="flex flex-wrap gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-6 w-16 rounded-full" />
        ))}
      </div>
    </div>

    {/* Posts skeleton */}
    <div className="space-y-3">
      <Skeleton className="h-4 w-28" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <div className="flex justify-between">
            <div className="flex gap-2">
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
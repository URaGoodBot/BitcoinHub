import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Heart, Repeat2, MessageCircle, RotateCcw, Twitter } from 'lucide-react';

interface TwitterAuthor {
  name: string;
  username: string;
  profile_image_url: string;
  verified: boolean;
}

interface TwitterMetrics {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
}

interface Tweet {
  id: string;
  text: string;
  created_at: string;
  author: TwitterAuthor;
  metrics: TwitterMetrics;
  url: string;
}

interface TwitterFeedProps {
  className?: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return date.toLocaleDateString();
}

function formatTweetText(text: string): string {
  // Basic text formatting for hashtags and mentions
  return text
    .replace(/#(\w+)/g, '<span class="text-blue-600 font-medium">#$1</span>')
    .replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>')
    .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>');
}

export function TwitterFeed({ className = '' }: TwitterFeedProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: tweets, isLoading, error, refetch } = useQuery({
    queryKey: ['twitter-hodlmybeer', refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/twitter/hodlmybeer${refreshKey > 0 ? '?refresh=true' : ''}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tweets');
      }
      return response.json() as Promise<Tweet[]>;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Twitter className="h-5 w-5 text-blue-500" />
              HodlMyBeer Updates
            </CardTitle>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Unable to load tweets at the moment
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-blue-500" />
            HodlMyBeer Updates
          </CardTitle>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-4">
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        ) : !tweets || tweets.length === 0 ? (
          <div className="text-center py-8">
            <Twitter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No recent tweets found
            </p>
            <Button onClick={handleRefresh} variant="outline">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {tweets.map((tweet) => (
              <div key={tweet.id} className="border-b border-border last:border-b-0 pb-6 last:pb-0">
                {/* Tweet Header */}
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={tweet.author.profile_image_url}
                    alt={`${tweet.author.name} avatar`}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground">
                        {tweet.author.name}
                      </span>
                      {tweet.author.verified && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                          ✓
                        </Badge>
                      )}
                      <span className="text-muted-foreground">
                        @{tweet.author.username}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-muted-foreground text-sm">
                        {formatRelativeTime(tweet.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tweet Content */}
                <div className="mb-4">
                  <p 
                    className="text-foreground leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: formatTweetText(tweet.text) }}
                  />
                </div>

                {/* Tweet Metrics */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>{formatNumber(tweet.metrics.replies)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Repeat2 className="h-4 w-4" />
                    <span>{formatNumber(tweet.metrics.retweets)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{formatNumber(tweet.metrics.likes)}</span>
                  </div>
                  <a
                    href={tweet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-700 ml-auto"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>View on X</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Repeat2, Share, MoreHorizontal, ExternalLink } from 'lucide-react';
import { TwitterPost } from '@/lib/types';
// import { formatDistanceToNow } from 'date-fns';

interface TwitterFeedProps {
  searchQuery?: string;
}

function TweetCard({ tweet }: { tweet: TwitterPost }) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);

  const timeAgo = new Date(tweet.createdAt).toLocaleString();

  return (
    <Card className="border-0 border-b border-muted/20 rounded-none hover:bg-muted/5 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10 flex-shrink-0">
            <AvatarImage src={tweet.author.avatar} alt={tweet.author.displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {tweet.author.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-foreground hover:underline cursor-pointer truncate">
                {tweet.author.displayName}
              </h3>
              <span className="text-muted-foreground text-sm">@{tweet.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm hover:underline cursor-pointer">
                {timeAgo}
              </span>
              <div className="ml-auto">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted/50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tweet content */}
            <div className="space-y-3">
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                {tweet.text}
              </p>

              {/* Hashtags */}
              {tweet.hashtags && tweet.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tweet.hashtags.slice(0, 3).map((hashtag, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary" 
                      className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary"
                    >
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Image if available */}
              {tweet.imageUrl && (
                <div className="rounded-lg overflow-hidden border border-muted/20">
                  <img 
                    src={tweet.imageUrl} 
                    alt="Tweet content" 
                    className="w-full max-h-80 object-cover hover:scale-105 transition-transform duration-200"
                  />
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between mt-4 max-w-md">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 p-2"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="text-xs">{tweet.metrics?.comments || 0}</span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-muted-foreground hover:text-green-500 hover:bg-green-500/10 p-2 ${
                  retweeted ? 'text-green-500' : ''
                }`}
                onClick={() => setRetweeted(!retweeted)}
              >
                <Repeat2 className="h-4 w-4 mr-1" />
                <span className="text-xs">
                  {(tweet.metrics?.retweets || 0) + (retweeted ? 1 : 0)}
                </span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-muted-foreground hover:text-red-500 hover:bg-red-500/10 p-2 ${
                  liked ? 'text-red-500' : ''
                }`}
                onClick={() => setLiked(!liked)}
              >
                <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                <span className="text-xs">
                  {(tweet.metrics?.likes || 0) + (liked ? 1 : 0)}
                </span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 p-2"
              >
                <Share className="h-4 w-4" />
              </Button>

              {tweet.url && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 p-2"
                  onClick={() => window.open(tweet.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TweetSkeleton() {
  return (
    <Card className="border-0 border-b border-muted/20 rounded-none">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="h-4 bg-muted rounded w-24 animate-pulse" />
              <div className="h-4 bg-muted/50 rounded w-16 animate-pulse" />
              <div className="h-4 bg-muted/50 rounded w-12 animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded w-full animate-pulse" />
              <div className="h-4 bg-muted/50 rounded w-3/4 animate-pulse" />
            </div>
            <div className="flex space-x-4 mt-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-muted/50 rounded w-12 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function TwitterFeed({ searchQuery }: TwitterFeedProps) {
  // Fetch Twitter/X posts
  const { 
    data: tweets, 
    isLoading, 
    refetch 
  } = useQuery<TwitterPost[]>({
    queryKey: ['/api/twitter/tweets'],
    refetchInterval: 60000, // Refresh every minute
    refetchOnWindowFocus: false,
  });

  // Fetch trending hashtags
  const { data: hashtags } = useQuery<string[]>({
    queryKey: ['/api/twitter/hashtags'],
    refetchOnWindowFocus: false,
  });

  // Filter tweets based on search query
  const filteredTweets = (tweets || []).filter(tweet => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tweet.text.toLowerCase().includes(query) ||
      tweet.author.username.toLowerCase().includes(query) ||
      tweet.author.displayName.toLowerCase().includes(query) ||
      tweet.hashtags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-0">
      {/* Trending Section */}
      {hashtags && hashtags.length > 0 && (
        <div className="p-4 border-b border-muted/20">
          <h3 className="font-semibold text-foreground mb-3">Trending in Bitcoin</h3>
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 6).map((hashtag) => (
              <Badge 
                key={hashtag}
                variant="outline"
                className="cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/20"
              >
                {hashtag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Tweet Feed */}
      <div className="divide-y divide-muted/20">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <TweetSkeleton key={i} />
          ))
        ) : filteredTweets.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No tweets found</p>
            <Button variant="outline" onClick={() => refetch()}>
              Refresh Feed
            </Button>
          </div>
        ) : (
          // Tweet list
          filteredTweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))
        )}
      </div>
    </div>
  );
}
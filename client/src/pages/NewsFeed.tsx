import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

interface CryptoEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isVirtual: boolean;
  url: string;
  category: 'conference' | 'webinar' | 'workshop' | 'meetup' | 'launch';
  priority: 'high' | 'medium' | 'low';
}

const UpcomingEvents = () => {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    refetchInterval: 24 * 60 * 60 * 1000, // Refresh daily
  });

  const getDaysUntilEvent = (eventDate: string): string => {
    const now = new Date();
    const event = new Date(eventDate);
    const timeDiff = event.getTime() - now.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 7) return `${days} days`;
    if (days < 30) return `${Math.floor(days / 7)} weeks`;
    return `${Math.floor(days / 30)} months`;
  };

  const formatEventDate = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startFormatted = start.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    const year = start.getFullYear();

    if (start.toDateString() === end.toDateString()) {
      return `${startFormatted}, ${year}`;
    }

    if (start.getMonth() === end.getMonth()) {
      return `${startFormatted}-${end.getDate()}, ${year}`;
    }

    return `${startFormatted} - ${endFormatted}, ${year}`;
  };

  if (eventsLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-muted/20 p-3 rounded-lg border border-muted/30 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/50 rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-muted/50 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event: CryptoEvent) => (
        <div key={event.id} className="bg-muted/20 p-3 rounded-lg border border-muted/30">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium">
                <a 
                  href={event.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {event.title}
                </a>
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                {formatEventDate(event.startDate, event.endDate)} • {event.location}
              </p>
            </div>
            <Badge variant={event.priority === 'high' ? 'default' : 'secondary'}>
              {getDaysUntilEvent(event.startDate)}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
};

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  RefreshCw, 
  Share,
  MessageCircle, 
  Heart, 
  RotateCw,
  Hash,
  Calendar,
  BarChart2,
  Newspaper,
  Twitter,
  MessageSquare,
  Bookmark,
  ExternalLink,
  Globe,
  Filter
} from "lucide-react";
import { 
  formatRelativeTime, 
  truncateText,
  formatNumber 
} from "@/lib/utils";
import { NewsItem, TwitterPost } from "@/lib/types";

const NewsFeed = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // News data
  const { 
    data: newsItems, 
    isLoading: isLoadingNews, 
    refetch: refetchNews 
  } = useQuery({
    queryKey: ["/api/news", refreshTrigger],
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Twitter data
  const { 
    data: twitterPosts, 
    isLoading: isLoadingTwitter, 
    refetch: refetchTwitter 
  } = useQuery({
    queryKey: ["/api/twitter/tweets", refreshTrigger],
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refresh every minute
  });

  // Twitter hashtags
  const { 
    data: twitterHashtags, 
    isLoading: isLoadingHashtags 
  } = useQuery({
    queryKey: ["/api/twitter/hashtags"],
    refetchOnWindowFocus: false,
  });
  
  // Twitter popular accounts
  const { 
    data: twitterAccounts, 
    isLoading: isLoadingAccounts 
  } = useQuery({
    queryKey: ["/api/twitter/accounts"],
    refetchOnWindowFocus: false,
  });
  
  // HodlMyBeer21 following tweets
  const { 
    data: hodlmybeerPosts, 
    isLoading: isLoadingHodlmybeer,
    refetch: refetchHodlmybeer
  } = useQuery({
    queryKey: ["/api/twitter/hodlmybeer-following", refreshTrigger],
    refetchOnWindowFocus: false,
    refetchInterval: 60000, // Refresh every minute
  });
  
  // Filter news and twitter based on search query
  const filteredNews = (newsItems as NewsItem[])?.filter(item => 
    searchQuery === "" || 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.source.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];
  
  const filteredTwitter = (twitterPosts as TwitterPost[])?.filter(post => 
    searchQuery === "" || 
    post.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.author.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  const filteredHodlmybeer = (hodlmybeerPosts as TwitterPost[])?.filter(post => 
    searchQuery === "" || 
    post.text.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.author.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.author.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];
  
  // Combined feed for "All" tab - alternating between news and Reddit posts
  const combinedFeed = [];
  const maxItems = Math.max(filteredNews?.length || 0, filteredTwitter?.length || 0);
  
  for (let i = 0; i < maxItems; i++) {
    if (i < filteredNews?.length) {
      combinedFeed.push({ type: 'news', item: filteredNews[i] });
    }
    if (i < filteredTwitter?.length) {
      combinedFeed.push({ type: 'reddit', item: filteredTwitter[i] });
    }
  }
  
  // Sort combined feed by timestamp (newest first)
  combinedFeed.sort((a, b) => {
    const dateA = new Date(a.type === 'news' 
      ? (a.item as NewsItem).publishedAt 
      : (a.item as TwitterPost).createdAt
    );
    const dateB = new Date(b.type === 'news' 
      ? (b.item as NewsItem).publishedAt 
      : (b.item as TwitterPost).createdAt
    );
    return dateB.getTime() - dateA.getTime();
  });
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refetchNews();
    refetchTwitter();
    refetchHodlmybeer();
  };
  

  

  
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bitcoin News & Social Feed</h1>
          <p className="text-sm text-muted-foreground">
            Stay updated with the latest Bitcoin news and social media conversations
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Feed
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content */}
        <div className="lg:col-span-3">
          <Card className="border rounded-lg shadow-sm">
            <CardHeader className="pb-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search news and tweets..."
                  className="pl-9 bg-muted"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6 pt-2">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">
                      <Globe className="h-4 w-4 mr-2" />
                      All
                    </TabsTrigger>
                    <TabsTrigger value="news" className="flex-1">
                      <Newspaper className="h-4 w-4 mr-2" />
                      News
                    </TabsTrigger>
                    <TabsTrigger value="twitter" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Reddit
                    </TabsTrigger>
                    <TabsTrigger value="hodlmybeer" className="flex-1">
                      <Twitter className="h-4 w-4 mr-2" />
                      X/Twitter
                    </TabsTrigger>
                    <TabsTrigger value="trending" className="flex-1">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Trending
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                {/* All Tab - Combined feed */}
                <TabsContent value="all" className="p-0">
                  <ScrollArea className="h-[800px]">
                    <div className="p-6 space-y-4">
                      {isLoadingNews || isLoadingTwitter ? (
                        <FeedSkeleton count={5} />
                      ) : combinedFeed.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No content matching your search</p>
                        </div>
                      ) : (
                        combinedFeed.map((item, index) => (
                          <div key={`${item.type}-${index}`}>
                            {item.type === 'news' ? (
                              <NewsCard item={item.item as NewsItem} />
                            ) : (
                              <RedditPostCard post={item.item as TwitterPost} />
                            )}
                            {index < combinedFeed.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* News Tab */}
                <TabsContent value="news" className="p-0">
                  <ScrollArea className="h-[800px]">
                    <div className="p-6 space-y-4">
                      {isLoadingNews ? (
                        <FeedSkeleton count={5} />
                      ) : filteredNews.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No news articles matching your search</p>
                        </div>
                      ) : (
                        filteredNews.map((item, index) => (
                          <div key={item.id}>
                            <NewsCard item={item} />
                            {index < filteredNews.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Reddit Tab */}
                <TabsContent value="twitter" className="p-0">
                  <div className="px-6 pt-3 pb-2">
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      {!isLoadingHashtags && (twitterHashtags as string[])?.map((hashtag) => (
                        <Badge 
                          key={hashtag}
                          variant="outline"
                          className="cursor-pointer whitespace-nowrap"
                        >
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Content from r/Bitcoin
                    </div>
                  </div>
                  <ScrollArea className="h-[800px]">
                    <div className="p-6 space-y-4">
                      {isLoadingTwitter ? (
                        <FeedSkeleton count={5} />
                      ) : filteredTwitter.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No Reddit posts matching your search</p>
                        </div>
                      ) : (
                        filteredTwitter.map((post, index) => (
                          <div key={post.id}>
                            <RedditPostCard post={post} />
                            {index < filteredTwitter.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                
                {/* HodlMyBeer21 Twitter Following Tab */}
                <TabsContent value="hodlmybeer" className="p-0">
                  <div className="px-6 pt-3 pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold">HodlMyBeer21's Following</h3>
                        <p className="text-xs text-muted-foreground">Tweets from top Bitcoin influencers</p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={handleRefresh}
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[800px]">
                    <div className="p-6 space-y-4">
                      {isLoadingHodlmybeer ? (
                        <FeedSkeleton count={5} />
                      ) : filteredHodlmybeer.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No tweets matching your search</p>
                        </div>
                      ) : (
                        filteredHodlmybeer.map((post, index) => (
                          <div key={post.id}>
                            <Card className="bg-card hover:bg-muted/20 transition-colors p-4 rounded-lg border border-muted">
                              <div className="flex gap-3">
                                <div className="flex-shrink-0">
                                  <Avatar className="h-10 w-10 bg-blue-500/90">
                                    <AvatarImage src={post.author.profileImageUrl} alt={post.author.displayName} />
                                    <AvatarFallback>X</AvatarFallback>
                                  </Avatar>
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="font-medium text-primary">{post.author.displayName}</span>
                                      {post.author.verified && (
                                        <svg className="ml-1 h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                        </svg>
                                      )}
                                      <span className="text-muted-foreground text-sm ml-1">@{post.author.username}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</span>
                                  </div>
                                  
                                  <p className="text-base mt-2">{post.text}</p>
                                  
                                  {post.imageUrl && (
                                    <div className="mt-4 rounded-md overflow-hidden">
                                      <img 
                                        src={post.imageUrl} 
                                        alt="Tweet content" 
                                        className="w-full object-cover max-h-[400px]" 
                                      />
                                    </div>
                                  )}
                                  
                                  {post.hashtags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {post.hashtags.map((tag) => (
                                        <Badge key={tag} variant="outline" className="text-xs text-blue-500 border-blue-500/20">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center mt-3 text-xs text-muted-foreground">
                                    <button className="flex items-center mr-4 hover:text-primary">
                                      <MessageSquare className="h-4 w-4 mr-1" />
                                      {formatNumber(post.metrics.replies)}
                                    </button>
                                    <button className="flex items-center mr-4 hover:text-green-500">
                                      <RotateCw className="h-4 w-4 mr-1" />
                                      {formatNumber(post.metrics.retweets)}
                                    </button>
                                    <button className="flex items-center mr-4 hover:text-red-500">
                                      <Heart className="h-4 w-4 mr-1" />
                                      {formatNumber(post.metrics.likes)}
                                    </button>
                                    <div className="ml-auto">
                                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                        <Share className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                            {index < filteredHodlmybeer.length - 1 && <Separator className="my-4" />}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Trending Tab */}
                <TabsContent value="trending" className="p-0">
                  <ScrollArea className="h-[800px]">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">Trending Topics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Trending Hashtags */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">
                              <Hash className="h-4 w-4 inline mr-2" />
                              Popular Hashtags
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isLoadingHashtags ? (
                              <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <Skeleton key={i} className="h-6 w-full" />
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {(twitterHashtags as string[])?.map((hashtag, index) => (
                                  <div key={hashtag} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <span className="font-medium text-muted-foreground mr-2">{index + 1}</span>
                                      <span className="font-medium">{hashtag}</span>
                                    </div>
                                    <Badge variant="outline">{Math.floor(Math.random() * 10000)} posts</Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Popular Accounts */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">
                              <MessageCircle className="h-4 w-4 inline mr-2" />
                              Popular Bitcoin Redditors
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {isLoadingAccounts ? (
                              <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                  <Skeleton key={i} className="h-8 w-full" />
                                ))}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {(twitterAccounts as string[])?.map((account, index) => (
                                  <div key={account} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center mr-3">
                                        {account.substring(0, 2)}
                                      </div>
                                      <div>
                                        <div className="font-medium">@{account}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {Math.floor(Math.random() * 500) + 100}K followers
                                        </div>
                                      </div>
                                    </div>
                                    <Button variant="outline" size="sm">Follow</Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        
                        {/* Hot Topics */}
                        <Card className="md:col-span-2">
                          <CardHeader>
                            <CardTitle className="text-base">Today's Hot Topics in Bitcoin</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                                <h4 className="font-medium mb-2">Bitcoin ETF Inflows</h4>
                                <p className="text-sm text-muted-foreground">
                                  Institutional investors continue to pour money into Bitcoin ETFs, with $172M in net inflows reported yesterday.
                                </p>
                                <div className="mt-3 flex items-center">
                                  <Badge className="mr-2">ETF</Badge>
                                  <Badge variant="outline">25 articles</Badge>
                                </div>
                              </div>
                              
                              <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                                <h4 className="font-medium mb-2">Mining Difficulty ATH</h4>
                                <p className="text-sm text-muted-foreground">
                                  Bitcoin mining difficulty reached an all-time high after the latest adjustment, making it harder than ever to mine new BTC.
                                </p>
                                <div className="mt-3 flex items-center">
                                  <Badge className="mr-2">Mining</Badge>
                                  <Badge variant="outline">18 articles</Badge>
                                </div>
                              </div>
                              
                              <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                                <h4 className="font-medium mb-2">Lightning Network Growth</h4>
                                <p className="text-sm text-muted-foreground">
                                  Bitcoin's Layer 2 Lightning Network capacity has grown to 5,500 BTC, showing increased adoption of Bitcoin scaling solutions.
                                </p>
                                <div className="mt-3 flex items-center">
                                  <Badge className="mr-2">Technology</Badge>
                                  <Badge variant="outline">12 articles</Badge>
                                </div>
                              </div>
                              
                              <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                                <h4 className="font-medium mb-2">Regulation Updates</h4>
                                <p className="text-sm text-muted-foreground">
                                  Financial authorities proposed new reserve requirement regulations for institutions holding Bitcoin.
                                </p>
                                <div className="mt-3 flex items-center">
                                  <Badge className="mr-2">Regulation</Badge>
                                  <Badge variant="outline">22 articles</Badge>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                <Calendar className="h-4 w-4 inline mr-2" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <UpcomingEvents />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// News Card Component
interface NewsCardProps {
  item: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  return (
    <div className="bg-card hover:bg-muted/20 transition-colors p-4 rounded-lg">
      <div className="flex gap-4">
        {item.imageUrl && (
          <a 
            href={item.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <img 
              src={item.imageUrl}
              alt={item.title}
              className="w-28 h-28 object-cover rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </a>
        )}
        
        <div className="flex-1">
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <span className="font-medium text-primary">{item.source}</span>
            <span className="mx-2">•</span>
            <span>{formatRelativeTime(item.publishedAt)}</span>
          </div>
          
          <a 
            href={item.url}
            target="_blank" 
            rel="noopener noreferrer"
            className="text-lg font-semibold hover:text-primary transition-colors line-clamp-2"
          >
            {item.title}
          </a>
          
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {item.description}
          </p>
          
          <div className="flex items-center mt-3 justify-between">
            <div className="flex flex-wrap gap-2">
              {item.categories.map((category) => (
                <Badge 
                  key={category}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                >
                  {category}
                </Badge>
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Share className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reddit Post Card Component
interface RedditPostCardProps {
  post: TwitterPost; // Using the same data structure as before
}

const RedditPostCard: React.FC<RedditPostCardProps> = ({ post }) => {
  return (
    <div className="bg-card hover:bg-muted/10 transition-all duration-200 p-4 rounded-lg border border-muted/50">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 bg-gradient-to-br from-orange-500 to-red-500">
            <AvatarImage src={post.author.profileImageUrl} alt={post.author.displayName} />
            <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">
              r/
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-orange-500 text-sm">r/{post.author.displayName}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-muted-foreground text-xs truncate">u/{post.author.username}</span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
          </div>
          
          <h3 className="text-base font-medium leading-snug mb-3 text-foreground">
            {post.text}
          </h3>
          
          {post.imageUrl && (
            <div className="mt-3 mb-3 rounded-lg overflow-hidden bg-muted/20">
              <img 
                src={post.imageUrl} 
                alt="Reddit post content" 
                className="w-full h-auto object-cover max-h-[300px]" 
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.hashtags.map((tag, index) => (
                <Badge 
                  key={`${tag}-${index}`} 
                  variant="secondary" 
                  className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer transition-colors"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button className="flex items-center gap-1.5 hover:text-primary transition-colors p-1 rounded">
              <MessageCircle className="h-4 w-4" />
              <span>{formatNumber(post.metrics.replies)}</span>
            </button>
            
            <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors p-1 rounded">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
              <span>{formatNumber(post.metrics.retweets)}</span>
            </button>
            
            <button className="flex items-center gap-1.5 hover:text-yellow-500 transition-colors p-1 rounded">
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </button>
            
            <button className="flex items-center gap-1.5 hover:text-blue-500 transition-colors p-1 rounded ml-auto">
              <Share className="h-4 w-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Loading Component
const FeedSkeleton = ({ count = 3 }: { count?: number }) => (
  <>
    {Array(count).fill(0).map((_, i) => (
      <div key={i} className="bg-card p-4 rounded-lg">
        <div className="flex gap-4">
          <Skeleton className="h-28 w-28 rounded-md flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

export default NewsFeed;
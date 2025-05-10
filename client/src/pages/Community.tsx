import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageSquare, ArrowUp, Search } from "lucide-react";
import { getUserInitials, formatRelativeTime } from "@/lib/utils";
import { ForumPost } from "@/lib/types";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: forumPosts, isLoading } = useQuery({
    queryKey: ["/api/forum/posts"],
    refetchOnWindowFocus: false,
  });
  
  // Categories for filtering
  const categories = [
    "All", "Price Discussion", "Wallets", "Mining", "Security", 
    "Trading", "Technology", "Adoption", "News"
  ];
  
  // Filter posts based on search query
  const filteredPosts = searchQuery.trim() === "" 
    ? forumPosts as ForumPost[] 
    : (forumPosts as ForumPost[])?.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Community Forum</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join discussions with other Bitcoin enthusiasts
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className="lg:col-span-3">
          <Card className="bg-card mb-6">
            <CardHeader className="pb-2">
              <div className="flex items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search discussions..."
                    className="pl-9 bg-muted"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="ml-4 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                  New Post
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="pb-4">
              <Tabs defaultValue="latest" className="w-full">
                <TabsList className="w-full bg-muted">
                  <TabsTrigger value="latest" className="flex-1">Latest</TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                  <TabsTrigger value="my-posts" className="flex-1">My Posts</TabsTrigger>
                </TabsList>
                
                <TabsContent value="latest" className="mt-4 space-y-4">
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <ForumPostSkeleton key={index} />
                    ))
                  ) : filteredPosts?.length ? (
                    filteredPosts.map((post) => (
                      <ForumPostCard key={post.id} post={post} />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No discussions found matching your search</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="popular" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Popular discussions will appear here</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="my-posts" className="mt-4">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Your posts will appear here when you create them</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Browse discussions by topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant={category === "All" ? "default" : "outline"}
                    className="cursor-pointer"
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-medium">4,587</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Now</span>
                <span className="font-medium">128</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posts Today</span>
                <span className="font-medium">43</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Discussions</span>
                <span className="font-medium">2,164</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Be respectful to other community members</p>
              <p>• No promotion of alternative cryptocurrencies</p>
              <p>• No financial advice or price predictions</p>
              <p>• Keep discussions related to Bitcoin</p>
              <p>• No spamming or excessive self-promotion</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

interface ForumPostCardProps {
  post: ForumPost;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post }) => {
  return (
    <Card className="bg-card hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center">
              {post.author.avatar ? (
                <img 
                  src={post.author.avatar} 
                  alt={post.author.username} 
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <span className="text-foreground text-sm font-medium">
                  {getUserInitials(post.author.username)}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{post.author.username}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
            </div>
            <h3 className="text-base font-semibold text-foreground mt-1 hover:text-primary">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {post.content}
            </p>
            <div className="flex items-center mt-3 space-x-4">
              <button className="text-xs text-muted-foreground hover:text-primary flex items-center">
                <MessageSquare className="h-3 w-3 mr-1" /> {post.commentCount}
              </button>
              <button className="text-xs text-muted-foreground hover:text-primary flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" /> {post.upvotes}
              </button>
              {post.categories.map((category) => (
                <Badge 
                  key={category}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ForumPostSkeleton = () => (
  <Card className="bg-card">
    <CardContent className="p-4">
      <div className="flex items-start space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-5 w-4/5 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-4/5 mb-3" />
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Community;

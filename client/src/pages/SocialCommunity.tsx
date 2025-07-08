import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  TrendingUp, 
  Users, 
  MessageSquare,
  Hash,
  Clock
} from "lucide-react";
import SocialForumPost from "@/components/SocialForumPost";
import NewPostForm from "@/components/NewPostForm";
import { ForumPost } from "@/lib/types";

const SocialCommunity = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  const { data: forumPosts, isLoading } = useQuery({
    queryKey: ["/api/forum/posts"],
    refetchOnWindowFocus: false,
  });

  // Categories for filtering
  const categories = [
    "All", "Price Discussion", "Wallets", "Mining", "Security", 
    "Trading", "Technology", "Adoption", "News", "Learning Resources"
  ];

  // Trending hashtags (mock data)
  const trendingHashtags = [
    { tag: "Bitcoin", posts: 1234 },
    { tag: "HODL", posts: 856 },
    { tag: "Lightning", posts: 432 },
    { tag: "DCA", posts: 298 },
    { tag: "Halving", posts: 187 }
  ];

  // Active users (mock data)
  const activeUsers = [
    { username: "SatoshiFan", posts: 45, streak: 7 },
    { username: "BitcoinMaster", posts: 38, streak: 12 },
    { username: "HODLQueen", posts: 29, streak: 5 },
    { username: "CryptoNinja", posts: 22, streak: 3 }
  ];

  // Filter posts based on search query and category
  const filteredPosts = (forumPosts as ForumPost[])?.filter(post => {
    const matchesSearch = searchQuery.trim() === "" || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (post.title && post.title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || 
      post.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Sort posts
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.upvotes + (b.reactions?.like || 0)) - (a.upvotes + (a.reactions?.like || 0));
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
            <p className="text-muted-foreground">
              Connect with Bitcoin enthusiasts, share insights, and stay updated with the latest discussions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* New Post Form */}
              <NewPostForm />

              {/* Navigation Tabs */}
              <Tabs value={sortBy} onValueChange={setSortBy} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="recent" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Popular
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={sortBy} className="mt-6">
                  {/* Search and Filters */}
                  <div className="mb-6">
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search posts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Badge 
                          key={category} 
                          variant={category === selectedCategory ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => setSelectedCategory(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Posts Feed */}
                  <div className="space-y-4">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex space-x-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-1/4" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                              <div className="flex space-x-4">
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-6 w-12" />
                                <Skeleton className="h-6 w-12" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : sortedPosts.length > 0 ? (
                      sortedPosts.map((post) => (
                        <SocialForumPost key={post.id} post={post} />
                      ))
                    ) : (
                      <Card className="text-center py-12">
                        <CardContent>
                          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                          <p className="text-muted-foreground">
                            {searchQuery || selectedCategory !== "All" 
                              ? "Try adjusting your search or filters"
                              : "Be the first to start a conversation!"
                            }
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Community Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Community Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Members</span>
                    <span className="font-medium">4,587</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Today</span>
                    <span className="font-medium">234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posts Today</span>
                    <span className="font-medium">67</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Posts</span>
                    <span className="font-medium">12,456</span>
                  </div>
                </CardContent>
              </Card>

              {/* Trending Hashtags */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Trending Hashtags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {trendingHashtags.map((hashtag, index) => (
                    <div key={hashtag.tag} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">#{index + 1}</span>
                        <span className="font-medium text-blue-500">#{hashtag.tag}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{hashtag.posts}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Top Contributors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Contributors
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activeUsers.map((user, index) => (
                    <div key={user.username} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm">#{index + 1}</span>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.posts} posts • {user.streak} day streak
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        🔥 {user.streak}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>• Be respectful and constructive</div>
                  <div>• Use relevant hashtags (#Bitcoin, #HODL)</div>
                  <div>• Share quality content and insights</div>
                  <div>• Help newcomers learn</div>
                  <div>• No spam or self-promotion</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialCommunity;
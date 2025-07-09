import { useQuery } from "@tanstack/react-query";
import { MemePostForm } from "@/components/MemePostForm";
import { MemePost } from "@/components/MemePost";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, Hash, Users, Laugh, Trophy, Star, Flame } from "lucide-react";
import type { ForumPostType } from "@/lib/types";

export default function MemeCommunity() {
  const { data: posts, isLoading } = useQuery<ForumPostType[]>({
    queryKey: ['/api/forum/posts'],
  });

  // Filter for meme posts (posts with images or meme templates)
  const memePosts = posts?.filter(post => 
    !post.isReply && (post.imageUrl || post.memeTemplate)
  ) || [];

  const regularPosts = posts?.filter(post => 
    !post.isReply && !post.imageUrl && !post.memeTemplate
  ) || [];

  const allPosts = [...memePosts, ...regularPosts];

  // Generate trending hashtags from posts
  const trendingHashtags = posts ? 
    posts.flatMap(post => post.hashtags || [])
         .reduce((acc, tag) => {
           acc[tag] = (acc[tag] || 0) + 1;
           return acc;
         }, {} as Record<string, number>) : {};

  const topHashtags = Object.entries(trendingHashtags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  const topContributors = [
    { username: "HodlMyBeer21", memes: 5, reactions: 23 },
    { username: "BitcoinMaxi", memes: 3, reactions: 15 },
    { username: "SatoshiFan", memes: 4, reactions: 19 },
    { username: "CryptoNinja", memes: 2, reactions: 12 }
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-64 bg-muted/20 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-muted/20 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-muted/20 animate-pulse rounded-lg"></div>
          </div>
          <div className="space-y-6">
            <div className="h-32 bg-muted/20 animate-pulse rounded-lg"></div>
            <div className="h-48 bg-muted/20 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-500/20 rounded-full">
                <Laugh className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Bitcoin Meme Central</h1>
                <p className="text-muted-foreground">Share laughs, reactions, and Bitcoin humor with the community</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Laugh className="w-8 h-8 text-orange-500" />
                    <div>
                      <p className="text-2xl font-bold">{memePosts.length}</p>
                      <p className="text-sm text-muted-foreground">Memes Posted</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold">{topContributors.length}</p>
                      <p className="text-sm text-muted-foreground">Active Memers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Flame className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">
                        {posts?.reduce((acc, post) => 
                          acc + (post.reactions?.like || 0) + (post.reactions?.love || 0) + 
                          (post.reactions?.rocket || 0) + (post.reactions?.fire || 0), 0
                        ) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground">Total Reactions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Post Form */}
          <MemePostForm />

          {/* Posts Feed */}
          <div className="space-y-6">
            {allPosts.length === 0 ? (
              <Card className="bg-muted/10 border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Laugh className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No memes yet!</h3>
                  <p className="text-muted-foreground mb-4">
                    Be the first to share a Bitcoin meme with the community
                  </p>
                  <Button className="bg-orange-500 hover:bg-orange-600">
                    Post First Meme
                  </Button>
                </CardContent>
              </Card>
            ) : (
              allPosts.map((post) => (
                <MemePost key={post.id} post={post} />
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Hashtags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span>Trending Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topHashtags.length === 0 ? (
                <p className="text-sm text-muted-foreground">No trending tags yet</p>
              ) : (
                topHashtags.map(([hashtag, count]) => (
                  <div key={hashtag} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">#{hashtag}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Top Memers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Top Memers</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div key={contributor.username} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {index === 0 && <Star className="w-4 h-4 text-yellow-500" />}
                    {index === 1 && <Star className="w-4 h-4 text-gray-400" />}
                    {index === 2 && <Star className="w-4 h-4 text-orange-600" />}
                    <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {contributor.username.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{contributor.username}</p>
                    <p className="text-xs text-muted-foreground">
                      {contributor.memes} memes, {contributor.reactions} reactions
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Meme Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Popular Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['Bitcoin Memes', 'Crypto Humor', 'Trading Memes', 'HODL Life', 'Market Reactions'].map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  size="sm"
                >
                  <Hash className="w-4 h-4 mr-2" />
                  {category}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Community Guidelines */}
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-blue-400">Meme Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Keep it Bitcoin/crypto related</p>
              <p>• Be respectful and fun</p>
              <p>• Credit original creators</p>
              <p>• No spam or low effort posts</p>
              <p>• Share the laughs! 🚀</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
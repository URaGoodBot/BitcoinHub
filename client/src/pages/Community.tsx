import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  ArrowUp, 
  Search, 
  ThumbsUp, 
  MessageCircle, 
  Lightbulb, 
  Heart, 
  Gift, 
  Link as LinkIcon, 
  BookOpen, 
  Video, 
  Wallet, 
  QrCode, 
  Copy, 
  Send, 
  MessageSquareText,
  BadgeCheck
} from "lucide-react";
import { getUserInitials, formatRelativeTime } from "@/lib/utils";
import { ForumPost } from "@/lib/types";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: "BitcoinMaster", content: "Anyone watching the price action today?", time: "2 minutes ago" },
    { id: 2, author: "SatoshiFan", content: "What's your take on the latest Lightning Network adoption stats?", time: "5 minutes ago" },
    { id: 3, author: "HODLer2023", content: "Just completed the 'HODLing Like a Pro' course, highly recommend!", time: "12 minutes ago" }
  ]);
  
  const { data: forumPosts, isLoading } = useQuery({
    queryKey: ["/api/forum/posts"],
    refetchOnWindowFocus: false,
  });
  
  // Categories for filtering
  const categories = [
    "All", "Price Discussion", "Wallets", "Mining", "Security", 
    "Trading", "Technology", "Adoption", "News", "Learning Resources"
  ];
  
  // Featured content that can be referenced
  const featuredContent = [
    { id: 1, title: "Bitcoin Basics Course", type: "course", icon: <BookOpen className="h-4 w-4" /> },
    { id: 2, title: "HODLing Like a Pro", type: "course", icon: <BookOpen className="h-4 w-4" /> },
    { id: 3, title: "Wallet Security Guide", type: "guide", icon: <BookOpen className="h-4 w-4" /> },
    { id: 4, title: "Bitcoin Price Chart", type: "tool", icon: <LinkIcon className="h-4 w-4" /> },
    { id: 5, title: "AI Technical Analysis", type: "tool", icon: <LinkIcon className="h-4 w-4" /> },
    { id: 6, title: "Bitcoin Halving Explained", type: "video", icon: <Video className="h-4 w-4" /> }
  ];
  
  // Top donors
  const topDonors = [
    { username: "SatoshiFan123", amount: 0.01, date: "May 8, 2025" },
    { username: "BitcoinBaron", amount: 0.005, date: "May 5, 2025" },
    { username: "HODLQueen", amount: 0.0025, date: "May 3, 2025" }
  ];
  
  // Recent donations
  const recentDonations = [
    { amount: 0.001, date: "May 10, 2025" },
    { amount: 0.0005, date: "May 9, 2025" },
    { amount: 0.0015, date: "May 8, 2025" }
  ];
  
  // Filter posts based on search query and category
  const filteredPosts = (forumPosts as ForumPost[])?.filter(post => {
    const matchesSearch = searchQuery.trim() === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || 
      post.categories.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  });
  
  // Handle sending a chat message
  const handleSendChatMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        {
          id: chatMessages.length + 1,
          author: "You",
          content: chatMessage,
          time: "Just now"
        },
        ...chatMessages
      ]);
      setChatMessage("");
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  // Copy bitcoin address to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  
  const bitcoinWalletAddress = "bc1qzruh63v7a54qh60n3yg4h8z4dz5l2k4r0gn309";
  
  return (
    <TooltipProvider>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Community Forum</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Join discussions with other Bitcoin enthusiasts
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="hidden md:flex items-center" 
            onClick={() => setShowChatPanel(!showChatPanel)}
          >
            <MessageSquareText className="h-4 w-4 mr-2" />
            Live Chat
            <span className="ml-2 bg-primary/20 px-1.5 py-0.5 rounded-full text-xs text-primary">3</span>
          </Button>
          <Button 
            onClick={() => setShowDonationModal(true)} 
            variant="default" 
            className="hidden md:flex items-center"
          >
            <Gift className="h-4 w-4 mr-2" />
            Support BitcoinCentral
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content area */}
        <div className={`lg:col-span-${showChatPanel ? '3' : '3'}`}>
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
                <Button 
                  className="ml-4" 
                  onClick={() => setShowNewPostForm(!showNewPostForm)}
                >
                  {showNewPostForm ? 'Cancel' : 'New Post'}
                </Button>
              </div>
            </CardHeader>
            
            {showNewPostForm && (
              <CardContent className="pt-4 pb-2 border-b border-muted/20">
                <div className="space-y-4">
                  <div>
                    <Input
                      placeholder="Post Title"
                      className="border-muted/50 text-base font-medium"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Share your thoughts with the community..."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between">
                    <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                      <p className="text-sm text-muted-foreground">Reference Content:</p>
                      <div className="relative inline-block">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <LinkIcon className="h-3.5 w-3.5 mr-1" />
                              Add Reference
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Reference BitcoinCentral content in your post
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      
                      <div className="relative inline-block">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              Select Category
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Categorize your post for better visibility
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Button type="submit">Post Discussion</Button>
                  </div>
                </div>
              </CardContent>
            )}
            
            <CardContent className="pb-4">
              <Tabs defaultValue="latest" className="w-full">
                <TabsList className="w-full bg-muted">
                  <TabsTrigger value="latest" className="flex-1">Latest</TabsTrigger>
                  <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
                  <TabsTrigger value="my-posts" className="flex-1">My Posts</TabsTrigger>
                  <TabsTrigger value="referenced" className="flex-1">Referenced</TabsTrigger>
                </TabsList>
                
                <TabsContent value="latest" className="mt-4 space-y-4">
                  {isLoading ? (
                    Array(5).fill(0).map((_, index) => (
                      <ForumPostSkeleton key={index} />
                    ))
                  ) : filteredPosts?.length ? (
                    filteredPosts.map((post) => (
                      <EnhancedForumPostCard key={post.id} post={post} />
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
                
                <TabsContent value="referenced" className="mt-4">
                  <div className="space-y-4">
                    <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">HODLing Like a Pro</h3>
                            <Badge variant="outline" className="text-xs">
                              Course
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Your millennial-friendly guide to Bitcoin - from crypto-curious to Bitcoin-savvy with zero corporate jargon.
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline" className="text-xs">Referenced 12 times</Badge>
                            <div className="flex -space-x-2">
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white ring-2 ring-background">JD</div>
                              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] text-white ring-2 ring-background">TS</div>
                              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white ring-2 ring-background">RK</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 border-t border-muted/30 pt-3">
                        <p className="text-xs text-muted-foreground font-medium mb-2">Posts referencing this content:</p>
                        <div className="space-y-2">
                          <div className="text-sm hover:underline cursor-pointer text-foreground/80 hover:text-primary">
                            "This course changed how I think about Bitcoin storage" - @CryptoNewbie
                          </div>
                          <div className="text-sm hover:underline cursor-pointer text-foreground/80 hover:text-primary">
                            "Best explanation of Lightning Network I've seen" - @BTCHodler
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                      <div className="flex items-start space-x-3">
                        <div className="bg-primary/20 p-2 rounded-lg">
                          <LinkIcon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-foreground">AI Technical Analysis</h3>
                            <Badge variant="outline" className="text-xs">
                              Tool
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            AI-powered technical analysis with pattern detection, RSI, MACD, and support/resistance levels.
                          </p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline" className="text-xs">Referenced 8 times</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Featured Content */}
          <Card className="bg-card mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-primary" />
                Featured Content
              </CardTitle>
              <CardDescription>
                Most referenced content from BitcoinCentral
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {featuredContent.map((content) => (
                  <div key={content.id} className="bg-muted/20 p-3 rounded-lg border border-muted/30 hover:border-primary/30 hover:bg-muted/30 cursor-pointer transition-colors">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="bg-primary/10 p-1 rounded-full">
                        {content.icon}
                      </div>
                      <span className="text-sm font-medium">{content.title}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">
                        {content.type}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <LinkIcon className="h-3 w-3" />
                        <span>{Math.floor(Math.random() * 15) + 1} references</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar with chat panel condition */}
        <div className="space-y-6">
          {/* Donation Card */}
          <Card className="bg-card border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Gift className="h-5 w-5 mr-2 text-primary" />
                Support BitcoinCentral
              </CardTitle>
              <CardDescription>
                Help us build the best Bitcoin resource
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3 space-y-3">
              <div className="bg-muted/20 p-3 rounded-lg border border-muted/30 text-center">
                <div className="text-xs text-muted-foreground mb-2">Donate Bitcoin to:</div>
                <div className="font-mono text-sm bg-background p-2 rounded border border-muted flex items-center justify-between">
                  <span className="truncate mr-2">{bitcoinWalletAddress}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0" 
                        onClick={() => copyToClipboard(bitcoinWalletAddress)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy address</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowDonationModal(true)}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Show QR Code
              </Button>
            </CardContent>
            <CardFooter className="pt-0 pb-3">
              <div className="w-full text-xs text-muted-foreground">
                <div className="flex items-center justify-between mb-1">
                  <span>Donation Goal - May 2025</span>
                  <span>0.015 / 0.05 BTC</span>
                </div>
                <Progress value={30} className="h-1.5" />
              </div>
            </CardFooter>
          </Card>
          
          {/* Categories Card */}
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Categories</CardTitle>
              <CardDescription>Browse discussions by topic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge 
                    key={category} 
                    variant={category === selectedCategory ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategorySelect(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Community Stats */}
          <Card className="bg-card">
            <CardHeader className="pb-2">
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
          
          {/* Top Supporters */}
          <Card className="bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <BadgeCheck className="h-5 w-5 mr-2 text-primary" />
                Top Supporters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topDonors.map((donor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold text-sm mr-2">
                      {index + 1}
                    </div>
                    <span className="font-medium text-sm">{donor.username}</span>
                  </div>
                  <div className="text-sm font-mono text-muted-foreground">
                    {donor.amount} BTC
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Live Chat (collapsed mode) */}
          {!showChatPanel && (
            <Card className="bg-card md:hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg flex items-center">
                    <MessageSquareText className="h-5 w-5 mr-2 text-primary" />
                    Live Chat
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowChatPanel(true)}>
                    Open
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Join the real-time Bitcoin conversation
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Chat Panel (only when showChatPanel is true) */}
      {showChatPanel && (
        <Card className="fixed right-6 bottom-6 w-80 shadow-xl z-50 bg-card border-primary/20">
          <CardHeader className="pb-2 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center">
                <MessageSquareText className="h-4 w-4 mr-2 text-primary" />
                Live Chat
                <span className="ml-2 bg-primary/20 px-1.5 py-0.5 rounded-full text-xs text-primary">3 online</span>
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowChatPanel(false)}>
                &times;
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-2 h-80 overflow-y-auto">
            <div className="space-y-3">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.author === 'You' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-2 rounded-lg ${
                    msg.author === 'You' ? 'bg-primary/20 text-foreground' : 'bg-muted text-foreground'
                  }`}>
                    <div className="text-xs font-medium mb-1">
                      {msg.author === 'You' ? 'You' : msg.author}
                    </div>
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-xs text-muted-foreground mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="p-2 border-t">
            <div className="flex w-full space-x-2">
              <Input
                placeholder="Type a message..."
                className="flex-1 h-9"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage()}
              />
              <Button
                size="sm"
                className="h-9 px-2"
                onClick={handleSendChatMessage}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Donation Modal */}
      {showDonationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-card">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-primary" />
                  Support BitcoinCentral
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowDonationModal(false)}
                >
                  &times;
                </Button>
              </div>
              <CardDescription>
                Help us continue building the best Bitcoin resource
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="bg-white p-4 rounded-lg flex justify-center">
                {/* This would be a real QR code in production */}
                <div className="w-48 h-48 bg-muted/20 border-2 border-muted flex items-center justify-center">
                  <QrCode className="h-32 w-32 text-muted" />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Bitcoin Address:</p>
                <div className="font-mono text-sm bg-background p-2 rounded border border-muted flex items-center justify-between">
                  <span className="truncate mr-2">{bitcoinWalletAddress}</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0" 
                        onClick={() => copyToClipboard(bitcoinWalletAddress)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy address</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <div className="bg-muted/20 p-3 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Recent Donations</h3>
                <div className="space-y-2">
                  {recentDonations.map((donation, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{donation.date}</span>
                      <span className="font-mono">{donation.amount} BTC</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-muted/30">
                  <div className="flex items-center justify-between text-sm">
                    <span>Donation Goal - May 2025</span>
                    <span>0.015 / 0.05 BTC</span>
                  </div>
                  <Progress value={30} className="h-2 mt-2" />
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Donors receive a "Supporter" badge and access to exclusive community features.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <Button variant="outline" onClick={() => setShowDonationModal(false)}>
                Close
              </Button>
              <Button onClick={() => setShowDonationModal(false)}>
                I've Sent a Donation
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </TooltipProvider>
  );
};

interface ForumPostCardProps {
  post: ForumPost;
}

interface EnhancedForumPostCardProps {
  post: ForumPost;
}

// Enhanced forum post card with reactions and references
const EnhancedForumPostCard: React.FC<EnhancedForumPostCardProps> = ({ post }) => {
  const [reactionsExpanded, setReactionsExpanded] = useState(false);
  
  // Reactions data (simulated)
  const reactions = [
    { emoji: '👍', count: post.upvotes, type: 'like', active: false },
    { emoji: '💡', count: Math.floor(Math.random() * 8), type: 'insightful', active: false },
    { emoji: '🔥', count: Math.floor(Math.random() * 5), type: 'hot', active: false },
    { emoji: '❤️', count: Math.floor(Math.random() * 3), type: 'love', active: false },
  ];
  
  // Referenced content (simulated for some posts)
  const postIdNum = typeof post.id === 'string' ? parseInt(post.id, 10) : Number(post.id);
  const hasReference = postIdNum % 3 === 0; // Every third post has a reference
  const referenceType = hasReference ? (postIdNum % 2 === 0 ? 'course' : 'tool') : null;
  
  // Toggles the reaction panel
  const toggleReactions = () => {
    setReactionsExpanded(!reactionsExpanded);
  };
  
  const getReactionIcon = () => {
    if (reactionsExpanded) {
      return <span className="text-xs mr-1">🔽</span>;
    }
    return <ThumbsUp className="h-3 w-3 mr-1" />;
  };
  
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
              <p className="text-sm font-medium text-foreground">
                {post.author.username}
                {postIdNum % 5 === 0 && (
                  <span className="ml-2 bg-primary/20 px-1.5 py-0.5 rounded-full text-xs text-primary">
                    Supporter
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(post.createdAt)}</p>
            </div>
            <h3 className="text-base font-semibold text-foreground mt-1 hover:text-primary cursor-pointer">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
              {post.content}
            </p>
            
            {/* Referenced content */}
            {hasReference && (
              <div className="mt-3 bg-muted/20 border border-muted/30 rounded-md p-2">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary/10 p-1 rounded-full">
                    {referenceType === 'course' ? (
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <LinkIcon className="h-3.5 w-3.5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">
                        {referenceType === 'course' ? 'HODLing Like a Pro' : 'AI Technical Analysis'}
                      </p>
                      <Badge variant="outline" className="text-xs px-1.5 py-0 h-4">
                        {referenceType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {referenceType === 'course' 
                        ? 'Your millennial-friendly guide to Bitcoin investing' 
                        : 'AI-powered technical analysis with pattern detection and indicators'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex items-center mt-3 space-x-3">
              <button 
                className="text-xs text-muted-foreground hover:text-primary flex items-center" 
                onClick={toggleReactions}
              >
                {getReactionIcon()} React
              </button>
              <button className="text-xs text-muted-foreground hover:text-primary flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" /> {post.commentCount}
              </button>
              <button className="text-xs text-muted-foreground hover:text-primary flex items-center">
                <LinkIcon className="h-3 w-3 mr-1" /> Reference
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
            
            {/* Reactions panel */}
            {reactionsExpanded && (
              <div className="mt-2 pt-2 border-t border-muted/20">
                <div className="flex space-x-2">
                  {reactions.map((reaction) => (
                    <Tooltip key={reaction.type}>
                      <TooltipTrigger asChild>
                        <button className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
                          reaction.active ? 'bg-primary/20 text-primary' : 'bg-muted/30 hover:bg-muted/50'
                        }`}>
                          <span>{reaction.emoji}</span>
                          <span>{reaction.count}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{reaction.type === 'like' ? 'Like' : 
                           reaction.type === 'insightful' ? 'Insightful' : 
                           reaction.type === 'hot' ? 'Hot take' : 'Love it'}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import LearningModule from "@/components/LearningModule";
import { BookOpen, FileText, Code, PlayCircle, Search, BookmarkPlus, TrendingUp } from 'lucide-react';

// Comprehensive Bitcoin learning program for Baby Boomers and Millennials
const coursesData = [
  {
    id: "bitcoin-for-boomers-and-millennials",
    title: "Bitcoin for Baby Boomers & Millennials",
    description: "A comprehensive, accessible Bitcoin learning program designed for both Baby Boomers (clear, step-by-step guidance) and Millennials (interactive, engaging content). Learn from basics to practical applications.",
    lessons: [
      // Section 1: Introduction to Bitcoin and Cryptocurrency
      { id: "intro-1", title: "What is Bitcoin? Explained Like I'm Five", type: 'video', duration: "5 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=6jG7u4M3bEs", 
        content: "Bitcoin explained using simple analogies (e.g., Bitcoin as digital gold). Perfect for Baby Boomers who prefer clear, jargon-free explanations that relate to familiar concepts like gold and traditional banking." },
      
      { id: "intro-2", title: "Bitcoin for Beginners (2024)", type: 'video', duration: "7 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=LyE8oJ3fBys", 
        content: "Fast-paced, visually engaging overview covering Bitcoin's history and use cases. Designed for Millennials who appreciate quick, comprehensive introductions with modern presentation styles." },
      
      { id: "intro-3", title: "Cryptocurrency: The Future of Finance and Money", type: 'video', duration: "4 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=G4NsFAzJ7H4", 
        content: "Highlights real-world applications and the future potential of cryptocurrency, bridging generational interests by focusing on practical benefits both groups can appreciate." },
      
      { id: "intro-4", title: "Introduction to Bitcoin Quiz", type: 'quiz', duration: "10 min", completed: false, 
        content: "Interactive quiz testing basic Bitcoin knowledge: What is Bitcoin used for? Who created it? What technology powers it? Includes immediate feedback and explanations for wrong answers." },
      
      { id: "intro-5", title: "Bitcoin Fun Facts Activity", type: 'code', duration: "5 min", completed: false, 
        content: "Simple hands-on activity displaying interesting Bitcoin facts (e.g., '21 million Bitcoin limit'). Low-stakes coding introduction that appeals to Millennials while demystifying technology for Boomers." },
      
      // Section 2: How Blockchain Works
      { id: "blockchain-1", title: "Blockchain Explained in 7 Minutes", type: 'video', duration: "7 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=SSo_EIwHSd4", 
        content: "Uses animations and simple language to explain blockchain technology. Ideal for Baby Boomers with clear, visual explanations that avoid technical overload." },
      
      { id: "blockchain-2", title: "How Does a Blockchain Work? (TED-Ed)", type: 'video', duration: "6 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=3xGLc-zz9cA", 
        content: "Engaging and educational blockchain explanation appealing to Millennials' visual learning style. Uses modern presentation techniques and comprehensive coverage." },
      
      { id: "blockchain-3", title: "Bitcoin's Blockchain: A Deep Dive", type: 'video', duration: "10 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=bBC-nXj3Ng4", 
        content: "Slightly more technical content for Millennials who want deeper insights, but still accessible to those new to blockchain technology." },
      
      { id: "blockchain-4", title: "Blockchain Knowledge Quiz", type: 'quiz', duration: "10 min", completed: false, 
        content: "Tests core blockchain concepts: What is a blockchain? What ensures security? Who can view Bitcoin's blockchain? Provides clear feedback suitable for both generations." },
      
      { id: "blockchain-5", title: "Blockchain Transaction Simulator", type: 'code', duration: "10 min", completed: false, 
        content: "Interactive simulation of recording Bitcoin transactions in a blockchain log. Shows how transactions are recorded, engaging for Millennials and educational for Boomers." },
      
      // Section 3: Setting Up a Bitcoin Wallet
      { id: "wallet-1", title: "How to Set Up a Bitcoin Wallet", type: 'video', duration: "9 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=3x7bW6vV3iA", 
        content: "Step-by-step wallet setup guide perfect for Baby Boomers. Covers the process clearly without technical jargon, focusing on practical implementation." },
      
      { id: "wallet-2", title: "Best Bitcoin Wallets for Beginners", type: 'video', duration: "7 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=0vV7C7W3u0U", 
        content: "Compares different wallet types (hardware, software, custodial vs non-custodial) appealing to Millennials who want to understand their options and make informed decisions." },
      
      { id: "wallet-3", title: "Securing Your Bitcoin Wallet", type: 'video', duration: "5 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=4lQeS2h6k0I", 
        content: "Focuses on security best practices relevant for both generations. Covers private key management, backup procedures, and common security mistakes to avoid." },
      
      { id: "wallet-4", title: "Bitcoin Wallet Knowledge Check", type: 'quiz', duration: "10 min", completed: false, 
        content: "Tests wallet concepts: What are wallets used for? What is a private key? What are different wallet types? Reinforces security and setup knowledge." },
      
      { id: "wallet-5", title: "Mock Bitcoin Address Generator", type: 'code', duration: "5 min", completed: false, 
        content: "Generate a simulated Bitcoin address using code. Demonstrates address creation process, engaging for Millennials and demystifying wallet technology for Boomers." },
        
      // Section 4: Buying and Trading Bitcoin
      { id: "trading-1", title: "How to Buy Bitcoin for Beginners", type: 'video', duration: "9 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=jdW6o1lW0kQ", 
        content: "Step-by-step Bitcoin purchase process ideal for Baby Boomers. Covers trusted platforms, account setup, and safe buying practices with clear instructions." },
      
      { id: "trading-2", title: "Crypto Trading for Beginners", type: 'video', duration: "8 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=7gG5b6Y2j0U", 
        content: "Covers trading basics appealing to Millennials. Includes market analysis fundamentals, trading strategies, and platform navigation for modern investors." },
      
      { id: "trading-3", title: "Avoiding Crypto Scams", type: 'video', duration: "7 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=3f4lG4K1lYc", 
        content: "Practical safety tips for both generations. Covers common scam tactics, how to identify fraudulent platforms, and best practices for secure trading." },
      
      { id: "trading-4", title: "Trading and Safety Quiz", type: 'quiz', duration: "10 min", completed: false, 
        content: "Tests practical trading knowledge: Where to buy Bitcoin? What is dollar-cost averaging? Common scam tactics? Reinforces safe trading practices." },
      
      { id: "trading-5", title: "Bitcoin Purchase Calculator", type: 'code', duration: "5 min", completed: false, 
        content: "Simulate Bitcoin purchase calculations. Users input USD amount and BTC price to see how much Bitcoin they can buy. Practical for both generations." },
        
      // Section 5: Bitcoin Mining
      { id: "mining-1", title: "What is Bitcoin Mining?", type: 'video', duration: "6 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=GmOzih6I1zs", 
        content: "Simple explanation of Bitcoin mining perfect for Baby Boomers. Uses clear analogies and avoids technical complexity while explaining the mining concept." },
      
      { id: "mining-2", title: "Bitcoin Mining Explained (Technical)", type: 'video', duration: "8 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=e1vOIA3YZ6M", 
        content: "More technical mining details for Millennials who want to understand the mechanics, including hash functions, difficulty adjustment, and network security." },
      
      { id: "mining-3", title: "The Environmental Impact of Bitcoin Mining", type: 'video', duration: "6 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=4lQeS2h6k0I", 
        content: "Addresses modern environmental concerns about Bitcoin mining, engaging for Millennials interested in sustainability and energy usage topics." },
      
      { id: "mining-4", title: "Bitcoin Mining Knowledge Test", type: 'quiz', duration: "10 min", completed: false, 
        content: "Tests mining understanding: What is Bitcoin mining? What do miners receive? What are mining challenges? Covers both basic concepts and practical considerations." },
      
      { id: "mining-5", title: "Mining Reward Calculator", type: 'code', duration: "5 min", completed: false, 
        content: "Simulate mining reward calculations including block rewards and transaction fees. Helps both generations understand mining economics and incentives." }
    ],
    completed: 0,
    level: "Beginner to Intermediate",
    duration: "3-4 hours",
    coverImage: "https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "hodling-like-a-pro",
    title: "HODLing Like a Pro (Original Millennial Course)",
    description: "Your millennial-friendly guide to Bitcoin - from crypto-curious to Bitcoin-savvy with zero corporate jargon.",
    lessons: [
      
      { id: "hodl-4", title: "Sending and Receiving Bitcoin: Yeet Those Sats", type: 'reading', duration: "45 min", completed: false,
        content: "Time to get hands-on. Sending Bitcoin's easier than Venmo, but you gotta know the rules so you don't yeet your BTC into the void. We'll cover setting up a wallet (hot vs. cold, like your ex's mood swings), public and private keys (don't share your private key, ever), and how to send BTC without screwing it up (double-check that address, fam)." },
        
      { id: "hodl-5", title: "Transaction Fees and Confirmation Times", type: 'reading', duration: "35 min", completed: false,
        content: "Bitcoin's not instant like your Starbucks app, and fees can feel like a sneaky tax. Let's break down why miners pick transactions (hint: they like money), how to set fees so you're not waiting longer than a pizza delivery, and mempool vibes—where transactions chill before getting confirmed." },
        
      { id: "hodl-6", title: "Staying Safe: Don't Get Rekt by Scams", type: 'video', duration: "40 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=bBC-nXj3Ng4",
        content: "Crypto's the Wild West, and scammers are out here DMing you like fake Tinder matches. We'll teach you how to spot phishing sites and fake wallets, why 'send me BTC, I'll double it' is a lie (sorry, Elon imposters), and best practices for securing your stack (seed phrases, 2FA, don't flex on X)." },
        
      { id: "hodl-7", title: "Mining Deep Dive: How to Stack Sats the Hard Way", type: 'video', duration: "50 min", completed: false, videoUrl: "https://www.youtube.com/watch?v=XfcvX0P1b5g",
        content: "Mining's not just for nerds with GPU rigs anymore, but it's still a flex to understand it. We'll dig into Proof-of-Work and why it's Bitcoin's security sauce, how miners compete (it's like a math Hunger Games), and why mining at home is probably a losing bet unless you've got free electricity." },
        
      { id: "hodl-8", title: "Lightning Network: Bitcoin's Fast Pass", type: 'reading', duration: "40 min", completed: false,
        content: "Bitcoin's great, but it's not built for buying lattes—unless you're on the Lightning Network. This layer-2 tech is like Bitcoin's cheat code for speed and low fees. We'll cover how Lightning works (off-chain magic, don't sweat the details), setting up a Lightning wallet (it's like Venmo but crypto), and why this is the future for microtransactions and tipping on X." },
        
      { id: "hodl-9", title: "Bitcoin's Big Picture: HODL or Nah?", type: 'quiz', duration: "45 min", completed: false,
        content: "Let's zoom out. Is Bitcoin gonna moon, or is it just hype? We'll talk Bitcoin as a store of value vs. digital cash, risks (volatility, regulations, your mom saying it's a scam), and how to HODL like a pro and not panic-sell when X is full of FUD." }
    ],
    completed: 0,
    level: "Beginner",
    duration: "4-6 hours",
    coverImage: "https://images.unsplash.com/photo-1516245834210-c4c142787335?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "bitcoin-basics",
    title: "Bitcoin Basics",
    description: "Learn the fundamentals of Bitcoin, blockchain technology, and how the network functions.",
    lessons: [
      { id: "btc-basics-1", title: "What is Bitcoin?", type: 'video', duration: "8 min", completed: true, videoUrl: "https://example.com/videos/bitcoin-intro" },
      { id: "btc-basics-2", title: "Blockchain Fundamentals", type: 'reading', duration: "12 min", completed: true },
      { id: "btc-basics-3", title: "Decentralization Explained", type: 'video', duration: "10 min", completed: false },
      { id: "btc-basics-4", title: "Bitcoin Transactions", type: 'reading', duration: "15 min", completed: false },
      { id: "btc-basics-5", title: "Knowledge Check", type: 'quiz', duration: "5 min", completed: false }
    ],
    completed: 2,
    level: "Beginner",
    duration: "45 minutes",
    coverImage: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "wallet-security",
    title: "Wallet Security",
    description: "Discover best practices for securing your Bitcoin wallet and protecting your assets.",
    lessons: [
      { id: "wallet-sec-1", title: "Types of Bitcoin Wallets", type: 'reading', duration: "8 min", completed: false },
      { id: "wallet-sec-2", title: "Private Keys & Seed Phrases", type: 'video', duration: "10 min", completed: false },
      { id: "wallet-sec-3", title: "Hardware Wallet Setup", type: 'video', duration: "7 min", completed: false },
      { id: "wallet-sec-4", title: "Security Best Practices", type: 'quiz', duration: "5 min", completed: false }
    ],
    completed: 0,
    level: "Beginner",
    duration: "30 minutes",
    coverImage: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "trading-strategies",
    title: "Trading Strategies",
    description: "Explore different approaches to Bitcoin trading and investment strategies.",
    lessons: [
      { id: "trading-1", title: "Market Analysis Basics", type: 'reading', duration: "15 min", completed: false },
      { id: "trading-2", title: "Technical Indicators", type: 'video', duration: "12 min", completed: false },
      { id: "trading-3", title: "Reading Chart Patterns", type: 'reading', duration: "10 min", completed: false },
      { id: "trading-4", title: "Risk Management", type: 'video', duration: "8 min", completed: false },
      { id: "trading-5", title: "Building a Trading Plan", type: 'reading', duration: "10 min", completed: false },
      { id: "trading-6", title: "Strategy Assessment", type: 'quiz', duration: "5 min", completed: false }
    ],
    completed: 0,
    level: "Intermediate",
    duration: "60 minutes",
    coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "blockchain-technology",
    title: "Blockchain Technology",
    description: "Deep dive into the blockchain technology that powers Bitcoin and other cryptocurrencies.",
    lessons: [
      { id: "blockchain-1", title: "Blockchain Architecture", type: 'reading', duration: "12 min", completed: false },
      { id: "blockchain-2", title: "Consensus Mechanisms", type: 'video', duration: "15 min", completed: false },
      { id: "blockchain-3", title: "Mining Process", type: 'reading', duration: "10 min", completed: false },
      { id: "blockchain-4", title: "Hash Functions", type: 'code', duration: "15 min", completed: false },
      { id: "blockchain-5", title: "Smart Contracts", type: 'reading', duration: "12 min", completed: false },
      { id: "blockchain-6", title: "Building a Simple Blockchain", type: 'code', duration: "20 min", completed: false },
      { id: "blockchain-7", title: "Scalability Solutions", type: 'video', duration: "10 min", completed: false },
      { id: "blockchain-8", title: "Final Assessment", type: 'quiz', duration: "10 min", completed: false }
    ],
    completed: 0,
    level: "Advanced",
    duration: "90 minutes",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  }
];

const Learn = () => {
  const [activeView, setActiveView] = useState<'courses' | 'module'>('courses');
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('courses');
  
  const { isLoading } = useQuery({
    queryKey: ["/api/learning/courses"],
    refetchOnWindowFocus: false,
  });
  
  const handleCourseSelect = (courseId: string) => {
    const course = coursesData.find(c => c.id === courseId);
    if (course) {
      setActiveCourse(course);
      setActiveView('module');
    }
  };
  
  const handleBackToCourses = () => {
    setActiveView('courses');
    setActiveCourse(null);
  };
  
  return (
    <>
      {activeView === 'courses' ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Learning Hub</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Expand your Bitcoin knowledge with our educational resources
              </p>
            </div>
            
            <div className="hidden md:flex space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search courses..." 
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-md border border-input bg-background"
                />
              </div>
              <Button variant="outline" size="sm" className="ml-2">
                <BookmarkPlus className="h-4 w-4 mr-2" />
                My Courses
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="courses">All Courses</TabsTrigger>
              <TabsTrigger value="progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="path">Learning Paths</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  // Loading state
                  Array(4).fill(0).map((_, index) => (
                    <CourseSkeleton key={index} />
                  ))
                ) : (
                  // Course cards
                  coursesData.map((course) => (
                    <Card 
                      key={course.id} 
                      className="overflow-hidden bg-card hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => handleCourseSelect(course.id)}
                    >
                      <div className="h-40 relative">
                        <img 
                          src={course.coverImage} 
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant={
                            course.level === "Beginner" ? "default" : 
                            course.level === "Intermediate" ? "secondary" : 
                            "outline"
                          }>
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <span className="text-xs text-muted-foreground">{course.duration}</span>
                        </div>
                        <CardDescription>{course.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Progress</span>
                            <span className="text-primary">{course.completed}/{course.lessons.length} lessons</span>
                          </div>
                          <Progress 
                            value={(course.completed / course.lessons.length) * 100} 
                            className="h-2 bg-muted" 
                          />
                          
                          <Button 
                            className="w-full mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCourseSelect(course.id);
                            }}
                          >
                            {course.completed > 0 ? "Continue Learning" : "Start Course"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="progress">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No courses in progress</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  You haven't started any courses yet. Browse our catalog and start learning today!
                </p>
                <Button className="mt-6" onClick={() => setActiveTab('courses')}>
                  Browse Courses
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="completed">
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No completed courses</h3>
                <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                  You haven't completed any courses yet. Keep learning to earn certificates and build your skills!
                </p>
                <Button className="mt-6" onClick={() => setActiveTab('courses')}>
                  Browse Courses
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="path">
              <Card className="p-6">
                <div className="max-w-2xl mx-auto text-center mb-8">
                  <h2 className="text-xl font-bold text-foreground mb-2">Bitcoin Expert Learning Path</h2>
                  <p className="text-muted-foreground">
                    Follow this structured learning path to become a Bitcoin expert. Complete all courses to earn a certificate.
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-muted/50"></div>
                  
                  <div className="space-y-8">
                    <PathItem 
                      number={1}
                      title="Bitcoin Basics"
                      description="Start with fundamental concepts about Bitcoin and blockchain."
                      status="in-progress"
                      progress={40}
                      onClick={() => handleCourseSelect("bitcoin-basics")}
                    />
                    
                    <PathItem 
                      number={2}
                      title="Wallet Security"
                      description="Learn to securely store and manage your Bitcoin."
                      status="locked"
                      onClick={() => handleCourseSelect("wallet-security")}
                    />
                    
                    <PathItem 
                      number={3}
                      title="Trading Strategies"
                      description="Discover different approaches to Bitcoin trading."
                      status="locked"
                      onClick={() => handleCourseSelect("trading-strategies")}
                    />
                    
                    <PathItem 
                      number={4}
                      title="Blockchain Technology"
                      description="Deep dive into the technical aspects of blockchain."
                      status="locked"
                      onClick={() => handleCourseSelect("blockchain-technology")}
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-foreground mb-4">Featured Resources</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ResourceCard 
                title="Bitcoin Whitepaper" 
                description="The original document by Satoshi Nakamoto that started it all."
                icon={<FileText className="h-5 w-5 text-primary" />}
              />
              <ResourceCard 
                title="Security Best Practices" 
                description="Essential tips to keep your Bitcoin investments safe."
                icon={<Code className="h-5 w-5 text-primary" />}
              />
              <ResourceCard 
                title="Technical Analysis Guide" 
                description="Learn how to read charts and analyze market trends."
                icon={<PlayCircle className="h-5 w-5 text-primary" />}
              />
            </div>
          </div>
        </>
      ) : (
        // Course module view
        <LearningModule
          id={activeCourse.id}
          title={activeCourse.title}
          description={activeCourse.description}
          lessons={activeCourse.lessons}
          level={activeCourse.level}
          duration={activeCourse.duration}
          coverImage={activeCourse.coverImage}
          completed={activeCourse.completed}
          onBack={handleBackToCourses}
        />
      )}
    </>
  );
};

const ResourceCard = ({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) => (
  <Card className="bg-card flex items-start p-4 hover:bg-muted/20 transition-colors cursor-pointer">
    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  </Card>
);

const PathItem = ({ 
  number, 
  title, 
  description, 
  status, 
  progress, 
  onClick 
}: { 
  number: number; 
  title: string; 
  description: string; 
  status: 'completed' | 'in-progress' | 'locked';
  progress?: number;
  onClick: () => void;
}) => {
  return (
    <div className="relative flex items-start pl-16" onClick={onClick}>
      <div className={`absolute left-0 top-0 w-16 h-16 rounded-full flex items-center justify-center z-10 
        ${status === 'completed' ? 'bg-green-500 text-white' : 
          status === 'in-progress' ? 'bg-primary text-primary-foreground' : 
          'bg-muted text-muted-foreground'}
      `}>
        <span className="text-xl font-bold">{number}</span>
      </div>
      
      <div className={`flex-1 p-4 rounded-lg border cursor-pointer transition-all
        ${status === 'locked' ? 'opacity-60 hover:opacity-80' : 'hover:shadow-md'}
        ${status === 'completed' ? 'border-green-500/50 bg-green-500/5' : 
          status === 'in-progress' ? 'border-primary/50 bg-primary/5' : 
          'border-muted bg-muted/5'}
      `}>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-medium">{title}</h3>
          <Badge variant={
            status === 'completed' ? 'default' : 
            status === 'in-progress' ? 'secondary' : 
            'outline'
          } className={
            status === 'completed' ? 'bg-green-500/20 text-green-500 border-green-500/20' : ''
          }>
            {status === 'completed' ? 'Completed' : 
             status === 'in-progress' ? 'In Progress' : 
             'Locked'}
          </Badge>
        </div>
        
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        
        {status === 'in-progress' && typeof progress === 'number' && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </div>
    </div>
  );
};

const CourseSkeleton = () => (
  <Card className="overflow-hidden bg-card">
    <Skeleton className="h-40 w-full" />
    <CardHeader className="pb-2">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6 mt-1" />
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full" />
        <Skeleton className="w-full h-9 mt-4" />
      </div>
    </CardContent>
  </Card>
);

export default Learn;

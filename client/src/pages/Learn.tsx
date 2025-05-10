import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const courses = [
  {
    id: "bitcoin-basics",
    title: "Bitcoin Basics",
    description: "Learn the fundamentals of Bitcoin, blockchain technology, and how the network functions.",
    lessons: 5,
    completed: 2,
    level: "Beginner",
    duration: "45 minutes",
    coverImage: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "wallet-security",
    title: "Wallet Security",
    description: "Discover best practices for securing your Bitcoin wallet and protecting your assets.",
    lessons: 4,
    completed: 0,
    level: "Beginner",
    duration: "30 minutes",
    coverImage: "https://images.unsplash.com/photo-1605792657660-596af9009e82?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "trading-strategies",
    title: "Trading Strategies",
    description: "Explore different approaches to Bitcoin trading and investment strategies.",
    lessons: 6,
    completed: 0,
    level: "Intermediate",
    duration: "60 minutes",
    coverImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  },
  {
    id: "blockchain-technology",
    title: "Blockchain Technology",
    description: "Deep dive into the blockchain technology that powers Bitcoin and other cryptocurrencies.",
    lessons: 8,
    completed: 0,
    level: "Advanced",
    duration: "90 minutes",
    coverImage: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
  }
];

const Learn = () => {
  const { isLoading } = useQuery({
    queryKey: ["/api/learning/courses"],
    refetchOnWindowFocus: false,
  });
  
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Learning Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Expand your Bitcoin knowledge with our educational resources
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading state
          Array(4).fill(0).map((_, index) => (
            <CourseSkeleton key={index} />
          ))
        ) : (
          // Course cards
          courses.map((course) => (
            <Card key={course.id} className="overflow-hidden bg-card hover:shadow-lg transition-shadow">
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
                    <span className="text-primary">{course.completed}/{course.lessons} lessons</span>
                  </div>
                  <Progress 
                    value={(course.completed / course.lessons) * 100} 
                    className="h-2 bg-muted" 
                  />
                  
                  <button className="w-full mt-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    {course.completed > 0 ? "Continue Learning" : "Start Course"}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-foreground mb-4">Featured Resources</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ResourceCard 
            title="Bitcoin Whitepaper" 
            description="The original document by Satoshi Nakamoto that started it all."
            icon="fas fa-file-pdf"
          />
          <ResourceCard 
            title="Security Best Practices" 
            description="Essential tips to keep your Bitcoin investments safe."
            icon="fas fa-shield-alt"
          />
          <ResourceCard 
            title="Technical Analysis Guide" 
            description="Learn how to read charts and analyze market trends."
            icon="fas fa-chart-line"
          />
        </div>
      </div>
    </>
  );
};

const ResourceCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
  <Card className="bg-card flex items-start p-4 hover:bg-muted/20 transition-colors">
    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
      <i className={`${icon} text-primary`}></i>
    </div>
    <div>
      <h3 className="font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  </Card>
);

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

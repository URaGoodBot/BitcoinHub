import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { LearningProgress as LearningProgressType } from "@/lib/types";

const LearningProgress = () => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ["/api/learning/progress"],
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return <LearningProgressSkeleton />;
  }
  
  const learningProgress = progress as LearningProgressType;
  const progressPercentage = learningProgress?.completed / learningProgress?.total * 100;
  
  return (
    <Card className="bg-card shadow-lg overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-muted/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Learning Hub</CardTitle>
        <Link href="/learn">
          <a className="text-sm text-primary hover:underline">All Courses</a>
        </Link>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-foreground">{learningProgress.courseName}</h4>
            <span className="text-xs text-muted-foreground">
              {learningProgress.completed}/{learningProgress.total} completed
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2 bg-muted" />
        </div>
        
        <div className="border-t border-muted/50 pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Recommended Lessons</h4>
          
          <div className="space-y-3">
            {learningProgress.lessons.map((lesson, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-muted rounded-md flex items-center justify-center mr-3">
                    <i className={`fas fa-${lesson.icon} text-primary`}></i>
                  </div>
                  <p className="text-sm text-foreground">{lesson.title}</p>
                </div>
                <p className="text-xs text-muted-foreground">{lesson.duration}</p>
              </div>
            ))}
          </div>
        </div>
        
        <Link href="/learn">
          <Button 
            variant="ghost" 
            className="w-full text-sm font-medium text-primary hover:text-foreground hover:bg-primary/10"
          >
            Continue Learning
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const LearningProgressSkeleton = () => (
  <Card className="bg-card shadow-lg overflow-hidden">
    <CardHeader className="py-4 px-6 border-b border-muted/50 flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-semibold">Learning Hub</CardTitle>
      <Skeleton className="h-4 w-20" />
    </CardHeader>
    
    <CardContent className="p-6 space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      
      <div className="border-t border-muted/50 pt-4">
        <Skeleton className="h-5 w-40 mb-3" />
        
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center">
                <Skeleton className="w-8 h-8 rounded-md mr-3" />
                <Skeleton className="h-5 w-32" />
              </div>
              <Skeleton className="h-4 w-10" />
            </div>
          ))}
        </div>
      </div>
      
      <Skeleton className="h-9 w-full rounded-md" />
    </CardContent>
  </Card>
);

export default LearningProgress;

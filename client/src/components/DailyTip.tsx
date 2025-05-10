import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { DailyTip as DailyTipType } from "@/lib/types";

const DailyTip = () => {
  const { data: tip, isLoading } = useQuery({
    queryKey: ["/api/tips/daily"],
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return <DailyTipSkeleton />;
  }
  
  const dailyTip = tip as DailyTipType;
  
  return (
    <Card className="bg-card shadow-lg overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-muted/50">
        <CardTitle className="text-lg font-semibold">Daily Bitcoin Tip</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <i className="fas fa-lightbulb text-primary text-2xl"></i>
          </div>
        </div>
        
        <h4 className="text-md font-semibold text-foreground text-center mb-3">
          {dailyTip.title}
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          {dailyTip.content}
        </p>
        
        <div className="flex justify-between items-center">
          <Button variant="link" className="text-sm font-medium text-primary p-0">
            More Tips
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground mr-2 h-8 w-8">
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8">
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DailyTipSkeleton = () => (
  <Card className="bg-card shadow-lg overflow-hidden">
    <CardHeader className="py-4 px-6 border-b border-muted/50">
      <CardTitle className="text-lg font-semibold">Daily Bitcoin Tip</CardTitle>
    </CardHeader>
    
    <CardContent className="p-6">
      <div className="flex justify-center mb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
      </div>
      
      <Skeleton className="h-6 w-48 mx-auto mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-3/4 mb-4" />
      
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-20" />
        <div className="flex items-center">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default DailyTip;

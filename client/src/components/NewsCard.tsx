import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Filter } from "lucide-react";
import { truncateText, formatRelativeTime } from "@/lib/utils";
import { NewsItem } from "@/lib/types";

const NewsCard = () => {
  const [filter, setFilter] = useState<string | null>(null);
  
  const { data: newsItems, isLoading, refetch } = useQuery({
    queryKey: ["/api/news", filter],
    refetchOnWindowFocus: false,
  });
  
  const handleRefresh = () => {
    refetch();
  };
  
  const toggleFilter = (category: string) => {
    if (filter === category) {
      setFilter(null);
    } else {
      setFilter(category);
    }
  };
  
  // Get unique categories across all news items
  const getCategories = () => {
    if (!newsItems) return [];
    const allCategories = (newsItems as NewsItem[]).flatMap(item => item.categories);
    return [...new Set(allCategories)];
  };
  
  return (
    <Card className="bg-card shadow-lg overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-muted/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Latest Bitcoin News</CardTitle>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setFilter(null)}>
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-5">
        {isLoading ? (
          <NewsCardSkeleton />
        ) : (
          <>
            {/* Optional filter badges */}
            {getCategories().length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {getCategories().map((category) => (
                  <Badge 
                    key={category}
                    variant={filter === category ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}
          
            {/* News items */}
            {(newsItems as NewsItem[])?.map((item, index) => (
              <div 
                key={item.id} 
                className={`${index < (newsItems as NewsItem[]).length - 1 ? 'border-b border-muted/50 pb-5' : ''}`}
              >
                <div className="flex">
                  {item.imageUrl && (
                    <div className="flex-shrink-0 w-24 h-16 mr-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-24 h-16 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-foreground hover:text-primary"
                    >
                      {item.title}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatRelativeTime(item.publishedAt)} • {item.source}
                    </p>
                    <div className="flex items-center space-x-3 mt-2">
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
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              variant="ghost" 
              className="w-full text-sm font-medium text-primary hover:text-foreground hover:bg-primary/10"
            >
              View All News
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const NewsCardSkeleton = () => (
  <>
    {[1, 2, 3].map((i) => (
      <div key={i} className="border-b border-muted/50 pb-5">
        <div className="flex">
          <Skeleton className="w-24 h-16 rounded mr-4" />
          <div className="flex-1">
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-3 w-28 mb-2" />
            <div className="flex items-center space-x-3 mt-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ))}
    <Skeleton className="h-9 w-full rounded-md" />
  </>
);

export default NewsCard;

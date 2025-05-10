import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Bolt } from "lucide-react";
import PriceTracker from "@/components/PriceTracker";
import NewsCard from "@/components/NewsCard";
import ForumPreview from "@/components/ForumPreview";
import PortfolioSummary from "@/components/PortfolioSummary";
import DailyTip from "@/components/DailyTip";
import AlertSettings from "@/components/AlertSettings";
import LearningProgress from "@/components/LearningProgress";
import { formatRelativeTime } from "@/lib/utils";

const Dashboard = () => {
  const { data: lastUpdated } = useQuery({
    queryKey: ["/api/last-updated"],
    refetchInterval: 60000, // Refetch every minute
  });
  
  return (
    <>
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Bitcoin Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Last updated: <span className="text-foreground">{formatRelativeTime(lastUpdated as string || new Date().toISOString())}</span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Bolt className="h-4 w-4 mr-2" />
              Set Price Alert
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column (2/3 width on md+) */}
        <div className="md:col-span-2 space-y-6">
          <PriceTracker />
          <NewsCard />
          <ForumPreview />
        </div>
        
        {/* Right column (1/3 width on md+) */}
        <div className="space-y-6">
          <PortfolioSummary />
          <DailyTip />
          <AlertSettings />
          <LearningProgress />
        </div>
      </div>
    </>
  );
};

export default Dashboard;

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Calendar, TrendingUp, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFedWatchData } from "@/lib/api";

interface FedWatchData {
  currentRate: string;
  nextMeeting: string;
  probabilities: Array<{
    rate: string;
    probability: number;
    label: string;
  }>;
  futureOutlook: {
    oneWeek: { noChange: number; cut: number; hike: number };
    oneMonth: { noChange: number; cut: number; hike: number };
  };
  lastUpdated: string;
}

const FedWatchTool = () => {
  const queryClient = useQueryClient();

  const { data: fedData, isLoading, error } = useQuery<FedWatchData>({
    queryKey: ['fed-watch-data'],
    queryFn: getFedWatchData,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: getFedWatchData,
    onSuccess: (data) => {
      queryClient.setQueryData(['fed-watch-data'], data);
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading Fed Watch data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !fedData) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load Fed Watch data</p>
            <Button 
              onClick={() => refreshMutation.mutate()} 
              disabled={refreshMutation.isPending}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Fed Watch Tool
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Next Meeting: {fedData.nextMeeting}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw className={`h-3 w-3 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Current Rate */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground mb-1">Current Target Rate</p>
          <p className="text-2xl font-mono font-bold text-foreground">{fedData.currentRate} bps</p>
        </div>

        {/* Probability Chart */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Rate Probabilities for Next Meeting</h4>
          <div className="space-y-2">
            {fedData.probabilities.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-20 text-xs text-muted-foreground">
                  {item.rate}
                </div>
                <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      item.rate === "425-450" ? "bg-blue-500" : "bg-blue-300"
                    }`}
                    style={{ width: `${item.probability}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {item.probability}%
                  </span>
                </div>
                <div className="w-16 text-xs text-muted-foreground">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Future Outlook */}
        <div>
          <h4 className="text-sm font-medium mb-3">Future Rate Expectations</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">1 Week Outlook</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>No Change</span>
                  <span className="font-mono">{fedData.futureOutlook.oneWeek.noChange}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Rate Cut</span>
                  <span className="font-mono text-green-600">{fedData.futureOutlook.oneWeek.cut}%</span>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-2">1 Month Outlook</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>No Change</span>
                  <span className="font-mono">{fedData.futureOutlook.oneMonth.noChange}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Rate Cut</span>
                  <span className="font-mono text-green-600">{fedData.futureOutlook.oneMonth.cut}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Rate Hike</span>
                  <span className="font-mono text-red-600">{fedData.futureOutlook.oneMonth.hike}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Data from St. Louis FRED. Fed rate changes significantly impact Bitcoin markets through liquidity and risk appetite.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(fedData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FedWatchTool;
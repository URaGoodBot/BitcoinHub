import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, RefreshCw, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TreasuryData {
  yield: number;
  change: number;
  percentChange: number;
  keyLevels: {
    low52Week: number;
    current: number;
    high52Week: number;
  };
  lastUpdated: string;
}

const TreasuryWidget = () => {
  const queryClient = useQueryClient();

  const { data: treasuryData, isLoading, error } = useQuery<TreasuryData>({
    queryKey: ['/api/financial/treasury'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/financial/treasury');
      if (!response.ok) {
        throw new Error('Failed to fetch Treasury data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/financial/treasury'], data);
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading Treasury data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !treasuryData) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load Treasury data</p>
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
            <DollarSign className="h-5 w-5 text-green-500" />
            U.S. 10 Year Treasury
          </h3>
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground">
              US10Y: Tradeweb
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

        {/* Current Yield */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-mono font-bold text-foreground">
              {treasuryData.yield.toFixed(3)}%
            </span>
            <div className={`flex items-center text-sm ${
              treasuryData.change >= 0 ? 'text-[hsl(var(--negative))]' : 'text-[hsl(var(--positive))]'
            }`}>
              {treasuryData.change >= 0 ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              {treasuryData.change.toFixed(3)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Yield | {new Date(treasuryData.lastUpdated).toLocaleTimeString()} EDT
          </p>
        </div>

        {/* Daily Change */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Daily Change</p>
            <p className={`text-lg font-mono font-bold ${
              treasuryData.change >= 0 ? 'text-[hsl(var(--negative))]' : 'text-[hsl(var(--positive))]'
            }`}>
              {treasuryData.change.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">% Change</p>
            <p className={`text-lg font-mono font-bold ${
              treasuryData.percentChange >= 0 ? 'text-[hsl(var(--negative))]' : 'text-[hsl(var(--positive))]'
            }`}>
              {treasuryData.percentChange.toFixed(2)}%
            </p>
          </div>
        </div>

        {/* Key Levels */}
        <div>
          <h4 className="text-sm font-medium mb-3">Key Levels</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">52W Low</p>
              <p className="text-sm font-mono font-bold text-red-400">
                {treasuryData.keyLevels.low52Week.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="text-sm font-mono font-bold text-foreground">
                {treasuryData.keyLevels.current.toFixed(3)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">52W High</p>
              <p className="text-sm font-mono font-bold text-green-400">
                {treasuryData.keyLevels.high52Week.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Information Note */}
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Higher Treasury yields often correlate with Bitcoin sell-offs as traditional assets become more attractive.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {new Date(treasuryData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryWidget;
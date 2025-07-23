import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ExternalLink, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: treasuryData, isLoading, refetch } = useQuery<TreasuryData>({
    queryKey: ['/api/financial/treasury'],
    refetchInterval: 60000, // Auto-refresh every minute
    refetchOnWindowFocus: true,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="h-12 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = treasuryData ? treasuryData.change >= 0 : false;
  const isPositivePercentChange = treasuryData ? treasuryData.percentChange >= 0 : false;

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            U.S. 10 Year Treasury
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="text-xs text-muted-foreground">
              Live data auto-updating
            </div>
            <a
              href="https://fred.stlouisfed.org/series/DGS10"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View FRED Source
            </a>
          </div>
        </div>

        {/* Current Yield */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-mono font-bold text-foreground">
              {treasuryData?.yield.toFixed(3)}%
            </span>
            <div className={`flex items-center text-sm ${
              isPositiveChange ? 'text-red-400' : 'text-green-400'
            }`}>
              {isPositiveChange ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              {isPositiveChange ? '+' : ''}{treasuryData?.change.toFixed(3)}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Yield | {treasuryData?.lastUpdated ? new Date(treasuryData.lastUpdated).toLocaleTimeString() : 'Loading...'} EDT
          </p>
        </div>

        {/* Daily Change */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Daily Change</p>
            <p className={`text-lg font-mono font-bold ${
              isPositiveChange ? 'text-red-400' : 'text-green-400'
            }`}>
              {isPositiveChange ? '+' : ''}{treasuryData?.change.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">% Change</p>
            <p className={`text-lg font-mono font-bold ${
              isPositivePercentChange ? 'text-red-400' : 'text-green-400'
            }`}>
              {isPositivePercentChange ? '+' : ''}{treasuryData?.percentChange.toFixed(2)}%
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
                {treasuryData?.keyLevels.low52Week.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Current</p>
              <p className="text-sm font-mono font-bold text-foreground">
                {treasuryData?.keyLevels.current.toFixed(3)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">52W High</p>
              <p className="text-sm font-mono font-bold text-green-400">
                {treasuryData?.keyLevels.high52Week.toFixed(2)}%
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
            <a
              href="https://fred.stlouisfed.org/series/DGS10"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View FRED data →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryWidget;
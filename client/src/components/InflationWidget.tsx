import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface InflationData {
  rate: number;
  change: number;
  lastUpdated: string;
  source: string;
}

export function InflationWidget() {
  const { data: inflation, isLoading, error } = useQuery<InflationData>({
    queryKey: ['/api/financial/inflation'],
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/financial/inflation'] });
  };

  const handleViewSource = () => {
    window.open('https://fred.stlouisfed.org/series/CPIAUCSL', '_blank');
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">US Inflation Rate</CardTitle>
          <Loader2 className="h-4 w-4 animate-spin" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Loading...</div>
          <p className="text-xs text-muted-foreground">
            Fetching FRED data...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">US Inflation Rate</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">Error</div>
          <p className="text-xs text-muted-foreground">
            Failed to fetch inflation data
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!inflation) {
    return null;
  }

  const isPositiveChange = inflation.change >= 0;
  const changeColor = isPositiveChange ? "text-red-600" : "text-green-600";
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;

  return (
    <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <CardTitle className="text-sm font-medium">US Inflation Rate</CardTitle>
          <Badge variant="outline" className="text-xs">
            YoY
          </Badge>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewSource}
            className="h-8 w-8 p-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {inflation.rate.toFixed(2)}%
            </div>
            <div className={`flex items-center text-sm ${changeColor}`}>
              <TrendIcon className="mr-1 h-3 w-3" />
              {isPositiveChange ? '+' : ''}{inflation.change.toFixed(3)}% monthly
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-xs">
              FRED API
            </Badge>
          </div>
        </div>
        <CardDescription className="mt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Consumer Price Index (CPI)</span>
            <span>Auto-updates every 5min</span>
          </div>
        </CardDescription>
      </CardContent>
    </Card>
  );
}
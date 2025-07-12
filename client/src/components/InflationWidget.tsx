import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface SectorInflation {
  name: string;
  rate: number;
  change: number;
  seriesId: string;
}

interface InflationData {
  overall: {
    rate: number;
    change: number;
    lastUpdated: string;
    comparisonPeriod: string;
  };
  sectors: SectorInflation[];
  source: string;
}

export function InflationWidget() {
  const [showSectors, setShowSectors] = useState(false);
  
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

  const toggleSectors = () => {
    console.log('Toggling sectors, current state:', showSectors);
    console.log('Sectors data:', inflation?.sectors);
    setShowSectors(!showSectors);
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

  const isPositiveChange = inflation.overall.change >= 0;
  const changeColor = isPositiveChange ? "text-red-600" : "text-green-600";
  const TrendIcon = isPositiveChange ? TrendingUp : TrendingDown;

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200">
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
              {inflation.overall.rate.toFixed(2)}%
            </div>
            <div className={`flex items-center text-sm ${changeColor}`}>
              <TrendIcon className="mr-1 h-3 w-3" />
              {isPositiveChange ? '+' : ''}{inflation.overall.change.toFixed(3)}% monthly
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Comparing {new Date(inflation.overall.lastUpdated).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} vs {new Date(inflation.overall.comparisonPeriod).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="text-xs">
              FRED API
            </Badge>
          </div>
        </div>
        
        {/* Sectors Toggle Button */}
        {inflation.sectors && inflation.sectors.length > 0 && (
          <div className="mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSectors}
              className="w-full justify-between text-xs hover:bg-muted/30"
            >
              <span>Sector Breakdown ({inflation.sectors.length} sectors) {showSectors ? '[OPEN]' : '[CLOSED]'}</span>
              {showSectors ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
          </div>
        )}
        
        {/* Sectors Details */}
        {showSectors && inflation.sectors && inflation.sectors.length > 0 && (
          <div className="mt-3 space-y-2 border-t pt-3 animate-in slide-in-from-top-2 duration-200">
            <div className="text-xs text-muted-foreground mb-2">
              Showing {inflation.sectors.length} inflation sectors:
            </div>
            {inflation.sectors.map((sector) => {
              const sectorIsPositive = sector.change >= 0;
              const sectorChangeColor = sectorIsPositive ? "text-red-600" : "text-green-600";
              const SectorTrendIcon = sectorIsPositive ? TrendingUp : TrendingDown;
              
              return (
                <div key={sector.seriesId} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/40 transition-colors">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{sector.name}</div>
                    <div className={`flex items-center text-xs ${sectorChangeColor}`}>
                      <SectorTrendIcon className="mr-1 h-2 w-2" />
                      {sectorIsPositive ? '+' : ''}{sector.change.toFixed(2)}% monthly
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {sector.rate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-muted-foreground">
            Debug: showSectors={showSectors ? 'true' : 'false'}, 
            sectors={inflation?.sectors ? inflation.sectors.length : 'undefined'}
          </div>
        )}
        
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
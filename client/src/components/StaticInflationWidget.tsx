import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

const StaticInflationWidget = () => {
  const [showSectors, setShowSectors] = useState(false);
  
  // Static inflation data
  const inflation = {
    overall: {
      rate: 2.38,
      change: 0.15,
      lastUpdated: "December 2024",
      comparisonPeriod: "Year-over-year"
    },
    sectors: [
      { name: "Food", rate: 2.8, change: 0.2, seriesId: "CUSR0000SAF" },
      { name: "Energy", rate: -1.2, change: -2.1, seriesId: "CUSR0000SA0E" },
      { name: "Housing", rate: 4.5, change: 0.1, seriesId: "CUSR0000SAH" },
      { name: "Transportation", rate: 0.9, change: -0.8, seriesId: "CUSR0000SAT" }
    ],
    source: "Federal Reserve Economic Data (FRED)"
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
        {isPositive ? '+' : ''}{change.toFixed(2)}%
      </span>
    );
  };

  return (
    <Card className="bg-card border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-600 rounded-lg">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">U.S. Inflation (CPI)</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {inflation.overall.comparisonPeriod}
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://fred.stlouisfed.org/series/CPIAUCSL', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-3 w-3" />
            FRED
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {inflation.overall.rate.toFixed(2)}%
            </div>
            <div className="text-sm">
              {formatChange(inflation.overall.change)}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Data Period</span>
            </div>
            <span className="text-sm font-semibold">{inflation.overall.lastUpdated}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSectors(!showSectors)}
            className="w-full flex items-center justify-center gap-2"
          >
            Sector Breakdown
            {showSectors ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>

          {showSectors && (
            <div className="space-y-3 pt-2 border-t border-muted">
              {inflation.sectors.map((sector, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium">{sector.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{sector.rate.toFixed(1)}%</span>
                    {formatChange(sector.change)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground mb-2">
              Source: {inflation.source}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticInflationWidget;
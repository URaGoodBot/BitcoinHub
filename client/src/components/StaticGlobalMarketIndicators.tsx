import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Globe, Zap, RefreshCw } from "lucide-react";

const StaticGlobalMarketIndicators = () => {
  // Static financial market data
  const marketData = {
    dxy: { value: 106.25, change: 0.12 },
    gold: { value: 2385.50, change: -0.85 },
    spx: { value: 5975.30, change: 1.24 },
    vix: { value: 14.2, change: -2.1 },
    lastUpdated: new Date().toLocaleString()
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const formatValue = (value: number, symbol: string) => {
    if (symbol === '$') {
      return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${value.toFixed(2)}`;
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
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Market Context
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col items-center space-y-2 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">DXY</span>
            </div>
            <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
              {formatValue(marketData.dxy.value, '')}
            </div>
            <div className="text-xs">
              {formatChange(marketData.dxy.change)}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Gold</span>
            </div>
            <div className="text-lg font-bold text-yellow-900 dark:text-yellow-100">
              {formatValue(marketData.gold.value, '$')}
            </div>
            <div className="text-xs">
              {formatChange(marketData.gold.change)}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-100">S&P 500</span>
            </div>
            <div className="text-lg font-bold text-green-900 dark:text-green-100">
              {formatValue(marketData.spx.value, '')}
            </div>
            <div className="text-xs">
              {formatChange(marketData.spx.change)}
            </div>
          </div>

          <div className="flex flex-col items-center space-y-2 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900 dark:text-purple-100">VIX</span>
            </div>
            <div className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {formatValue(marketData.vix.value, '')}
            </div>
            <div className="text-xs">
              {formatChange(marketData.vix.change)}
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Last updated: {marketData.lastUpdated}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticGlobalMarketIndicators;
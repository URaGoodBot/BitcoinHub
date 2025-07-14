import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ExternalLink, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const StaticTreasuryWidget = () => {
  // Static Treasury data
  const treasuryData = {
    yield: 4.35,
    change: 0.019,
    percentChange: 0.44,
    keyLevels: {
      low52Week: 3.78,
      current: 4.35,
      high52Week: 5.02
    },
    lastUpdated: new Date().toLocaleString()
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const isPositiveChange = treasuryData.change >= 0;

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-foreground">U.S. 10 Year Treasury</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open('https://www.marketwatch.com/investing/bond/tmubmusd10y', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-3 w-3" />
            MarketWatch
          </Button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-1">
              {treasuryData.yield.toFixed(3)}%
            </div>
            <div className={`flex items-center justify-center gap-1 text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              <span>{isPositiveChange ? '+' : ''}{treasuryData.change.toFixed(3)} ({isPositiveChange ? '+' : ''}{treasuryData.percentChange.toFixed(2)}%)</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">52-Week Range</span>
              <span className="font-medium">{treasuryData.keyLevels.low52Week}% - {treasuryData.keyLevels.high52Week}%</span>
            </div>
            
            <div className="relative">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full relative" 
                  style={{ 
                    width: `${((treasuryData.keyLevels.current - treasuryData.keyLevels.low52Week) / (treasuryData.keyLevels.high52Week - treasuryData.keyLevels.low52Week)) * 100}%` 
                  }}
                >
                  <div className="absolute right-0 top-0 w-2 h-2 bg-green-800 rounded-full"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{treasuryData.keyLevels.low52Week}%</span>
                <span>{treasuryData.keyLevels.high52Week}%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-muted">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current Position</span>
              <span className="font-medium">
                {(((treasuryData.keyLevels.current - treasuryData.keyLevels.low52Week) / (treasuryData.keyLevels.high52Week - treasuryData.keyLevels.low52Week)) * 100).toFixed(1)}% of range
              </span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Last updated: {treasuryData.lastUpdated}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2 flex items-center gap-2"
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

export default StaticTreasuryWidget;
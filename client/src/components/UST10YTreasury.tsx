import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useState, useEffect } from "react";

const UST10YTreasury = () => {
  // Mock data based on the screenshot - in production this would come from CNBC/Treasury API
  const [treasuryData, setTreasuryData] = useState({
    yield: 4.348,
    change: 0.055,
    changePercent: 1.28,
    lastUpdated: "2:30 PM EDT",
    isPositive: true
  });

  // Simulate real-time updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      // Small random fluctuations to simulate market movement
      const baseYield = 4.348;
      const randomChange = (Math.random() - 0.5) * 0.1; // ±0.05% range
      const newYield = Number((baseYield + randomChange).toFixed(3));
      const change = Number((newYield - baseYield).toFixed(3));
      const changePercent = Number(((change / baseYield) * 100).toFixed(2));
      
      setTreasuryData({
        yield: newYield,
        change: change,
        changePercent: Math.abs(changePercent),
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " EDT",
        isPositive: change >= 0
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatYield = (value: number) => `${value.toFixed(3)}%`;
  const formatChange = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(3)}`;

  return (
    <Card className="bg-card border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            U.S. 10 Year Treasury
          </h3>
          <div className="text-xs text-muted-foreground">
            US10Y:Tradeweb
          </div>
        </div>

        {/* Main Yield Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-3 mb-2">
            <h2 className="text-4xl font-mono font-bold text-foreground">
              {formatYield(treasuryData.yield)}
            </h2>
            <div className="flex items-center gap-1">
              {treasuryData.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-lg font-medium ${
                treasuryData.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatChange(treasuryData.change)}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Yield | {treasuryData.lastUpdated}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Daily Change</p>
            <p className={`text-lg font-mono font-bold ${
              treasuryData.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {formatChange(treasuryData.change)}
            </p>
          </div>
          
          <div className="bg-muted/20 rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">% Change</p>
            <p className={`text-lg font-mono font-bold ${
              treasuryData.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {treasuryData.isPositive ? '+' : '-'}{treasuryData.changePercent}%
            </p>
          </div>
        </div>

        {/* Key Levels */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Key Levels</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 bg-red-500/10 rounded">
              <p className="text-xs text-muted-foreground">52W Low</p>
              <p className="text-sm font-mono font-medium">3.650%</p>
            </div>
            <div className="text-center p-2 bg-muted/20 rounded">
              <p className="text-xs text-muted-foreground">Current</p>
              <p className="text-sm font-mono font-medium">{formatYield(treasuryData.yield)}</p>
            </div>
            <div className="text-center p-2 bg-green-500/10 rounded">
              <p className="text-xs text-muted-foreground">52W High</p>
              <p className="text-sm font-mono font-medium">4.750%</p>
            </div>
          </div>
        </div>

        {/* Impact Note */}
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 inline mr-1" />
            Higher Treasury yields often correlate with Bitcoin sell-offs as traditional assets become more attractive.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default UST10YTreasury;
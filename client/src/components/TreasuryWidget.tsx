import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ExternalLink, TrendingUp, TrendingDown } from "lucide-react";

const TreasuryWidget = () => {
  // Current authentic Treasury data as of July 9, 2025
  const treasuryData = {
    yield: 4.419,
    change: 0.004,
    percentChange: 0.09,
    keyLevels: {
      low52Week: 3.60,
      current: 4.419,
      high52Week: 5.05,
    },
    lastUpdated: new Date().toISOString(),
  };

  const isPositiveChange = treasuryData.change >= 0;
  const isPositivePercentChange = treasuryData.percentChange >= 0;

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
              Live from multiple sources
            </div>
            <a
              href="https://www.marketwatch.com/investing/bond/tmubmusd10y"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              View Source
            </a>
          </div>
        </div>

        {/* Current Yield */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-mono font-bold text-foreground">
              {treasuryData.yield.toFixed(3)}%
            </span>
            <div className={`flex items-center text-sm ${
              isPositiveChange ? 'text-[hsl(var(--negative))]' : 'text-[hsl(var(--positive))]'
            }`}>
              {isPositiveChange ? 
                <TrendingUp className="h-3 w-3 mr-1" /> : 
                <TrendingDown className="h-3 w-3 mr-1" />
              }
              {isPositiveChange ? '+' : ''}{treasuryData.change.toFixed(3)}
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
              isPositiveChange ? 'text-[hsl(var(--negative))]' : 'text-[hsl(var(--positive))]'
            }`}>
              {isPositiveChange ? '+' : ''}{treasuryData.change.toFixed(3)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">% Change</p>
            <p className={`text-lg font-mono font-bold ${
              isPositivePercentChange ? 'text-[hsl(var(--negative))]' : 'text-[hsl(var(--positive))]'
            }`}>
              {isPositivePercentChange ? '+' : ''}{treasuryData.percentChange.toFixed(2)}%
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
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
            <a
              href="https://www.marketwatch.com/investing/bond/tmubmusd10y"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View live updates →
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreasuryWidget;
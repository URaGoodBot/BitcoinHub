import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import StaticBitcoinMetricsGrid from "@/components/StaticBitcoinMetricsGrid";
import StaticGlobalMarketIndicators from "@/components/StaticGlobalMarketIndicators";
import StaticFedWatchTool from "@/components/StaticFedWatchTool";
import StaticTreasuryWidget from "@/components/StaticTreasuryWidget";
import StaticInflationWidget from "@/components/StaticInflationWidget";
import MarketSentimentStatic from "@/components/MarketSentimentStatic";
import AIAnalysisStatic from "@/components/AIAnalysisStatic";
import AITrendPredictionStatic from "@/components/AITrendPredictionStatic";
import StaticMarketSummaryWidget from "@/components/StaticMarketSummaryWidget";
import StaticDailyTipWidget from "@/components/StaticDailyTipWidget";
import { BitcoinMarketData } from "@/lib/types";

const StaticDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Static Bitcoin market data for immediate loading
  const bitcoinData = {
    current_price: { usd: 120154 },
    price_change_percentage_24h: 2.34,
    market_cap: { usd: 2400000000000 },
    total_volume: { usd: 67500000000 }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Remove loading state - dashboard loads immediately with static data

  const marketData = bitcoinData as BitcoinMarketData;
  const currentPrice = bitcoinData.current_price.usd;
  const priceChangePercentage = bitcoinData.price_change_percentage_24h;
  const isPositiveChange = priceChangePercentage >= 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-muted/20 pb-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-sm font-semibold text-muted-foreground">BITCOIN/USD</h1>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8" 
              onClick={handleRefresh}
            >
              <RefreshCw size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-mono font-bold text-foreground">
                {formatCurrency(currentPrice)}
              </h2>
              <div className="ml-4 flex items-center space-x-2">
                {isPositiveChange ? (
                  <ArrowUp className="text-[hsl(var(--positive))] h-6 w-6" />
                ) : (
                  <ArrowDown className="text-[hsl(var(--negative))] h-6 w-6" />
                )}
                <span className={`text-xl font-medium ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                  {formatPercentage(priceChangePercentage)}
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </header>
      
      {/* Bitcoin Metrics Grid */}
      <StaticBitcoinMetricsGrid />
      
      {/* Global Market Context */}
      <StaticGlobalMarketIndicators />
      
      {/* Financial Indicators Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <StaticFedWatchTool />
        <StaticTreasuryWidget />
        <StaticInflationWidget />
      </div>
      
      {/* Market Summary, AI Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StaticMarketSummaryWidget />
        <AITrendPredictionStatic />
      </div>
      
      {/* Market Sentiment Analysis */}
      <MarketSentimentStatic 
        marketData={marketData}
        isLoading={false}
      />
      
      {/* AI-powered Technical Analysis */}
      <AIAnalysisStatic 
        marketData={marketData} 
        isLoading={false}
        timeframe="1D"
      />
      
      {/* Daily Bitcoin Tip */}
      <StaticDailyTipWidget />
    </div>
  );
};

export default StaticDashboard;
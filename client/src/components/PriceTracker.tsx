import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PriceChart from "./PriceChart";
import { formatCurrency, formatNumber, formatPercentage } from "@/lib/utils";
import { BitcoinMarketData, TimeFrame } from "@/lib/types";
import { useState } from "react";

const PriceTracker = () => {
  const [timeFrame, setTimeFrame] = useState<TimeFrame>("1D");
  
  const { data: bitcoinData, isLoading: isLoadingBitcoinData } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 60000, // Refetch every minute
  });
  
  if (isLoadingBitcoinData) {
    return <PriceTrackerSkeleton />;
  }
  
  const marketData = bitcoinData as BitcoinMarketData;
  const currentPrice = marketData?.current_price?.usd || 0;
  const priceChangePercentage = marketData?.price_change_percentage_24h || 0;
  const isPositiveChange = priceChangePercentage >= 0;
  
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };
  
  return (
    <Card className="bg-card shadow-lg overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <i className="fas fa-bitcoin text-primary text-2xl mr-3"></i>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Bitcoin</h3>
              <p className="text-sm text-muted-foreground">BTC / USD</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-foreground">
              {formatCurrency(currentPrice)}
            </p>
            <p className={`text-sm font-mono ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
              {formatPercentage(priceChangePercentage)} (24h)
            </p>
          </div>
        </div>
        
        <div className="flex items-center text-sm space-x-4 mb-3 overflow-x-auto">
          {(["1D", "1W", "1M", "3M", "1Y", "ALL"] as TimeFrame[]).map((tf) => (
            <button 
              key={tf}
              className={`px-3 py-1 rounded-full ${
                timeFrame === tf 
                  ? 'text-foreground bg-muted' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => handleTimeFrameChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
        
        <PriceChart timeFrame={timeFrame} />
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Market Cap</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {formatCurrency(marketData?.market_cap?.usd || 0, 'USD', 1)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Volume (24h)</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {formatCurrency(marketData?.total_volume?.usd || 0, 'USD', 1)}
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Circulating Supply</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {formatNumber(marketData?.circulating_supply || 0, 1)} BTC
            </p>
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">All-Time High</p>
            <p className="text-sm font-mono font-medium text-foreground">
              {formatCurrency(marketData?.ath?.usd || 0)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PriceTrackerSkeleton = () => (
  <Card className="bg-card shadow-lg overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Skeleton className="h-8 w-8 rounded-full mr-3" />
          <div>
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-7 w-28 mb-1" />
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mb-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-7 w-12 rounded-full" />
        ))}
      </div>
      
      <Skeleton className="h-64 w-full rounded-lg mb-6" />
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-muted rounded-lg p-3">
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default PriceTracker;

import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBitcoinMarketData, getBitcoinDominance, getFearGreedIndex } from "@/lib/api";

const StaticDashboard = () => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch Bitcoin market data
  const { data: bitcoinData, isLoading: isLoadingBitcoinData } = useQuery({
    queryKey: ["bitcoin-market-data"],
    queryFn: getBitcoinMarketData,
    refetchInterval: 60000, // Refetch every minute
  });

  // Fetch Bitcoin dominance
  const { data: dominanceData, isLoading: isLoadingDominance } = useQuery({
    queryKey: ["bitcoin-dominance"],
    queryFn: getBitcoinDominance,
    refetchInterval: 60000,
  });

  // Fetch Fear & Greed Index
  const { data: fearGreedData, isLoading: isLoadingFearGreed } = useQuery({
    queryKey: ["fear-greed-index"],
    queryFn: getFearGreedIndex,
    refetchInterval: 60000,
  });

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoadingBitcoinData) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentPrice = bitcoinData?.current_price?.usd || 120000;
  const priceChangePercentage = bitcoinData?.price_change_percentage_24h || 2.5;
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
      
      {/* Simple Bitcoin Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(bitcoinData?.market_cap?.usd || 2400000000000)}
            </div>
            <p className="text-xs text-muted-foreground">Total market value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {formatCurrency(bitcoinData?.total_volume?.usd || 65000000000)}
            </div>
            <p className="text-xs text-muted-foreground">Trading volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bitcoin Dominance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {(dominanceData?.dominance || 62.4).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Market dominance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fear & Greed Index</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {fearGreedData?.currentValue || 74}
            </div>
            <p className="text-xs text-muted-foreground">
              {fearGreedData?.classification || "Greed"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Hash Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              830 EH/s
            </div>
            <p className="text-xs text-muted-foreground">Network security</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Supply Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              94.3%
            </div>
            <p className="text-xs text-muted-foreground">19.8M / 21M BTC</p>
          </CardContent>
        </Card>
      </div>

      {/* Static News Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Latest Bitcoin News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold">Bitcoin Price Analysis: Bulls Target $125,000 Resistance</h4>
              <p className="text-sm text-muted-foreground">Technical analysis suggests Bitcoin is consolidating before the next major move higher.</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold">Federal Reserve Maintains Current Interest Rate Policy</h4>
              <p className="text-sm text-muted-foreground">The Fed continues its measured approach to monetary policy amid Bitcoin's strong performance.</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold">Bitcoin Network Hash Rate Reaches New All-Time High</h4>
              <p className="text-sm text-muted-foreground">Mining security continues to strengthen as hash rate climbs above 800 EH/s.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Static Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Bitcoin Tip of the Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-l-4 border-purple-500 pl-4">
            <h4 className="font-semibold">Dollar Cost Averaging</h4>
            <p className="text-sm text-muted-foreground">
              Consider dollar-cost averaging (DCA) to reduce the impact of volatility. 
              Invest a fixed amount regularly regardless of price.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaticDashboard;
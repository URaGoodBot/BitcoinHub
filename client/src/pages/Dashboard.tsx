import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUp, ArrowDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BitcoinMarketData, ProcessedChartData } from "@/lib/types";
import AIAnalysis from "@/components/AIAnalysis";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

// Time frames for chart
const timeFrames = ["1m", "5m", "1h", "1d", "1w", "1mo"] as const;
type TimeFrame = typeof timeFrames[number];

const Dashboard = () => {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("1d");
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Auto-refresh timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(timer);
  }, []);
  
  // Bitcoin price data
  const { data: bitcoinData, isLoading: isLoadingBitcoinData, refetch: refetchBitcoinData } = useQuery({
    queryKey: ["/api/bitcoin/market-data", lastUpdate],
    refetchInterval: 10000, // Refetch every 10 seconds
  });
  
  // Chart data
  const { data: chartData, isLoading: isLoadingChartData } = useQuery({
    queryKey: ["/api/bitcoin/chart", selectedTimeFrame],
    refetchInterval: 60000, // Refetch every minute
  });

  // Handle manual refresh
  const handleRefresh = () => {
    refetchBitcoinData();
    setLastUpdate(new Date());
  };
  
  const marketData = bitcoinData as BitcoinMarketData;
  const processedChartData = chartData as ProcessedChartData[];
  
  const currentPrice = marketData?.current_price?.usd || 0;
  const priceChangePercentage = marketData?.price_change_percentage_24h || 0;
  const isPositiveChange = priceChangePercentage >= 0;
  
  // Format x-axis based on time frame
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    
    switch (selectedTimeFrame) {
      case "1m":
      case "5m":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      case "1h":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "1d":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "1w":
        return date.toLocaleDateString([], { weekday: 'short' });
      case "1mo":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border border-muted rounded shadow-sm">
          <p className="text-xs text-foreground">{new Date(data.timestamp).toLocaleString()}</p>
          <p className="text-lg font-semibold font-mono text-primary">
            {formatCurrency(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };
  
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
              <span className={`ml-3 text-lg font-mono ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                {formatPercentage(priceChangePercentage)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          
          <div className="hidden sm:block">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">24h High</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {formatCurrency(marketData?.high_24h?.usd || 0)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">24h Low</p>
                <p className="text-sm font-mono font-medium text-foreground">
                  {formatCurrency(marketData?.low_24h?.usd || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <Card className="bg-card shadow-lg overflow-hidden mb-6">
        <CardContent className="p-0">
          <div className="p-4 border-b border-muted/20">
            <Tabs defaultValue={selectedTimeFrame} onValueChange={(value) => setSelectedTimeFrame(value as TimeFrame)}>
              <div className="flex items-center justify-between">
                <TabsList className="h-8">
                  {timeFrames.map((tf) => (
                    <TabsTrigger key={tf} value={tf} className="text-xs px-3">
                      {tf.toUpperCase()}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                <div className="flex items-center space-x-2">
                  {isPositiveChange ? (
                    <ArrowUp className="text-[hsl(var(--positive))] h-4 w-4" />
                  ) : (
                    <ArrowDown className="text-[hsl(var(--negative))] h-4 w-4" />
                  )}
                  <span className={`text-sm ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                    {formatCurrency(Math.abs(currentPrice * priceChangePercentage / 100))}
                  </span>
                </div>
              </div>
              
              {timeFrames.map((tf) => (
                <TabsContent key={tf} value={tf} className="mt-0">
                  <div className="h-[500px] w-full">
                    {isLoadingChartData ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <p className="text-muted-foreground">Loading chart data...</p>
                      </div>
                    ) : !processedChartData || processedChartData.length === 0 ? (
                      <div className="h-full w-full flex items-center justify-center">
                        <p className="text-muted-foreground">No chart data available</p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={processedChartData}
                          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                        >
                          <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="timestamp" 
                            tickFormatter={formatXAxis} 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            minTickGap={30}
                          />
                          <YAxis 
                            domain={['auto', 'auto']}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            tickFormatter={(value) => `$${value.toLocaleString()}`}
                            orientation="right"
                            width={60}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke="hsl(var(--primary))" 
                            fillOpacity={1}
                            fill="url(#colorPrice)" 
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4">
            <div className="bg-muted/50 p-4 rounded">
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {formatCurrency(marketData?.market_cap?.usd || 0, 'USD', 0)}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded">
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {formatCurrency(marketData?.total_volume?.usd || 0, 'USD', 0)}
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded">
              <p className="text-xs text-muted-foreground">Circulating Supply</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {(marketData?.circulating_supply || 0).toLocaleString()} BTC
              </p>
            </div>
            <div className="bg-muted/50 p-4 rounded">
              <p className="text-xs text-muted-foreground">All-Time High</p>
              <p className="text-sm font-mono font-medium text-foreground">
                {formatCurrency(marketData?.ath?.usd || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* AI-powered Analysis Component */}
      <AIAnalysis 
        marketData={marketData} 
        isLoading={isLoadingBitcoinData}
        timeframe={selectedTimeFrame} 
      />
    </div>
  );
};

export default Dashboard;

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Clock, Calendar, Target } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

const MarketSummaryWidget = () => {
  const { data: bitcoinData, isLoading } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Market Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentPrice = (bitcoinData as any)?.current_price?.usd || 0;
  const priceChange24h = (bitcoinData as any)?.price_change_percentage_24h || 0;
  const high24h = (bitcoinData as any)?.high_24h?.usd || 0;
  const low24h = (bitcoinData as any)?.low_24h?.usd || 0;
  const marketCap = (bitcoinData as any)?.market_cap?.usd || 0;

  // Calculate key levels
  const range24h = high24h - low24h;
  const currentPosition = ((currentPrice - low24h) / range24h) * 100;
  
  const summaryItems = [
    {
      label: "24h Range Position",
      value: `${currentPosition.toFixed(1)}%`,
      description: `${formatCurrency(low24h)} - ${formatCurrency(high24h)}`,
      icon: <Target className="h-4 w-4" />,
    },
    {
      label: "Market Cap Rank",
      value: "#1",
      description: `${formatCurrency(marketCap, 'USD', 0)} total market cap`,
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      label: "Next Major Level",
      value: formatCurrency(110000),
      description: `${formatPercentage((110000 - currentPrice) / currentPrice * 100)} away`,
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Session Status",
      value: priceChange24h >= 0 ? "Bullish" : "Bearish",
      description: `${formatPercentage(priceChange24h)} in 24h`,
      icon: <Clock className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Market Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {summaryItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="text-muted-foreground mt-1">
                {item.icon}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="text-sm font-mono font-bold">{item.value}</span>
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
          
          <div className="pt-3 border-t border-muted/20">
            <div className="text-center">
              <div className="text-xs text-muted-foreground mb-1">Quick Insights</div>
              <div className="text-xs">
                {currentPosition > 80 ? "Near 24h high - potential resistance" :
                 currentPosition < 20 ? "Near 24h low - potential support" :
                 "Trading in mid-range - watch for breakout"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSummaryWidget;
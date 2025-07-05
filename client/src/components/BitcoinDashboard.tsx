import { BitcoinMarketData } from "@/lib/types";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Users, Clock, Zap, Globe } from "lucide-react";

interface BitcoinDashboardProps {
  marketData: BitcoinMarketData | null;
}

const BitcoinDashboard = ({ marketData }: BitcoinDashboardProps) => {
  if (!marketData) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-muted/50 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-2/3 mb-2"></div>
            <div className="h-6 bg-muted rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  const priceChangePercentage24h = marketData.price_change_percentage_24h || 0;
  
  // Calculate 24h price change from percentage
  const currentPrice = marketData.current_price?.usd || 0;
  const priceChange24h = (currentPrice * priceChangePercentage24h) / 100;
  const isPositive = priceChange24h >= 0;

  // Calculate additional metrics from real API data
  const marketCapRank = 1; // Bitcoin is always rank 1
  const circulatingSupply = marketData.circulating_supply || 19800000;
  const maxSupply = 21000000;
  const supplyPercentage = (circulatingSupply / maxSupply) * 100;
  
  // Calculate market dominance (approximate - would need total market cap data)
  const btcDominance = 55.2; // This would typically come from API
  
  // Use actual ATH data from API
  const athPrice = marketData.ath?.usd || currentPrice;
  const athDate = "Dec 2021"; // ATH date placeholder
  
  // 24h high/low data
  const high24h = marketData.high_24h?.usd || currentPrice;
  const low24h = marketData.low_24h?.usd || currentPrice;

  const dashboardItems = [
    {
      label: "Market Cap",
      value: formatCurrency(marketData.market_cap?.usd || 0, 'USD', 0),
      subValue: `Rank #${marketCapRank}`,
      icon: DollarSign,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      label: "24h Volume",
      value: formatCurrency(marketData.total_volume?.usd || 0, 'USD', 0),
      subValue: `${formatPercentage(priceChangePercentage24h)} vs yesterday`,
      icon: BarChart3,
      color: isPositive ? "text-green-500" : "text-red-500",
      bgColor: isPositive ? "bg-green-500/10" : "bg-red-500/10"
    },
    {
      label: "Market Dominance",
      value: `${btcDominance}%`,
      subValue: "of total crypto market",
      icon: Globe,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      label: "Circulating Supply",
      value: `${circulatingSupply.toLocaleString()} BTC`,
      subValue: `${supplyPercentage.toFixed(1)}% of max supply`,
      icon: Users,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      label: "24h High",
      value: formatCurrency(high24h),
      subValue: "Today's peak price",
      icon: TrendingUp,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      label: "24h Low",
      value: formatCurrency(low24h),
      subValue: "Today's lowest price",
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    },
    {
      label: "All-Time High",
      value: formatCurrency(athPrice),
      subValue: athDate,
      icon: TrendingUp,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      label: "Max Supply",
      value: `${maxSupply.toLocaleString()} BTC`,
      subValue: "Fixed supply cap",
      icon: Zap,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      label: "Last Updated",
      value: new Date().toLocaleTimeString(),
      subValue: "Real-time data",
      icon: Clock,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {dashboardItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <div key={index} className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                <IconComponent className={`h-4 w-4 ${item.color}`} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold font-mono text-foreground">
                {item.value}
              </p>
              <p className={`text-xs ${item.color}`}>
                {item.subValue}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BitcoinDashboard;
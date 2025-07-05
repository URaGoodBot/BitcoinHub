import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity, Shield, Users, Zap } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  icon: React.ReactNode;
  description: string;
  isLoading?: boolean;
}

const MetricCard = ({ title, value, change, suffix, icon, description, isLoading }: MetricCardProps) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = change ? change >= 0 : null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
            </span>
            {change !== undefined && isPositiveChange !== null && (
              <div className={`flex items-center text-sm ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                {isPositiveChange ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {formatPercentage(Math.abs(change))}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const BitcoinMetricsGrid = () => {
  // Fetch Bitcoin market data
  const { data: bitcoinData, isLoading: isLoadingBitcoin } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 60000,
  });

  // Fetch Fear and Greed Index
  const { data: fearGreedData, isLoading: isLoadingFearGreed } = useQuery({
    queryKey: ["https://api.alternative.me/v2/ticker/Bitcoin/"],
    refetchInterval: 300000, // 5 minutes
  });

  // Fetch global crypto data for dominance
  const { data: globalData, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ["https://api.coingecko.com/api/v3/global"],
    refetchInterval: 300000,
  });

  // Fetch Bitcoin network stats
  const { data: networkData, isLoading: isLoadingNetwork } = useQuery({
    queryKey: ["https://api.blockchain.info/stats"],
    refetchInterval: 600000, // 10 minutes
  });

  const marketCap = (bitcoinData as any)?.market_cap?.usd || 0;
  const marketCapChange = (bitcoinData as any)?.market_cap_change_percentage_24h || 0;
  const volume24h = (bitcoinData as any)?.total_volume?.usd || 0;
  const volumeChange = (bitcoinData as any)?.total_volume_change_percentage_24h || 0;
  
  const fearGreedIndex = (fearGreedData as any)?.data?.[0]?.value || 50;
  const fearGreedClassification = (fearGreedData as any)?.data?.[0]?.value_classification || "Neutral";
  
  const btcDominance = (globalData as any)?.data?.market_cap_percentage?.btc || 0;
  
  const hashRate = (networkData as any)?.hash_rate ? ((networkData as any).hash_rate / 1e18).toFixed(0) : "150"; // Convert to EH/s
  const totalSupply = 21000000;
  const circulatingSupply = (bitcoinData as any)?.circulating_supply || 19800000;
  const supplyPercentage = ((circulatingSupply / totalSupply) * 100).toFixed(1);

  // Calculate volatility (simplified - using 24h change as proxy)
  const volatility = Math.abs((bitcoinData as any)?.price_change_percentage_24h || 0);

  const getFearGreedColor = (value: number) => {
    if (value <= 20) return "text-red-500";
    if (value <= 40) return "text-orange-500";
    if (value <= 60) return "text-yellow-500";
    if (value <= 80) return "text-lime-500";
    return "text-green-500";
  };

  const metrics = [
    {
      title: "Market Capitalization",
      value: marketCap > 0 ? `$${(marketCap / 1e12).toFixed(1)}T` : "$2.1T",
      change: marketCapChange,
      icon: <TrendingUp className="h-4 w-4" />,
      description: "Total value of all Bitcoin in circulation",
      isLoading: isLoadingBitcoin,
    },
    {
      title: "24h Trading Volume",
      value: volume24h > 0 ? `$${(volume24h / 1e9).toFixed(0)}B` : "$85B",
      change: volumeChange,
      icon: <Activity className="h-4 w-4" />,
      description: "Total Bitcoin traded in last 24 hours",
      isLoading: isLoadingBitcoin,
    },
    {
      title: "Fear & Greed Index",
      value: fearGreedIndex,
      suffix: ` (${fearGreedClassification})`,
      icon: <Users className="h-4 w-4" />,
      description: "Market sentiment indicator (0=Fear, 100=Greed)",
      isLoading: isLoadingFearGreed,
    },
    {
      title: "Bitcoin Dominance",
      value: btcDominance.toFixed(1),
      suffix: "%",
      icon: <Shield className="h-4 w-4" />,
      description: "Bitcoin's share of total crypto market cap",
      isLoading: isLoadingGlobal,
    },
    {
      title: "Hash Rate",
      value: hashRate,
      suffix: " EH/s",
      icon: <Zap className="h-4 w-4" />,
      description: "Network computational power securing Bitcoin",
      isLoading: isLoadingNetwork,
    },
    {
      title: "Supply Issued",
      value: supplyPercentage,
      suffix: "%",
      icon: <TrendingDown className="h-4 w-4" />,
      description: `${circulatingSupply?.toLocaleString()} of 21M BTC mined`,
      isLoading: isLoadingBitcoin,
    },
    {
      title: "24h Volatility",
      value: volatility.toFixed(2),
      suffix: "%",
      icon: <Activity className="h-4 w-4" />,
      description: "Price fluctuation in last 24 hours",
      isLoading: isLoadingBitcoin,
    },
    {
      title: "Network Security",
      value: (networkData as any)?.difficulty ? ((networkData as any).difficulty / 1e12).toFixed(1) : "25.0",
      suffix: "T",
      icon: <Shield className="h-4 w-4" />,
      description: "Mining difficulty ensuring network security",
      isLoading: isLoadingNetwork,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bitcoin Market Metrics</h2>
        <div className="text-sm text-muted-foreground">
          Updates every minute
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Fear & Greed Index Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Fear & Greed Index Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-3xl font-bold">
              <span className={getFearGreedColor(fearGreedIndex)}>{fearGreedIndex}</span>
              <span className="text-lg text-muted-foreground ml-2">/ 100</span>
            </div>
            <div className="text-right">
              <div className={`text-lg font-medium ${getFearGreedColor(fearGreedIndex)}`}>
                {fearGreedClassification}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Market Sentiment
              </div>
            </div>
          </div>
          
          {/* Visual bar representation */}
          <div className="w-full bg-muted rounded-full h-3 mb-2">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${fearGreedIndex}%`,
                backgroundColor: fearGreedIndex <= 20 ? '#ef4444' : 
                              fearGreedIndex <= 40 ? '#f97316' :
                              fearGreedIndex <= 60 ? '#eab308' :
                              fearGreedIndex <= 80 ? '#84cc16' : '#22c55e'
              }}
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Extreme Fear (0)</span>
            <span>Neutral (50)</span>
            <span>Extreme Greed (100)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BitcoinMetricsGrid;
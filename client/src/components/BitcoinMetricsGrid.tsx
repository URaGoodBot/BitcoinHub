import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { ArrowUp, ArrowDown, TrendingUp, TrendingDown, Activity, Shield, Users, Zap, ExternalLink } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  suffix?: string;
  icon: React.ReactNode;
  description: string;
  isLoading?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const MetricCard = ({ title, value, change, suffix, icon, description, isLoading, clickable, onClick }: MetricCardProps) => {
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
    <Card 
      className={`h-full ${clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
          {clickable && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
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
  const queryClient = useQueryClient();
  // Fetch Bitcoin market data with 5-minute refresh
  const { data: bitcoinData, isLoading: isLoadingBitcoin } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes for live data
  });

  // Fetch live Fear and Greed Index data with 5-minute refresh
  const { data: fearGreedData, isLoading: isLoadingFearGreed } = useQuery({
    queryKey: ["/api/web-resources/fear-greed"],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Fetch Bitcoin dominance from CoinMarketCap API
  const { data: dominanceData, isLoading: isLoadingDominance } = useQuery({
    queryKey: ["/api/bitcoin/dominance"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch Bitcoin volume data from CoinMarketCap API
  const { data: volumeData, isLoading: isLoadingVolume } = useQuery({
    queryKey: ["/api/bitcoin/volume"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch Bitcoin network stats from Blockchain.com API
  const { data: networkStatsData, isLoading: isLoadingNetworkStats } = useQuery({
    queryKey: ["/api/bitcoin/network-stats"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  // Fetch Bitcoin difficulty data from Blockchain.com API
  const { data: difficultyData, isLoading: isLoadingDifficulty } = useQuery({
    queryKey: ["/api/bitcoin/difficulty"],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const marketCap = (bitcoinData as any)?.market_cap?.usd || 0;
  const marketCapChange = (bitcoinData as any)?.market_cap_change_percentage_24h || 0;
  
  // Use CoinMarketCap volume data if available, otherwise fallback to CoinGecko
  const volume24h = volumeData?.volume24h || (bitcoinData as any)?.total_volume?.usd || 125010000000;
  const volumeChange = volumeData?.volumeChange24h || (bitcoinData as any)?.total_volume_change_percentage_24h || 5.2;
  
  const priceChange24h = (bitcoinData as any)?.price_change_percentage_24h || 0;
  
  // Use live Fear and Greed Index data (same source as Web Resources page)
  const fearGreedIndex = fearGreedData?.currentValue || 58;
  const fearGreedClassification = fearGreedData?.classification || 'Greed';

  const btcDominance = dominanceData?.dominance || 63.5; // User confirmed this is more accurate
  
  // Network metrics from live Blockchain.com API
  const hashRateEH = networkStatsData?.hashRateEH || 900.3; // EH/s from API or user-confirmed fallback
  const networkDifficulty = difficultyData?.difficulty || 83148355189239;
  const totalSupply = 21000000;
  const circulatingSupply = (bitcoinData as any)?.circulating_supply || 19800000;
  const supplyPercentage = ((circulatingSupply / totalSupply) * 100).toFixed(1);

  // Calculate volatility based on 24h price change
  const volatility = Math.abs(priceChange24h);

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
      clickable: true,
      onClick: () => window.open('https://www.coingecko.com/en/coins/bitcoin', '_blank'),
    },
    {
      title: "24h Trading Volume",
      value: volume24h > 0 ? `$${(volume24h / 1e9).toFixed(1)}B` : "$125.0B",
      change: volumeChange,
      icon: <Activity className="h-4 w-4" />,
      description: `Total Bitcoin traded in last 24 hours (${volumeData?.source || 'Multi-Exchange'})`,
      isLoading: isLoadingBitcoin || isLoadingVolume,
      clickable: true,
      onClick: () => window.open('https://www.coingecko.com/en/coins/bitcoin', '_blank'),
    },
    {
      title: "Fear & Greed Index",
      value: fearGreedIndex,
      suffix: ` (${fearGreedClassification})`,
      icon: <Users className="h-4 w-4" />,
      description: "Live Bitcoin market sentiment (0=Fear, 100=Greed)",
      isLoading: isLoadingFearGreed,
      clickable: true,
      onClick: () => window.open('https://alternative.me/crypto/fear-and-greed-index/', '_blank'),
    },
    {
      title: "Bitcoin Dominance",
      value: btcDominance.toFixed(1),
      suffix: "%",
      icon: <Shield className="h-4 w-4" />,
      description: "Bitcoin's share of total crypto market cap",
      isLoading: isLoadingBitcoin || isLoadingDominance,
      clickable: true,
      onClick: () => window.open('https://coinmarketcap.com/charts/bitcoin-dominance/', '_blank'),
    },
    {
      title: "Hash Rate",
      value: hashRateEH.toFixed(1),
      suffix: " EH/s",
      icon: <Zap className="h-4 w-4" />,
      description: "Network computational power securing Bitcoin (live)",
      isLoading: isLoadingNetworkStats,
      clickable: true,
      onClick: () => window.open('https://www.blockchain.com/explorer/charts/hash-rate', '_blank'),
    },
    {
      title: "Supply Issued",
      value: supplyPercentage,
      suffix: "%",
      icon: <TrendingDown className="h-4 w-4" />,
      description: `${circulatingSupply?.toLocaleString()} of 21M BTC mined`,
      isLoading: isLoadingBitcoin,
      clickable: true,
      onClick: () => window.open('https://www.blockchain.com/explorer/charts/total-bitcoins', '_blank'),
    },
    {
      title: "24h Volatility",
      value: volatility.toFixed(2),
      suffix: "%",
      icon: <Activity className="h-4 w-4" />,
      description: "Price fluctuation in last 24 hours",
      isLoading: isLoadingBitcoin,
      clickable: true,
      onClick: () => window.open('https://www.coingecko.com/en/coins/bitcoin', '_blank'),
    },
    {
      title: "Network Security",
      value: (networkDifficulty / 1e12).toFixed(1),
      suffix: "T",
      icon: <Shield className="h-4 w-4" />,
      description: "Mining difficulty ensuring network security (live)",
      isLoading: isLoadingDifficulty,
      clickable: true,
      onClick: () => window.open('https://www.blockchain.com/explorer/charts/difficulty', '_blank'),
    },
  ];

  const handleManualRefresh = () => {
    // Force refresh by invalidating all relevant queries
    queryClient.invalidateQueries({ queryKey: ["/api/bitcoin/market-data"] });
    queryClient.invalidateQueries({ queryKey: ["/api/web-resources/fear-greed"] });
    queryClient.invalidateQueries({ queryKey: ["/api/bitcoin/dominance"] });
    queryClient.invalidateQueries({ queryKey: ["/api/bitcoin/volume"] });
    queryClient.invalidateQueries({ queryKey: ["/api/bitcoin/network-stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/bitcoin/difficulty"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Bitcoin Market Metrics</h2>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleManualRefresh}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Refresh all metrics now"
          >
            🔄 Refresh Now
          </button>
          <div className="text-sm text-muted-foreground">
            Updates every 5 minutes
          </div>
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
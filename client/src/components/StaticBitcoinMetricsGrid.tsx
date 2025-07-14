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
  clickable?: boolean;
  onClick?: () => void;
}

const MetricCard = ({ title, value, change, suffix, icon, description, clickable, onClick }: MetricCardProps) => {
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
            <span className="text-2xl font-bold">
              {typeof value === 'number' ? formatCurrency(value) : value}
              {suffix}
            </span>
            {change !== undefined && (
              <span className={`flex items-center text-sm ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                {isPositiveChange ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {formatPercentage(Math.abs(change))}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

const StaticBitcoinMetricsGrid = () => {
  // Static data for all Bitcoin metrics
  const staticData = {
    marketCap: 2400000000000,
    marketCapChange: 3.2,
    volume: 67500000000,
    volumeChange: -2.1,
    dominance: 62.5,
    dominanceChange: 0.8,
    fearGreed: 74,
    fearGreedChange: 3,
    hashRate: 900.3,
    hashRateChange: 5.2,
    difficulty: 83.1,
    difficultyChange: 2.1,
    supply: 19750000,
    networkSecurity: 99.98
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard
        title="Market Cap"
        value={staticData.marketCap}
        change={staticData.marketCapChange}
        icon={<TrendingUp className="h-4 w-4" />}
        description="Total market value of Bitcoin"
        clickable
        onClick={() => window.open('https://www.coingecko.com/en/coins/bitcoin', '_blank')}
      />
      
      <MetricCard
        title="24hr Volume"
        value={staticData.volume}
        change={staticData.volumeChange}
        icon={<Activity className="h-4 w-4" />}
        description="24-hour trading volume"
        clickable
        onClick={() => window.open('https://www.coingecko.com/en/coins/bitcoin', '_blank')}
      />
      
      <MetricCard
        title="BTC Dominance"
        value={staticData.dominance}
        change={staticData.dominanceChange}
        suffix="%"
        icon={<Shield className="h-4 w-4" />}
        description="Bitcoin's share of total crypto market"
        clickable
        onClick={() => window.open('https://www.coingecko.com/en/global_charts', '_blank')}
      />
      
      <MetricCard
        title="Fear & Greed"
        value={staticData.fearGreed}
        change={staticData.fearGreedChange}
        icon={<TrendingUp className="h-4 w-4" />}
        description={staticData.fearGreed >= 70 ? "Greed" : staticData.fearGreed >= 50 ? "Neutral" : "Fear"}
        clickable
        onClick={() => window.open('https://alternative.me/crypto/fear-and-greed-index/', '_blank')}
      />
      
      <MetricCard
        title="Hash Rate"
        value={`${staticData.hashRate} EH/s`}
        change={staticData.hashRateChange}
        icon={<Zap className="h-4 w-4" />}
        description="Network mining power"
        clickable
        onClick={() => window.open('https://www.blockchain.com/explorer/charts/hash-rate', '_blank')}
      />
      
      <MetricCard
        title="Network Security"
        value={`${staticData.difficulty}T`}
        change={staticData.difficultyChange}
        icon={<Shield className="h-4 w-4" />}
        description="Mining difficulty adjustment"
        clickable
        onClick={() => window.open('https://www.blockchain.com/explorer/charts/difficulty', '_blank')}
      />
      
      <MetricCard
        title="Circulating Supply"
        value={`${staticData.supply.toLocaleString()} BTC`}
        icon={<Users className="h-4 w-4" />}
        description="Total Bitcoin in circulation"
        clickable
        onClick={() => window.open('https://www.blockchain.com/explorer/charts/total-bitcoins', '_blank')}
      />
      
      <MetricCard
        title="Network Security"
        value={`${staticData.networkSecurity}%`}
        icon={<Shield className="h-4 w-4" />}
        description="Network uptime & security"
        clickable
        onClick={() => window.open('https://www.blockchain.com/explorer', '_blank')}
      />
    </div>
  );
};

export default StaticBitcoinMetricsGrid;
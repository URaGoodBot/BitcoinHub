import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  TrendingUp, 
  ExternalLink, 
  RefreshCw, 
  AlertTriangle,
  DollarSign,
  Calendar,
  Building
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface CongressionalTrade {
  representative: string;
  district: string;
  party: string;
  trade_date: string;
  disclosure_date: string;
  ticker: string;
  asset_description: string;
  transaction_type: string;
  amount: string;
  cap_gains_over_200_usd: boolean;
  ptr_link: string;
  comment?: string;
}

interface CryptoRelatedTrade extends CongressionalTrade {
  crypto_relevance: 'direct' | 'related' | 'infrastructure';
  bitcoin_impact_score: number;
}

interface HouseStockData {
  lastUpdated: string;
  totalTrades: number;
  cryptoTrades: CryptoRelatedTrade[];
  recentActivity: CongressionalTrade[];
  partyBreakdown: {
    democrat: number;
    republican: number;
    independent: number;
  };
  topCryptoTraders: Array<{
    name: string;
    party: string;
    district: string;
    cryptoTradeCount: number;
    totalValue: string;
    lastTradeDate: string;
  }>;
  fallbackData?: boolean;
}

const CongressionalCryptoTracker = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: congressData, isLoading, error } = useQuery<HouseStockData>({
    queryKey: ['/api/politics/congressional-trades'],
    refetchInterval: 30 * 60 * 1000, // Refetch every 30 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/politics/congressional-trades');
      if (!response.ok) {
        throw new Error('Failed to fetch Congressional trading data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/politics/congressional-trades'], data);
      setIsRefreshing(false);
    },
    onError: () => setIsRefreshing(false)
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    refreshMutation.mutate();
  };

  const getRelevanceBadge = (relevance: string, score: number) => {
    const config = {
      direct: { color: 'bg-orange-500 text-white', label: 'Direct Crypto' },
      related: { color: 'bg-blue-500 text-white', label: 'Crypto Related' },
      infrastructure: { color: 'bg-purple-500 text-white', label: 'Infrastructure' }
    };
    return config[relevance as keyof typeof config] || config.infrastructure;
  };

  const getPartyColor = (party: string) => {
    const normalized = party.toLowerCase().trim();
    if (normalized === 'democrat' || normalized === 'democratic') {
      return 'text-blue-400';
    } else if (normalized === 'republican') {
      return 'text-red-400';
    } else if (normalized === 'independent') {
      return 'text-gray-400';
    }
    // Fallback to first letter if exact match fails
    const firstLetter = normalized.charAt(0);
    if (firstLetter === 'd') return 'text-blue-400';
    if (firstLetter === 'r') return 'text-red-400';
    if (firstLetter === 'i') return 'text-gray-400';
    return 'text-gray-400';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2 text-muted-foreground">Loading Congressional trading data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !congressData) {
    return (
      <div className="space-y-6">
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load Congressional trading data</p>
              <Button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Fallback Data Warning */}
      {congressData.fallbackData && (
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Demo Data:</strong> Showing sample data due to upstream service unavailability. 
                Real-time data will appear when the service is restored.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Header and Stats */}
      <Card className="bg-card border">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Building className="h-6 w-6 text-blue-500" />
              Congressional Crypto Tracker
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Updated: {new Date(congressData.lastUpdated).toLocaleTimeString()}
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing}
                data-testid="refresh-congressional-trades"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Total Trades</p>
              <p className="text-2xl font-bold" data-testid="total-trades">
                {congressData.totalTrades.toLocaleString()}
              </p>
            </div>
            <div className="bg-orange-500/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Crypto Trades</p>
              <p className="text-2xl font-bold text-orange-400" data-testid="crypto-trades">
                {congressData.cryptoTrades.length}
              </p>
            </div>
            <div className="bg-blue-500/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Democrats</p>
              <p className="text-2xl font-bold text-blue-400">
                {congressData.partyBreakdown.democrat}
              </p>
            </div>
            <div className="bg-red-500/10 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Republicans</p>
              <p className="text-2xl font-bold text-red-400">
                {congressData.partyBreakdown.republican}
              </p>
            </div>
          </div>

          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <AlertTriangle className="h-3 w-3 inline mr-1" />
              Congressional crypto trades may signal policy shifts or insider knowledge. 
              Track when politicians buy/sell before major Bitcoin or crypto announcements.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Crypto Traders */}
      <Card className="bg-card border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-green-500" />
            Top Congressional Crypto Traders
          </h3>
          <div className="space-y-3">
            {congressData.topCryptoTraders.slice(0, 5).map((trader, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{trader.name}</span>
                    <span className={`text-xs font-bold ${getPartyColor(trader.party)}`}>
                      {trader.party.charAt(0)}
                    </span>
                    <span className="text-xs text-muted-foreground">{trader.district}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{trader.cryptoTradeCount} crypto trades</span>
                    <span>{trader.totalValue} total value</span>
                    <span>Last: {formatDate(trader.lastTradeDate)}</span>
                  </div>
                </div>
                <div className="text-lg font-bold text-muted-foreground">
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Crypto Trades */}
      <Card className="bg-card border">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Recent Crypto-Related Trades
          </h3>
          <div className="space-y-3">
            {congressData.cryptoTrades.slice(0, 10).map((trade, index) => {
              const relevanceBadge = getRelevanceBadge(trade.crypto_relevance, trade.bitcoin_impact_score);
              return (
                <div key={index} className="border border-muted/20 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{trade.representative}</span>
                        <span className={`text-xs font-bold ${getPartyColor(trade.party)}`}>
                          {trade.party.charAt(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">{trade.district}</span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${relevanceBadge.color}`}>
                          {relevanceBadge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-mono font-bold">{trade.ticker}</span>
                        <span className="text-muted-foreground">{trade.asset_description}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        trade.transaction_type === 'Purchase' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {trade.transaction_type}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(trade.trade_date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {trade.amount}
                      </span>
                      <span>Impact Score: {trade.bitcoin_impact_score}/10</span>
                      {trade.cap_gains_over_200_usd && (
                        <span className="text-orange-400">Capital Gains &gt; $200</span>
                      )}
                    </div>
                    <a
                      href={trade.ptr_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Filing
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Source */}
      <div className="text-center text-xs text-muted-foreground">
        Data from House Stock Watcher • Updated every 30 minutes • 
        <a 
          href="https://housestockwatcher.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 ml-1"
        >
          View Source →
        </a>
      </div>
    </div>
  );
};

export default CongressionalCryptoTracker;
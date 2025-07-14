import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Globe, Zap, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFinancialMarkets } from "@/lib/api";

interface FinancialMarketData {
  dxy: { value: number; change: number };
  gold: { value: number; change: number };
  spx: { value: number; change: number };
  vix: { value: number; change: number };
  lastUpdated: string;
}

const GlobalMarketIndicators = () => {
  const queryClient = useQueryClient();

  const { data: marketData, isLoading, error } = useQuery<FinancialMarketData>({
    queryKey: ['financial-markets'],
    queryFn: getFinancialMarkets,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: getFinancialMarkets,
    onSuccess: (data) => {
      queryClient.setQueryData(['financial-markets'], data);
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Market Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">Loading market data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !marketData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Market Context
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <p className="text-red-500 mb-4">Failed to load market data</p>
            <Button 
              onClick={() => refreshMutation.mutate()} 
              disabled={refreshMutation.isPending}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const indicators = [
    {
      title: "DXY (US Dollar Index)",
      value: marketData.dxy.value.toFixed(2),
      change: marketData.dxy.change,
      description: "Strong dollar often inversely correlates with Bitcoin",
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: "Gold (XAU/USD)",
      value: `$${marketData.gold.value.toLocaleString()}`,
      change: marketData.gold.change,
      description: "Digital gold vs traditional store of value",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      title: "SPX (S&P 500)",
      value: marketData.spx.value.toLocaleString(),
      change: marketData.spx.change,
      description: "Risk-on sentiment indicator for crypto markets",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: "VIX (Fear Index)",
      value: marketData.vix.value.toFixed(1),
      change: marketData.vix.change,
      description: "Market volatility and fear indicator",
      icon: <Zap className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Market Context
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => refreshMutation.mutate()}
            disabled={refreshMutation.isPending}
          >
            <RefreshCw className={`h-3 w-3 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {indicators.map((indicator, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                {indicator.icon}
                {indicator.title}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono font-bold">{indicator.value}</span>
                <div className={`flex items-center text-sm ${
                  indicator.change >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'
                }`}>
                  {indicator.change >= 0 ? 
                    <TrendingUp className="h-3 w-3 mr-1" /> : 
                    <TrendingDown className="h-3 w-3 mr-1" />
                  }
                  {Math.abs(indicator.change).toFixed(2)}%
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{indicator.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Last updated: {new Date(marketData.lastUpdated).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default GlobalMarketIndicators;
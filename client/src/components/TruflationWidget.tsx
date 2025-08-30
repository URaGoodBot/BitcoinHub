import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Clock, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TruflationData {
  current_rate: number;
  previous_rate: number;
  change: number;
  change_percent: number;
  bls_comparison: number;
  last_updated: string;
}

interface InflationComparison {
  truflation: {
    rate: number;
    change: number;
    last_updated: string;
  };
  bls_official: {
    rate: number;
    reported_by: string;
  };
  difference: {
    rate_diff: number;
    truflation_vs_bls: string;
  };
  update_frequency: {
    truflation: string;
    bls: string;
  };
}

export function TruflationWidget() {
  const [timeUntilRefresh, setTimeUntilRefresh] = useState(300); // 5 minutes in seconds

  // Fetch Truflation data with 5-minute refresh
  const { data: truflationData, refetch: refetchTruflation } = useQuery<TruflationData>({
    queryKey: ['/api/financial/truflation'],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Fetch comparison data
  const { data: comparisonData } = useQuery<InflationComparison>({
    queryKey: ['/api/financial/inflation-comparison'],
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Countdown timer for next refresh
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilRefresh(prev => {
        if (prev <= 1) {
          refetchTruflation();
          return 300; // Reset to 5 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [refetchTruflation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!truflationData) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
            Truflation US Inflation Index
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-8 bg-blue-200 rounded w-24"></div>
            <div className="h-4 bg-blue-200 rounded w-32"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isIncrease = truflationData.change > 0;
  const rateDifference = comparisonData?.difference.rate_diff || 0;

  return (
    <TooltipProvider>
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Truflation US Inflation Index
            </CardTitle>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Real-time inflation data updated daily, 45 days ahead of BLS reports</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Rate */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-blue-700">
                {truflationData.current_rate.toFixed(2)}%
              </div>
              <div className="text-sm text-blue-600">Current Rate</div>
            </div>
            <div className="text-right">
              <div className={`flex items-center ${isIncrease ? 'text-red-600' : 'text-green-600'}`}>
                {isIncrease ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                <span className="font-semibold">
                  {isIncrease ? '+' : ''}{truflationData.change.toFixed(2)}%
                </span>
              </div>
              <div className="text-xs text-muted-foreground">vs yesterday</div>
            </div>
          </div>

          {/* Comparison with BLS */}
          {comparisonData && (
            <div className="bg-white/60 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">vs BLS Official:</span>
                <span className="font-medium">
                  {comparisonData.bls_official.rate.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Difference:</span>
                <Badge 
                  variant={rateDifference < 0 ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {rateDifference > 0 ? '+' : ''}{rateDifference.toFixed(2)}%
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                Truflation: Daily updates • BLS: Monthly (45 days delayed)
              </div>
            </div>
          )}

          {/* Update Status */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Next update: {formatTime(timeUntilRefresh)}
            </div>
            <div>
              Updated: {new Date(truflationData.last_updated).toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
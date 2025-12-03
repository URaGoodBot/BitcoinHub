import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, DollarSign, Building2, Wallet, Info, RefreshCw } from 'lucide-react';

interface LiquidityIndicator {
  seriesId: string;
  name: string;
  shortName: string;
  value: number;
  previousValue: number;
  yoyChange: number;
  yoyChangePercent: number;
  date: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  unit: string;
  description: string;
  isAnomaly: boolean;
  anomalyThreshold: number;
}

interface LiquidityData {
  indicators: LiquidityIndicator[];
  anomalies: LiquidityIndicator[];
  summary: {
    totalIndicators: number;
    anomalyCount: number;
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    lastUpdated: string;
  };
}

function getIndicatorIcon(shortName: string) {
  switch (shortName) {
    case 'M2':
    case 'M1':
    case 'M0':
      return <DollarSign className="w-4 h-4" />;
    case 'Fed BS':
      return <Building2 className="w-4 h-4" />;
    case 'TGA':
    case 'Reserves':
      return <Wallet className="w-4 h-4" />;
    case 'RRP':
      return <RefreshCw className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
}

function formatValue(value: number, unit: string): string {
  if (unit === 'Millions USD') {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}T`;
    }
    return `$${(value / 1000).toFixed(1)}B`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`;
  }
  return `$${value.toFixed(1)}B`;
}

function IndicatorCard({ indicator }: { indicator: LiquidityIndicator }) {
  const isPositive = indicator.yoyChangePercent >= 0;
  const isAnomaly = indicator.isAnomaly;
  
  return (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        isAnomaly 
          ? 'border-orange-500/50 bg-orange-500/5' 
          : 'border-border/50 bg-card/50 hover:bg-card/80'
      }`}
      data-testid={`liquidity-indicator-${indicator.seriesId}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${isAnomaly ? 'bg-orange-500/20' : 'bg-muted'}`}>
            {getIndicatorIcon(indicator.shortName)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm" data-testid={`indicator-name-${indicator.seriesId}`}>
                {indicator.shortName}
              </span>
              {isAnomaly && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Anomaly
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{indicator.frequency}</span>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="font-semibold mb-1">{indicator.name}</p>
            <p className="text-xs text-muted-foreground">{indicator.description}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="space-y-1">
        <div className="text-xl font-bold font-mono" data-testid={`indicator-value-${indicator.seriesId}`}>
          {formatValue(indicator.value, indicator.unit)}
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span className="text-sm font-medium" data-testid={`indicator-yoy-${indicator.seriesId}`}>
              {isPositive ? '+' : ''}{indicator.yoyChangePercent.toFixed(1)}%
            </span>
          </div>
          <span className="text-xs text-muted-foreground">YoY</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Last updated: {new Date(indicator.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function SignalBadge({ signal }: { signal: 'bullish' | 'bearish' | 'neutral' }) {
  const config = {
    bullish: { label: 'Bullish', className: 'bg-green-500/10 text-green-500 border-green-500/20' },
    bearish: { label: 'Bearish', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
    neutral: { label: 'Neutral', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' }
  };
  
  return (
    <Badge variant="outline" className={config[signal].className}>
      {config[signal].label}
    </Badge>
  );
}

export default function LiquidityTracker() {
  const { data, isLoading, error } = useQuery<LiquidityData>({
    queryKey: ['/api/liquidity'],
    refetchInterval: 10 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card data-testid="card-liquidity-tracker">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            FRED Liquidity Tracker
          </CardTitle>
          <CardDescription>Money supply and Fed balance sheet indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card data-testid="card-liquidity-tracker">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            FRED Liquidity Tracker
          </CardTitle>
          <CardDescription>Money supply and Fed balance sheet indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Unable to load liquidity data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="card-liquidity-tracker">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              FRED Liquidity Tracker
            </CardTitle>
            <CardDescription>
              Real-time money supply and Federal Reserve balance sheet indicators
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <SignalBadge signal={data.summary.overallSignal} />
            {data.summary.anomalyCount > 0 && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {data.summary.anomalyCount} Anomal{data.summary.anomalyCount === 1 ? 'y' : 'ies'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {data.anomalies.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-sm text-orange-500">Anomaly Detection</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {data.anomalies.map((anomaly) => (
                <div key={anomaly.seriesId} className="flex items-center gap-2">
                  <span className="font-medium">{anomaly.name}:</span>
                  <span className={anomaly.yoyChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}>
                    {anomaly.yoyChangePercent >= 0 ? '+' : ''}{anomaly.yoyChangePercent.toFixed(1)}% YoY
                  </span>
                  <span className="text-xs text-muted-foreground">
                    (threshold: ±{anomaly.anomalyThreshold}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.indicators.map((indicator) => (
            <IndicatorCard key={indicator.seriesId} indicator={indicator} />
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Data source: Federal Reserve Economic Data (FRED)</span>
            <span>•</span>
            <span>Updates every 10 minutes</span>
          </div>
          <span>
            Last updated: {new Date(data.summary.lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

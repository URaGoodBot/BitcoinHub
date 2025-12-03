import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { TrendingUp, TrendingDown, AlertTriangle, Activity, DollarSign, Building2, Wallet, Info, RefreshCw, Gauge, Percent, PiggyBank, Calculator } from 'lucide-react';

interface LiquidityIndicator {
  seriesId: string;
  name: string;
  shortName: string;
  value: number;
  displayValue: string;
  previousValue: number;
  yoyChange: number;
  yoyChangePercent: number;
  date: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  unit: string;
  rawUnit: 'billions' | 'millions' | 'percent' | 'index';
  description: string;
  isAnomaly: boolean;
  anomalyThreshold: number;
  category: 'core' | 'velocity' | 'policy' | 'fed_holdings';
}

interface DerivedMetric {
  id: string;
  name: string;
  shortName: string;
  value: number;
  displayValue: string;
  description: string;
  isAnomaly: boolean;
  anomalyThreshold: number;
  formula: string;
}

interface LiquidityData {
  indicators: LiquidityIndicator[];
  derivedMetrics: DerivedMetric[];
  anomalies: LiquidityIndicator[];
  summary: {
    totalIndicators: number;
    anomalyCount: number;
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    signalReasons: string[];
    lastUpdated: string;
  };
}

function getIndicatorIcon(shortName: string, category: string) {
  switch (category) {
    case 'velocity':
      return <Gauge className="w-4 h-4" />;
    case 'policy':
      return <Percent className="w-4 h-4" />;
    case 'fed_holdings':
      return <PiggyBank className="w-4 h-4" />;
  }
  
  switch (shortName) {
    case 'M2':
    case 'M1':
    case 'M0':
    case 'Currency':
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

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'core': return 'Core Liquidity';
    case 'velocity': return 'Money Velocity';
    case 'policy': return 'Policy Rates';
    case 'fed_holdings': return 'Fed Holdings';
    default: return category;
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'core': return 'text-blue-500';
    case 'velocity': return 'text-purple-500';
    case 'policy': return 'text-amber-500';
    case 'fed_holdings': return 'text-emerald-500';
    default: return 'text-gray-500';
  }
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
            {getIndicatorIcon(indicator.shortName, indicator.category)}
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
          {indicator.displayValue}
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
          {new Date(indicator.date).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

function DerivedMetricCard({ metric }: { metric: DerivedMetric }) {
  return (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        metric.isAnomaly 
          ? 'border-orange-500/50 bg-orange-500/5' 
          : 'border-border/50 bg-card/50 hover:bg-card/80'
      }`}
      data-testid={`derived-metric-${metric.id}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-md ${metric.isAnomaly ? 'bg-orange-500/20' : 'bg-cyan-500/20'}`}>
            <Calculator className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{metric.shortName}</span>
              {metric.isAnomaly && (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Alert
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Derived</span>
          </div>
        </div>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p className="font-semibold mb-1">{metric.name}</p>
            <p className="text-xs text-muted-foreground mb-2">{metric.description}</p>
            <p className="text-xs font-mono text-cyan-400">Formula: {metric.formula}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="space-y-1">
        <div className="text-xl font-bold font-mono text-cyan-400">
          {metric.displayValue}
        </div>
        <div className="text-xs text-muted-foreground">
          Threshold: {metric.anomalyThreshold > 100 ? `<$${(metric.anomalyThreshold / 1000).toFixed(1)}T` : 
                     metric.anomalyThreshold > 10 ? `>${metric.anomalyThreshold}` : 
                     `>${metric.anomalyThreshold}x`}
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
    <Badge variant="outline" className={config[signal].className} data-testid="signal-badge">
      {config[signal].label}
    </Badge>
  );
}

function CategorySection({ category, indicators }: { category: string; indicators: LiquidityIndicator[] }) {
  if (indicators.length === 0) return null;
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${getCategoryColor(category)}`}>
          {getCategoryLabel(category)}
        </span>
        <div className="flex-1 h-px bg-border/50" />
        <span className="text-xs text-muted-foreground">{indicators.length} indicators</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {indicators.map((indicator) => (
          <IndicatorCard key={indicator.seriesId} indicator={indicator} />
        ))}
      </div>
    </div>
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
          <CardDescription>Money supply, velocity, and Fed balance sheet indicators</CardDescription>
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
          <CardDescription>Money supply, velocity, and Fed balance sheet indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            Unable to load liquidity data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  const coreIndicators = data.indicators.filter(i => i.category === 'core');
  const velocityIndicators = data.indicators.filter(i => i.category === 'velocity');
  const policyIndicators = data.indicators.filter(i => i.category === 'policy');
  const fedHoldingsIndicators = data.indicators.filter(i => i.category === 'fed_holdings');

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
              Real-time money supply, velocity, and Federal Reserve balance sheet indicators
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
      <CardContent className="space-y-6">
        {data.summary.signalReasons && data.summary.signalReasons.length > 0 && (
          <div className={`p-4 rounded-lg border ${
            data.summary.overallSignal === 'bullish' ? 'bg-green-500/5 border-green-500/20' :
            data.summary.overallSignal === 'bearish' ? 'bg-red-500/5 border-red-500/20' :
            'bg-muted/50 border-border/50'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {data.summary.overallSignal === 'bullish' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : data.summary.overallSignal === 'bearish' ? (
                <TrendingDown className="w-4 h-4 text-red-500" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
              <span className={`font-semibold text-sm ${
                data.summary.overallSignal === 'bullish' ? 'text-green-500' :
                data.summary.overallSignal === 'bearish' ? 'text-red-500' :
                'text-gray-400'
              }`}>
                Signal Analysis
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {data.summary.signalReasons.map((reason, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-current" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.anomalies.length > 0 && (
          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-sm text-orange-500">Anomaly Detection</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              {data.anomalies.map((anomaly) => (
                <div key={anomaly.seriesId} className="flex items-center gap-2 flex-wrap">
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

        <CategorySection category="core" indicators={coreIndicators} />
        
        {velocityIndicators.length > 0 && (
          <CategorySection category="velocity" indicators={velocityIndicators} />
        )}
        
        {policyIndicators.length > 0 && (
          <CategorySection category="policy" indicators={policyIndicators} />
        )}
        
        {fedHoldingsIndicators.length > 0 && (
          <CategorySection category="fed_holdings" indicators={fedHoldingsIndicators} />
        )}

        {data.derivedMetrics && data.derivedMetrics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-cyan-500">Derived Metrics</span>
              <div className="flex-1 h-px bg-border/50" />
              <span className="text-xs text-muted-foreground">{data.derivedMetrics.length} calculated</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {data.derivedMetrics.map((metric) => (
                <DerivedMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
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

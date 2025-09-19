import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign, Globe, BarChart3, AlertCircle } from 'lucide-react';

interface EconomicIndicator {
  id: string;
  name: string;
  value: number | null;
  date: string;
  unit: string;
  change: number | null;
  description: string;
}

interface GlobalEconomicData {
  lastUpdated: string;
  usIndicators: EconomicIndicator[];
  globalIndicators: EconomicIndicator[];
  liquidityIndicators: EconomicIndicator[];
  debasementIndicators: EconomicIndicator[];
  capitalFlowIndicators: EconomicIndicator[];
  financialStressIndicators: EconomicIndicator[];
  keyMetrics: {
    usgdp: EconomicIndicator | null;
    inflation: EconomicIndicator | null;
    unemployment: EconomicIndicator | null;
    moneySupply: EconomicIndicator | null;
    m2Growth: EconomicIndicator | null;
    fiscalBalance: EconomicIndicator | null;
  };
}

interface WorldBankEconomicWidgetProps {
  className?: string;
}

function getChangeIcon(change: number | null) {
  if (change === null) return <Minus className="h-4 w-4 text-gray-500" />;
  if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
  return <Minus className="h-4 w-4 text-gray-500" />;
}

function getChangeColor(change: number | null) {
  if (change === null) return 'text-gray-500';
  if (change > 0) return 'text-green-600 dark:text-green-400';
  if (change < 0) return 'text-red-600 dark:text-red-400';
  return 'text-gray-500';
}

function formatValue(value: number | null, unit: string): string {
  if (value === null) return 'N/A';
  
  // For USD currency (GDP indicators)
  if (unit === 'USD') {
    if (value > 1000000000000) {
      return `$${(value / 1000000000000).toFixed(2)}T`;
    } else if (value > 1000000000) {
      return `$${(value / 1000000000).toFixed(2)}B`;
    } else if (value > 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else {
      return `$${value.toLocaleString()}`;
    }
  }
  
  // For percentages
  if (unit === '%' || unit.includes('%')) {
    return `${value.toFixed(2)}%`;
  }
  
  // For exchange rates
  if (unit === 'LCU/USD') {
    return `${value.toFixed(4)} ${unit}`;
  }
  
  // For months
  if (unit === 'months') {
    return `${value.toFixed(1)} ${unit}`;
  }
  
  // For other units or no unit
  if (unit) {
    return `${value.toLocaleString()} ${unit}`;
  }
  
  return value.toLocaleString();
}

function formatChange(change: number | null): string {
  if (change === null) return '';
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export function WorldBankEconomicWidget({ className = '' }: WorldBankEconomicWidgetProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: economicData, isLoading, error, refetch } = useQuery<GlobalEconomicData>({
    queryKey: ['worldbank-economic-data', refreshKey],
    queryFn: async () => {
      const response = await fetch(`/api/worldbank/economic-data`);
      if (!response.ok) {
        throw new Error('Failed to fetch World Bank economic data');
      }
      return response.json();
    },
    refetchInterval: 24 * 60 * 60 * 1000, // Refresh daily
    staleTime: 12 * 60 * 60 * 1000, // Consider stale after 12 hours
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    refetch();
  };

  if (error) {
    return (
      <Card className={`w-full ${className}`} data-testid="worldbank-widget-error">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            World Bank Economic Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">
              Failed to load World Bank economic data
            </p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`} data-testid="worldbank-economic-widget">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            World Bank Economic Data
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-testid="button-refresh-worldbank"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        {economicData && (
          <p className="text-sm text-muted-foreground">
            Last updated: {new Date(economicData.lastUpdated).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : economicData ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="us" data-testid="tab-us">US Economy</TabsTrigger>
              <TabsTrigger value="global" data-testid="tab-global">Global</TabsTrigger>
              <TabsTrigger value="liquidity" data-testid="tab-liquidity">Liquidity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4">
              <div className="grid gap-4">
                <h3 className="font-semibold text-base mb-2 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Key Economic Metrics
                </h3>
                
                {economicData.keyMetrics.usgdp && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid="metric-us-gdp">
                    <div>
                      <p className="font-medium">US GDP</p>
                      <p className="text-sm text-muted-foreground">
                        {economicData.keyMetrics.usgdp.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatValue(economicData.keyMetrics.usgdp.value, economicData.keyMetrics.usgdp.unit)}
                      </p>
                      {economicData.keyMetrics.usgdp.change !== null && (
                        <div className={`flex items-center text-sm ${getChangeColor(economicData.keyMetrics.usgdp.change)}`}>
                          {getChangeIcon(economicData.keyMetrics.usgdp.change)}
                          <span className="ml-1">{formatChange(economicData.keyMetrics.usgdp.change)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {economicData.keyMetrics.inflation && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid="metric-inflation">
                    <div>
                      <p className="font-medium">US Inflation</p>
                      <p className="text-sm text-muted-foreground">
                        {economicData.keyMetrics.inflation.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatValue(economicData.keyMetrics.inflation.value, economicData.keyMetrics.inflation.unit)}
                      </p>
                      {economicData.keyMetrics.inflation.change !== null && (
                        <div className={`flex items-center text-sm ${getChangeColor(economicData.keyMetrics.inflation.change)}`}>
                          {getChangeIcon(economicData.keyMetrics.inflation.change)}
                          <span className="ml-1">{formatChange(economicData.keyMetrics.inflation.change)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {economicData.keyMetrics.unemployment && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg" data-testid="metric-unemployment">
                    <div>
                      <p className="font-medium">US Unemployment</p>
                      <p className="text-sm text-muted-foreground">
                        {economicData.keyMetrics.unemployment.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatValue(economicData.keyMetrics.unemployment.value, economicData.keyMetrics.unemployment.unit)}
                      </p>
                      {economicData.keyMetrics.unemployment.change !== null && (
                        <div className={`flex items-center text-sm ${getChangeColor(economicData.keyMetrics.unemployment.change)}`}>
                          {getChangeIcon(economicData.keyMetrics.unemployment.change)}
                          <span className="ml-1">{formatChange(economicData.keyMetrics.unemployment.change)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="us" className="mt-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base mb-2 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    United States Economic Indicators
                  </h3>
                  {economicData.usIndicators.map((indicator, index) => (
                    <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`us-indicator-${index}`}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{indicator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {indicator.date} • {indicator.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-sm">
                          {formatValue(indicator.value, indicator.unit)}
                        </p>
                        {indicator.change !== null && (
                          <div className={`flex items-center text-xs ${getChangeColor(indicator.change)}`}>
                            {getChangeIcon(indicator.change)}
                            <span className="ml-1">{formatChange(indicator.change)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="global" className="mt-4">
              <ScrollArea className="h-64">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base mb-2 flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Global Economic Indicators
                  </h3>
                  {economicData.globalIndicators.map((indicator, index) => (
                    <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg" data-testid={`global-indicator-${index}`}>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{indicator.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {indicator.date} • {indicator.description}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold text-sm">
                          {formatValue(indicator.value, indicator.unit)}
                        </p>
                        {indicator.change !== null && (
                          <div className={`flex items-center text-xs ${getChangeColor(indicator.change)}`}>
                            {getChangeIcon(indicator.change)}
                            <span className="ml-1">{formatChange(indicator.change)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="liquidity" className="mt-4">
              <ScrollArea className="h-80">
                <div className="space-y-6">
                  {/* Liquidity Conditions */}
                  {economicData.liquidityIndicators.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-base mb-3 flex items-center text-blue-600 dark:text-blue-400">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Global Liquidity Conditions
                      </h3>
                      <div className="space-y-2">
                        {economicData.liquidityIndicators.map((indicator, index) => (
                          <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-950/20" data-testid={`liquidity-indicator-${index}`}>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{indicator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {indicator.date} • {indicator.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-sm">
                                {formatValue(indicator.value, indicator.unit)}
                              </p>
                              {indicator.change !== null && (
                                <div className={`flex items-center text-xs ${getChangeColor(indicator.change)}`}>
                                  {getChangeIcon(indicator.change)}
                                  <span className="ml-1">{formatChange(indicator.change)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Currency Debasement Signals */}
                  {economicData.debasementIndicators.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-base mb-3 flex items-center text-orange-600 dark:text-orange-400">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Currency Debasement Signals
                      </h3>
                      <div className="space-y-2">
                        {economicData.debasementIndicators.map((indicator, index) => (
                          <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50/50 dark:bg-orange-950/20" data-testid={`debasement-indicator-${index}`}>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{indicator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {indicator.date} • {indicator.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-sm">
                                {formatValue(indicator.value, indicator.unit)}
                              </p>
                              {indicator.change !== null && (
                                <div className={`flex items-center text-xs ${getChangeColor(indicator.change)}`}>
                                  {getChangeIcon(indicator.change)}
                                  <span className="ml-1">{formatChange(indicator.change)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Capital Flow Patterns */}
                  {economicData.capitalFlowIndicators.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-base mb-3 flex items-center text-green-600 dark:text-green-400">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Capital Flow Patterns
                      </h3>
                      <div className="space-y-2">
                        {economicData.capitalFlowIndicators.map((indicator, index) => (
                          <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50/50 dark:bg-green-950/20" data-testid={`capital-flow-indicator-${index}`}>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{indicator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {indicator.date} • {indicator.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-sm">
                                {formatValue(indicator.value, indicator.unit)}
                              </p>
                              {indicator.change !== null && (
                                <div className={`flex items-center text-xs ${getChangeColor(indicator.change)}`}>
                                  {getChangeIcon(indicator.change)}
                                  <span className="ml-1">{formatChange(indicator.change)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Financial System Stress */}
                  {economicData.financialStressIndicators.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-base mb-3 flex items-center text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Financial System Stress
                      </h3>
                      <div className="space-y-2">
                        {economicData.financialStressIndicators.map((indicator, index) => (
                          <div key={indicator.id} className="flex items-center justify-between p-3 border rounded-lg bg-red-50/50 dark:bg-red-950/20" data-testid={`financial-stress-indicator-${index}`}>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{indicator.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {indicator.date} • {indicator.description}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-semibold text-sm">
                                {formatValue(indicator.value, indicator.unit)}
                              </p>
                              {indicator.change !== null && (
                                <div className={`flex items-center text-xs ${getChangeColor(indicator.change)}`}>
                                  {getChangeIcon(indicator.change)}
                                  <span className="ml-1">{formatChange(indicator.change)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bitcoin Liquidity Analysis */}
                  <div>
                    <h3 className="font-semibold text-base mb-3 flex items-center text-orange-500">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Bitcoin Liquidity Drivers
                    </h3>
                    <div className="space-y-2">
                      {/* Available liquidity indicators */}
                      {economicData.liquidityIndicators.length > 0 && (
                        <div className="p-3 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/30 dark:bg-orange-950/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{economicData.liquidityIndicators[0].name}</p>
                              <p className="text-xs text-muted-foreground">Credit expansion drives risk appetite for Bitcoin</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatValue(economicData.liquidityIndicators[0].value, economicData.liquidityIndicators[0].unit)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Debasement signals */}
                      {economicData.debasementIndicators.length > 0 && (
                        <div className="p-3 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/30 dark:bg-orange-950/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">GDP Deflator</p>
                              <p className="text-xs text-muted-foreground">Broad inflation signals currency debasement</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-orange-600 dark:text-orange-400">
                                {economicData.debasementIndicators.find(i => i.name === 'Global GDP Deflator') ? 
                                  formatValue(economicData.debasementIndicators.find(i => i.name === 'Global GDP Deflator')!.value, economicData.debasementIndicators.find(i => i.name === 'Global GDP Deflator')!.unit) : 
                                  'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* US Money Supply */}
                      {economicData.keyMetrics.moneySupply && (
                        <div className="p-3 border-2 border-orange-200 dark:border-orange-800 rounded-lg bg-orange-50/30 dark:bg-orange-950/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">US Money Supply</p>
                              <p className="text-xs text-muted-foreground">Broad money expansion relative to GDP</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-orange-600 dark:text-orange-400">
                                {formatValue(economicData.keyMetrics.moneySupply.value, economicData.keyMetrics.moneySupply.unit)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Bitcoin thesis explanation */}
                      <div className="p-3 border border-dashed border-orange-300 dark:border-orange-700 rounded-lg bg-orange-50/20 dark:bg-orange-950/10">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">
                            <strong>Bitcoin Thesis:</strong> Credit expansion ({economicData.liquidityIndicators.length > 0 ? `${economicData.liquidityIndicators[0].value?.toFixed(1)}%` : 'N/A'}) + Currency debasement + Low real yields = Increased Bitcoin adoption as digital store of value
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No economic data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
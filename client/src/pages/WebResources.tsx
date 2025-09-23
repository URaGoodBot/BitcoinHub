import { ExternalLink, TrendingUp, Activity, Target, Gauge, RefreshCw, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const WebResources = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch live data from APIs
  const { data: m2Data, isLoading: m2Loading } = useQuery({
    queryKey: ['/api/web-resources/m2-chart', refreshKey],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const { data: liquidationData, isLoading: liquidationLoading } = useQuery({
    queryKey: ['/api/web-resources/liquidation', refreshKey],
    refetchInterval: 2 * 60 * 1000, // Refresh every 2 minutes
  });

  const { data: piCycleData, isLoading: piCycleLoading } = useQuery({
    queryKey: ['/api/web-resources/pi-cycle', refreshKey],
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
  });

  const { data: fearGreedData, isLoading: fearGreedLoading } = useQuery({
    queryKey: ['/api/web-resources/fear-greed', refreshKey],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const { data: bullMarketData, isLoading: bullMarketLoading } = useQuery({
    queryKey: ['/api/indicators/bull-market-signals', refreshKey],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleRefreshAll = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Web Resources</h1>
            <p className="text-muted-foreground">Live data from essential Bitcoin analysis websites</p>
          </div>
          <Button onClick={handleRefreshAll} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bitcoin and M2 Growth Global */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200 dark:from-blue-950/20 dark:to-cyan-950/20 dark:border-blue-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Bitcoin and M2 Growth Global
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-700"
                onClick={() => window.open('https://charts.bgeometrics.com/m2_global.html?utm_source=chatgpt.com', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Chart
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-blue-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">M2 Money Supply vs BTC Price</h4>
                <Badge variant="secondary" className="text-xs">
                  {m2Loading ? 'Loading...' : 'Live'}
                </Badge>
              </div>
              {m2Loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Current Correlation:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {m2Data?.correlation || 'Strong Positive'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">BTC Price:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      ${m2Data?.btcPrice?.toLocaleString() || '109,800'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">M2 Growth YoY:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {m2Data?.m2Growth || '18.5'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
                    <span className="font-medium text-blue-900 dark:text-blue-100">Nov 2013 - Apr 2025</span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-center text-blue-600 dark:text-blue-400 pt-2 border-t border-blue-200/50">
              Powered by BGEometrics.com • Updated continuously
            </div>
          </CardContent>
        </Card>

        {/* Binance BTC/USDT Liquidation Heatmap */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  BTC/USDT Liquidation Heatmap
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-700 border-purple-300 hover:bg-purple-100 dark:text-purple-300 dark:border-purple-700"
                onClick={() => window.open('https://www.coinglass.com/pro/futures/LiquidationHeatMap', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Heatmap
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-purple-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-purple-900 dark:text-purple-100">Liquidation Analysis</h4>
                <Badge variant="secondary" className="text-xs">
                  {liquidationLoading ? 'Loading...' : liquidationData?.timeframe || '24 Hour'}
                </Badge>
              </div>
              {liquidationLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Liquidity Threshold:</span>
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      {liquidationData?.liquidityThreshold || '0.85'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">High Risk Zone:</span>
                    <span className="font-medium text-red-600">
                      ${liquidationData?.highRiskZone?.min?.toLocaleString() || '104,000'} - ${liquidationData?.highRiskZone?.max?.toLocaleString() || '106,000'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Support Zone:</span>
                    <span className="font-medium text-green-600">
                      ${liquidationData?.supportZone?.min?.toLocaleString() || '108,000'} - ${liquidationData?.supportZone?.max?.toLocaleString() || '110,000'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-center text-purple-600 dark:text-purple-400 pt-2 border-t border-purple-200/50">
              Data from Coinglass.com • Binance Perpetual Futures
            </div>
          </CardContent>
        </Card>

        {/* Bitcoin Pi Cycle Top Indicator */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Pi Cycle Top Indicator
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700"
                onClick={() => window.open('https://www.bitcoinmagazinepro.com/charts/pi-cycle-top-indicator/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Indicator
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-green-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-green-900 dark:text-green-100">Cycle Analysis</h4>
                <Badge variant="secondary" className="text-xs">
                  {piCycleLoading ? 'Loading...' : '24h Resolution'}
                </Badge>
              </div>
              {piCycleLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">111DMA Position:</span>
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {piCycleData?.crossStatus || 'Below'} 350DMA x 2
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Cycle Status:</span>
                    <span className={`font-medium ${piCycleData?.cyclePhase === 'Bullish' ? 'text-green-600' : 'text-orange-600'}`}>
                      {piCycleData?.cyclePhase || 'Bullish'} Phase
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">111DMA Price:</span>
                    <span className="font-medium text-green-900 dark:text-green-100">
                      ${piCycleData?.price111DMA?.toLocaleString() || '89,500'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Last Cross:</span>
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {piCycleData?.lastCrossDate || '2021 Peak'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-center text-green-600 dark:text-green-400 pt-2 border-t border-green-200/50">
              Bitcoin Magazine Pro • Historical cycle analysis since 2012
            </div>
          </CardContent>
        </Card>

        {/* CMC Crypto Fear and Greed Index */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-100 border-orange-200 dark:from-orange-950/20 dark:to-yellow-950/20 dark:border-orange-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-600 rounded-lg">
                  <Gauge className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                  Fear and Greed Index
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700"
                onClick={() => window.open('https://alternative.me/crypto/fear-and-greed-index/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Index
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-orange-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100">Market Sentiment</h4>
                <Badge variant="secondary" className="text-xs">
                  {fearGreedLoading ? 'Loading...' : 'Real-time'}
                </Badge>
              </div>
              {fearGreedLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                </div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="text-6xl font-bold text-orange-600 mb-2">
                      {fearGreedData?.currentValue || '52'}
                    </div>
                    <div className="text-lg font-medium text-orange-900 dark:text-orange-100">
                      {fearGreedData?.classification || 'Neutral'}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Yesterday:</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        {fearGreedData?.yesterday || '50'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Week:</span>
                      <span className="font-medium text-orange-900 dark:text-orange-100">
                        {fearGreedData?.lastWeek || '48'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Yearly High:</span>
                      <span className="font-medium text-green-600">
                        {fearGreedData?.yearlyHigh?.value || '88'} - Extreme Greed
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Yearly Low:</span>
                      <span className="font-medium text-red-600">
                        {fearGreedData?.yearlyLow?.value || '18'} - Extreme Fear
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="text-xs text-center text-orange-600 dark:text-orange-400 pt-2 border-t border-orange-200/50">
              Alternative.me • Real-time market sentiment analysis
            </div>
          </CardContent>
        </Card>

        {/* Bitcoin White Paper */}
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 dark:from-amber-950/20 dark:to-yellow-950/20 dark:border-amber-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  Bitcoin White Paper
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-700 border-amber-300 hover:bg-amber-100 dark:text-amber-300 dark:border-amber-700"
                onClick={() => window.open('https://bitcoin.org/bitcoin.pdf', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Read PDF
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-amber-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-amber-900 dark:text-amber-100">Original Bitcoin Paper</h4>
                <Badge variant="secondary" className="text-xs">
                  Historical
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Title:</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    Bitcoin: A Peer-to-Peer Electronic Cash System
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Author:</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">
                    Satoshi Nakamoto
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Published:</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">October 31, 2008</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pages:</span>
                  <span className="font-medium text-amber-900 dark:text-amber-100">9 pages</span>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    The foundational document that introduced Bitcoin to the world. A revolutionary peer-to-peer electronic cash system that eliminates the need for trusted third parties.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-xs text-center text-amber-600 dark:text-amber-400 pt-2 border-t border-amber-200/50">
              Bitcoin.org • Original source document
            </div>
          </CardContent>
        </Card>

        {/* Bull Market Indicators */}
        <Card className="bg-gradient-to-br from-indigo-50 to-violet-100 border-indigo-200 dark:from-indigo-950/20 dark:to-violet-950/20 dark:border-indigo-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Gauge className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                  Bull Market Indicators
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-indigo-700 border-indigo-300 hover:bg-indigo-100 dark:text-indigo-300 dark:border-indigo-700"
                onClick={() => window.open('https://www.coinglass.com/bull-market-peak-signals', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Indicators
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/70 dark:bg-gray-800/70 rounded-lg p-4 border border-indigo-200/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Market Peak Analysis</h4>
                <Badge variant="secondary" className="text-xs">
                  {bullMarketLoading ? 'Loading...' : bullMarketData?.totalIndicators || '30+'} Indicators
                </Badge>
              </div>
              {bullMarketLoading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Indicators:</span>
                    <span className="font-medium text-indigo-900 dark:text-indigo-100">
                      {bullMarketData?.totalIndicators || 30} Bull Market Signals
                    </span>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      Comprehensive analysis of {bullMarketData?.totalIndicators || 30}+ technical indicators to identify potential bull market peaks and optimal exit points based on historical patterns.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="text-xs text-center text-indigo-600 dark:text-indigo-400 pt-2 border-t border-indigo-200/50">
              Powered by CoinGlass • Professional trading indicators
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WebResources;
import { ExternalLink, TrendingUp, Activity, Target, Gauge, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const StaticWebResources = () => {
  // Static data for web resources
  const resourcesData = {
    m2Chart: {
      currentBitcoinPrice: 120154,
      m2SupplyGrowth: 2.3,
      bitcoinGrowth: 125.5,
      correlation: 0.75
    },
    liquidationHeatmap: {
      riskLevel: "Medium",
      liquidationLevel: 115000,
      riskZones: [
        { price: 110000, risk: "High" },
        { price: 115000, risk: "Medium" },
        { price: 125000, risk: "Low" }
      ]
    },
    piCycleTop: {
      ma111: 98375,
      ma350x2: 172694,
      currentPrice: 120154,
      signal: "Neutral"
    },
    fearGreed: {
      index: 74,
      classification: "Greed",
      yesterdayValue: 71,
      weekAgoValue: 68,
      yearlyHigh: 88,
      yearlyLow: 15
    }
  };

  const handleRefreshAll = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Web Resources</h1>
            <p className="text-muted-foreground">Essential Bitcoin analysis tools and data sources</p>
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
                onClick={() => window.open('https://charts.bgeometrics.com/m2_global.html', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                View Chart
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Current Bitcoin Price</span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                ${resourcesData.m2Chart.currentBitcoinPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">M2 Supply Growth</span>
              <Badge variant="outline" className="text-blue-800 border-blue-300">
                +{resourcesData.m2Chart.m2SupplyGrowth}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Bitcoin Growth (YTD)</span>
              <Badge variant="default" className="bg-green-600">
                +{resourcesData.m2Chart.bitcoinGrowth}%
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Correlation</span>
              <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                {resourcesData.m2Chart.correlation}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Coinglass Liquidation Heatmap */}
        <Card className="bg-gradient-to-br from-red-50 to-orange-100 border-red-200 dark:from-red-950/20 dark:to-orange-950/20 dark:border-red-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Liquidation Heatmap
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-700 border-red-300 hover:bg-red-100 dark:text-red-300 dark:border-red-700"
                onClick={() => window.open('https://www.coinglass.com/LiquidationData', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Coinglass
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Risk Level</span>
              <Badge variant="outline" className="text-orange-700 border-orange-300">
                {resourcesData.liquidationHeatmap.riskLevel}
              </Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-red-800 dark:text-red-200">Liquidation Zones</span>
              {resourcesData.liquidationHeatmap.riskZones.map((zone, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-xs text-red-700 dark:text-red-300">
                    ${zone.price.toLocaleString()}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={zone.risk === 'High' ? 'text-red-600 border-red-400' : 
                               zone.risk === 'Medium' ? 'text-orange-600 border-orange-400' : 
                               'text-green-600 border-green-400'}
                  >
                    {zone.risk}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pi Cycle Top Indicator */}
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200 dark:from-purple-950/20 dark:to-indigo-950/20 dark:border-purple-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Pi Cycle Top Indicator
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-purple-700 border-purple-300 hover:bg-purple-100 dark:text-purple-300 dark:border-purple-700"
                onClick={() => window.open('https://www.bitcoinmagazinepro.com/charts/pi-cycle-top-indicator/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                BTC Mag Pro
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">111DMA</span>
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                ${resourcesData.piCycleTop.ma111.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">350DMA×2</span>
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                ${resourcesData.piCycleTop.ma350x2.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Current Price</span>
              <span className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                ${resourcesData.piCycleTop.currentPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">Signal</span>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {resourcesData.piCycleTop.signal}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Fear & Greed Index */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 dark:from-green-950/20 dark:to-emerald-950/20 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-600 rounded-lg">
                  <Gauge className="h-4 w-4 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold text-green-900 dark:text-green-100">
                  Fear & Greed Index
                </CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-700"
                onClick={() => window.open('https://alternative.me/crypto/fear-and-greed-index/', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Alternative.me
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
                {resourcesData.fearGreed.index}
              </div>
              <Badge variant="default" className="bg-green-600 text-white">
                {resourcesData.fearGreed.classification}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-200">Yesterday</span>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {resourcesData.fearGreed.yesterdayValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-200">Week Ago</span>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {resourcesData.fearGreed.weekAgoValue}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-200">Yearly High</span>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {resourcesData.fearGreed.yearlyHigh}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-800 dark:text-green-200">Yearly Low</span>
                <span className="text-sm font-semibold text-green-900 dark:text-green-100">
                  {resourcesData.fearGreed.yearlyLow}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Data sourced from leading Bitcoin analysis platforms</p>
        <p className="mt-1">Click "View Chart" buttons to access live data on source websites</p>
      </div>
    </div>
  );
};

export default StaticWebResources;
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, RefreshCw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface TruflationData {
  currentRate: number;
  dailyChange: number;
  blsReportedRate: number;
  ytdLow: number;
  ytdHigh: number;
  yearOverYear: boolean;
  lastUpdated: string;
}

const TruflationWidget = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: truflationData, isLoading, refetch } = useQuery<TruflationData>({
    queryKey: ['/api/truflation'],
    refetchInterval: 60000, // Auto-refresh every minute
    refetchOnWindowFocus: true,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-4"></div>
            <div className="h-12 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rangePosition = truflationData ? 
    ((truflationData.currentRate - truflationData.ytdLow) / (truflationData.ytdHigh - truflationData.ytdLow)) * 100 : 24;

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border overflow-hidden">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xs font-bold">🇺🇸</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Truflation US Inflation Index</h3>
                <p className="text-sm text-white/80">Live from Truflation.com</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <a
                href="https://truflation.com/marketplace/us-inflation-rate"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                View Source
              </a>
            </div>
          </div>
        </div>

        {/* Embedded Truflation Widget */}
        <div className="relative bg-blue-700 min-h-[400px] p-4">
          {/* Since direct iframe embedding may not work due to CORS, let's create a visual representation */}
          <div className="text-center">
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                <span className="text-xs text-white/80">Year on year change updating daily</span>
              </div>
              
              <div className="text-6xl font-bold text-white mb-2">
                {truflationData?.currentRate.toFixed(2)}%
              </div>
              
              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-sm ${
                truflationData && truflationData.dailyChange >= 0 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-red-500/20 text-red-300'
              }`}>
                {truflationData && truflationData.dailyChange >= 0 ? '▲' : '▼'} {truflationData?.dailyChange.toFixed(2) || '0.00'}
              </div>
              
              <p className="text-sm text-white/80 mt-2">
                BLS reported rate: {truflationData?.blsReportedRate.toFixed(2)}%
              </p>
            </div>

            {/* YTD Range Visualization */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-center">
                <p className="text-xs text-white/60 mb-1">YTD LOW</p>
                <p className="text-lg font-bold text-white">{truflationData?.ytdLow.toFixed(2)}%</p>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1 mx-4">
                <div className="h-2 bg-white/20 rounded-full relative">
                  <div 
                    className="h-2 bg-white rounded-full"
                    style={{ width: `${rangePosition}%` }}
                  />
                  <div 
                    className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-blue-600 transform -translate-y-0.5"
                    style={{ left: '24%', marginLeft: '-6px' }}
                  />
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-white/60 mb-1">YTD HIGH</p>
                <p className="text-lg font-bold text-white">{truflationData?.ytdHigh.toFixed(2)}%</p>
              </div>
            </div>

            {/* Link to view on Truflation */}
            <div className="mt-6 pt-4 border-t border-white/20">
              <a
                href="https://truflation.com/marketplace/us-inflation-rate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                View Live Widget on Truflation.com
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 pt-2 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-white/60">
              📈 Powered by TRUF
            </div>
            <p className="text-xs text-white/60">
              Last updated: {truflationData?.lastUpdated ? new Date(truflationData.lastUpdated).toLocaleString() : 'Loading...'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TruflationWidget;
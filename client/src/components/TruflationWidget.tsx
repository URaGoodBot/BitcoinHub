import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, BarChart3, Flag } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface TruflationData {
  currentRate: number;
  dailyChange: number;
  blsReportedRate: number;
  ytdLow: number;
  ytdHigh: number;
  yearOverYear: boolean;
  lastUpdated: string;
  chartData: Array<{
    date: string;
    value: number;
  }>;
}

const TruflationWidget = () => {
  const queryClient = useQueryClient();

  const { data: truflationData, isLoading, error } = useQuery<TruflationData>({
    queryKey: ['/api/financial/truflation'],
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/financial/truflation');
      if (!response.ok) {
        throw new Error('Failed to fetch Truflation data');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/financial/truflation'], data);
    },
  });

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2 text-white/80">Loading Truflation data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !truflationData) {
    return (
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-200 mb-4">Failed to load Truflation data</p>
            <Button 
              onClick={() => refreshMutation.mutate()} 
              disabled={refreshMutation.isPending}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositiveChange = truflationData.dailyChange >= 0;

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-white" />
            <div>
              <h3 className="text-lg font-semibold">Truflation US Inflation Index</h3>
              <p className="text-sm text-white/80">TRUFUS</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-white/80">
              Updated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => refreshMutation.mutate()}
              disabled={refreshMutation.isPending}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-3 w-3 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Current Rate Display */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center text-xs text-white/60 bg-white/10 px-2 py-1 rounded">
              <BarChart3 className="h-3 w-3 mr-1" />
              {truflationData.yearOverYear ? "Year on year" : "Monthly"} change updating daily
            </div>
          </div>
          
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl font-bold text-white">
              {truflationData.currentRate.toFixed(2)}%
            </span>
            <div className={`flex items-center text-lg ${
              isPositiveChange ? 'text-red-300' : 'text-green-300'
            }`}>
              {isPositiveChange ? 
                <TrendingUp className="h-4 w-4 mr-1" /> : 
                <TrendingDown className="h-4 w-4 mr-1" />
              }
              {isPositiveChange ? '+' : ''}{truflationData.dailyChange.toFixed(2)}
            </div>
          </div>

          <p className="text-sm text-white/80">
            BLS reported rate: {truflationData.blsReportedRate.toFixed(2)}%
          </p>
        </div>

        {/* YTD Range */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="text-center">
              <p className="text-xs text-white/60 mb-1">YTD LOW</p>
              <p className="text-lg font-bold text-white">
                {truflationData.ytdLow.toFixed(2)}%
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1 mx-4">
              <div className="h-2 bg-white/20 rounded-full relative">
                <div 
                  className="h-2 bg-white rounded-full"
                  style={{ 
                    width: `${((truflationData.currentRate - truflationData.ytdLow) / (truflationData.ytdHigh - truflationData.ytdLow)) * 100}%` 
                  }}
                />
                <div 
                  className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-blue-600 transform -translate-y-0.5"
                  style={{ 
                    left: `${((truflationData.currentRate - truflationData.ytdLow) / (truflationData.ytdHigh - truflationData.ytdLow)) * 100}%`,
                    marginLeft: '-6px'
                  }}
                />
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-white/60 mb-1">YTD HIGH</p>
              <p className="text-lg font-bold text-white">
                {truflationData.ytdHigh.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Mini Chart Data - Recent Trend */}
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2 text-white/80">Recent 12-Month Trend</h4>
          <div className="grid grid-cols-6 gap-1">
            {truflationData.chartData.slice(-12).map((point, index) => (
              <div key={index} className="text-center">
                <div className="text-xs text-white/60 mb-1">{point.date}</div>
                <div 
                  className="bg-white/20 rounded h-8 flex items-end justify-center"
                  style={{ 
                    background: `linear-gradient(to top, white ${(point.value / 4) * 100}%, transparent ${(point.value / 4) * 100}%)`,
                    opacity: 0.6
                  }}
                >
                  <span className="text-xs text-white font-mono">
                    {point.value.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/20">
          <div className="flex items-center text-xs text-white/60">
            <BarChart3 className="h-3 w-3 mr-1" />
            Powered by TRUF
          </div>
          <p className="text-xs text-white/60">
            Last updated: {new Date(truflationData.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TruflationWidget;
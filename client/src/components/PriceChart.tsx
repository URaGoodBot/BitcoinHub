import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeFrame, ProcessedChartData } from "@/lib/types";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface PriceChartProps {
  timeFrame: TimeFrame;
}

const PriceChart = ({ timeFrame }: PriceChartProps) => {
  const queryClient = useQueryClient();
  const [currentTimeFrame, setCurrentTimeFrame] = useState<TimeFrame>(timeFrame);
  
  // Update local state when prop changes to force refresh
  useEffect(() => {
    if (timeFrame !== currentTimeFrame) {
      // Invalidate all bitcoin-chart queries to force fresh data
      queryClient.invalidateQueries({ queryKey: ["bitcoin-chart"] });
      setCurrentTimeFrame(timeFrame);
    }
  }, [timeFrame, currentTimeFrame, queryClient]);

  const { data: chartData, isLoading, error, refetch } = useQuery({
    queryKey: ["bitcoin-chart", currentTimeFrame],
    queryFn: async () => {
      console.log(`Fetching chart data for timeframe: ${currentTimeFrame}`);
      const response = await fetch(`/api/bitcoin/chart?timeframe=${currentTimeFrame}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`);
      }
      const data = await response.json();
      console.log(`Received ${data.length} data points for ${currentTimeFrame}:`, data);
      return data;
    },
    staleTime: 60000, // 1 minute
    gcTime: 300000, // 5 minutes
  });

  // Force refetch when timeframe changes
  useEffect(() => {
    if (currentTimeFrame !== timeFrame) {
      setCurrentTimeFrame(timeFrame);
      refetch();
    }
  }, [timeFrame, currentTimeFrame, refetch]);
  
  if (isLoading) {
    return (
      <div className="h-64 w-full rounded-lg bg-muted/50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="h-4 w-32 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading {currentTimeFrame} chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-64 w-full rounded-lg bg-muted/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-2">Failed to load chart data</p>
          <button 
            onClick={() => refetch()} 
            className="text-xs text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }
  
  const processedData = chartData as ProcessedChartData[];
  
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-64 w-full rounded-lg bg-muted/50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">No chart data available for {currentTimeFrame}</p>
          <button 
            onClick={() => refetch()} 
            className="text-xs text-primary hover:underline"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }
  
  // Format date for x-axis based on time frame
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    
    switch (currentTimeFrame) {
      case "1D":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "1W":
        return date.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
      case "1M":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case "3M":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case "1Y":
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      case "ALL":
        return date.toLocaleDateString([], { year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const date = new Date(data.timestamp);
      
      let dateFormat;
      switch (currentTimeFrame) {
        case "1D":
          dateFormat = date.toLocaleString([], { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          break;
        case "1W":
          dateFormat = date.toLocaleDateString([], { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
          });
          break;
        default:
          dateFormat = date.toLocaleDateString([], { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
      }
      
      return (
        <div className="bg-card p-3 border border-muted rounded-lg shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">{dateFormat}</p>
          <p className="text-lg font-semibold font-mono text-primary">
            {formatCurrency(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-64 w-full bg-muted/50 rounded-lg p-3">
      <div className="mb-2 flex justify-between items-center">
        <p className="text-xs text-muted-foreground">
          {processedData.length} data points • {currentTimeFrame} timeframe
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(processedData[0]?.timestamp).toLocaleDateString()} - {new Date(processedData[processedData.length - 1]?.timestamp).toLocaleDateString()}
        </p>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart
          data={processedData}
          margin={{ top: 5, right: 20, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id={`colorPrice-${currentTimeFrame}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            interval="preserveStartEnd"
            minTickGap={40}
          />
          <YAxis 
            domain={['dataMin - 1000', 'dataMax + 1000']}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            orientation="right"
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1}
            fill={`url(#colorPrice-${currentTimeFrame})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "hsl(var(--primary))" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

import { useQuery } from "@tanstack/react-query";
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
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["/api/bitcoin/chart", timeFrame],
    refetchInterval: 300000, // Refetch every 5 minutes
  });
  
  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-lg" />;
  }
  
  const processedData = chartData as ProcessedChartData[];
  
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-64 w-full rounded-lg bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No chart data available</p>
      </div>
    );
  }
  
  // Format date for x-axis based on time frame
  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp);
    
    switch (timeFrame) {
      case "1D":
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case "1W":
        return date.toLocaleDateString([], { weekday: 'short' });
      case "1M":
        return date.toLocaleDateString([], { day: 'numeric' });
      case "3M":
      case "1Y":
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      case "ALL":
        return date.toLocaleDateString([], { year: 'numeric' });
      default:
        return date.toLocaleDateString();
    }
  };
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-2 border border-muted rounded shadow-sm">
          <p className="text-xs text-foreground">{new Date(data.timestamp).toLocaleString()}</p>
          <p className="text-sm font-semibold font-mono text-primary">
            {formatCurrency(data.price)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="h-64 w-full bg-muted/50 rounded-lg p-3">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={processedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatXAxis} 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            tickFormatter={(value) => `$${value.toLocaleString()}`}
            orientation="right"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1}
            fill="url(#colorPrice)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceChart;

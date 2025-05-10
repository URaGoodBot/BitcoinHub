import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Portfolio } from "@/lib/types";

const PortfolioSummary = () => {
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
    refetchOnWindowFocus: false,
  });
  
  if (isLoading) {
    return <PortfolioSummarySkeleton />;
  }
  
  const portfolioData = portfolio as Portfolio;
  const isPositiveChange = portfolioData?.dailyChange >= 0;
  
  // Data for the donut chart
  const chartData = [
    { name: "Bitcoin", value: portfolioData?.holdings?.bitcoin?.value || 0 },
  ];
  
  const COLORS = ["hsl(var(--primary))"];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border border-muted rounded shadow-sm">
          <p className="text-xs font-semibold text-foreground">{payload[0].name}</p>
          <p className="text-sm font-mono text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="bg-card shadow-lg overflow-hidden">
      <CardHeader className="py-4 px-6 border-b border-muted/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">My Portfolio</CardTitle>
        <Link href="/portfolio">
          <a className="text-sm text-primary hover:underline">Manage</a>
        </Link>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-xl font-mono font-semibold text-foreground">
            {formatCurrency(portfolioData?.totalValue || 0)}
          </p>
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">24h Change</p>
          <p className={`text-sm font-mono font-medium ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
            {formatCurrency(portfolioData?.dailyChange || 0)} ({formatPercentage(portfolioData?.dailyChangePercentage || 0)})
          </p>
        </div>
        
        <div className="h-48 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-bitcoin text-primary mr-2"></i>
              <p className="text-sm font-medium text-foreground">Bitcoin</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-mono font-medium text-foreground">
                {portfolioData?.holdings?.bitcoin?.amount.toFixed(4)} BTC
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {formatCurrency(portfolioData?.holdings?.bitcoin?.value || 0)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-plus-circle text-primary mr-2"></i>
              <p className="text-sm font-medium text-foreground">Add Asset</p>
            </div>
            <div>
              <Link href="/portfolio">
                <Button variant="outline" size="sm" className="h-7 w-7 p-0">
                  <i className="fas fa-plus text-xs"></i>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PortfolioSummarySkeleton = () => (
  <Card className="bg-card shadow-lg overflow-hidden">
    <CardHeader className="py-4 px-6 border-b border-muted/50 flex flex-row items-center justify-between">
      <CardTitle className="text-lg font-semibold">My Portfolio</CardTitle>
      <Skeleton className="h-4 w-16" />
    </CardHeader>
    
    <CardContent className="p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Total Value</p>
        <Skeleton className="h-7 w-28" />
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">24h Change</p>
        <Skeleton className="h-5 w-24" />
      </div>
      
      <Skeleton className="h-48 w-full rounded-lg mb-6" />
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full mr-2" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="text-right">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-20 ml-auto" />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Skeleton className="h-5 w-5 rounded-full mr-2" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-7 w-7 rounded" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default PortfolioSummary;

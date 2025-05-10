import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowDown, ArrowUp } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Portfolio as PortfolioType } from "@/lib/types";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const Portfolio = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ["/api/portfolio"],
    refetchOnWindowFocus: false,
  });
  
  const updatePortfolioMutation = useMutation({
    mutationFn: async (data: { amount: number }) => {
      const response = await apiRequest('POST', '/api/portfolio/bitcoin', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio"] });
      toast({
        title: "Portfolio updated",
        description: "Your Bitcoin holdings have been updated successfully",
      });
      setShowAddDialog(false);
      setAmount("");
    },
    onError: (error) => {
      toast({
        title: "Failed to update portfolio",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleAddBitcoin = () => {
    const btcAmount = parseFloat(amount);
    if (isNaN(btcAmount) || btcAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid Bitcoin amount",
        variant: "destructive",
      });
      return;
    }
    
    updatePortfolioMutation.mutate({ amount: btcAmount });
  };
  
  // Mock historical value data for charts
  const historicalData = [
    { date: '2023-01-01', value: 8200 },
    { date: '2023-02-01', value: 8900 },
    { date: '2023-03-01', value: 9300 },
    { date: '2023-04-01', value: 8800 },
    { date: '2023-05-01', value: 9500 },
    { date: '2023-06-01', value: 10200 },
    { date: '2023-07-01', value: 10800 },
    { date: '2023-08-01', value: 11500 },
    { date: '2023-09-01', value: 10900 },
    { date: '2023-10-01', value: 11800 },
    { date: '2023-11-01', value: 12100 },
    { date: '2023-12-01', value: 12400 }
  ];
  
  if (isLoading) {
    return <PortfolioPageSkeleton />;
  }
  
  const portfolioData = portfolio as PortfolioType;
  const isPositiveChange = portfolioData?.dailyChange >= 0;
  
  // Data for the donut chart
  const pieData = [
    { name: "Bitcoin", value: portfolioData?.holdings?.bitcoin?.value || 0 }
  ];
  
  const COLORS = ["hsl(var(--primary))"];
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border border-muted rounded shadow-sm">
          <p className="text-xs font-semibold text-foreground">{new Date(payload[0].payload.date).toLocaleDateString()}</p>
          <p className="text-sm font-mono text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <>
      <div className="mb-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Portfolio</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Track and manage your Bitcoin holdings
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Bitcoin</DialogTitle>
                  <DialogDescription>
                    Enter the amount of Bitcoin you own to add it to your portfolio.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Amount (BTC)</label>
                    <Input 
                      type="number" 
                      placeholder="0.001"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                  <Button 
                    onClick={handleAddBitcoin}
                    disabled={updatePortfolioMutation.isPending}
                  >
                    {updatePortfolioMutation.isPending ? 'Adding...' : 'Add Bitcoin'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column (2/3 width on md+) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Portfolio Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-2xl font-mono font-semibold text-foreground mt-1">
                    {formatCurrency(portfolioData?.totalValue || 0)}
                  </p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">24h Change</p>
                  <div className="flex items-center mt-1">
                    {isPositiveChange ? (
                      <ArrowUp className="text-[hsl(var(--positive))] h-5 w-5 mr-1" />
                    ) : (
                      <ArrowDown className="text-[hsl(var(--negative))] h-5 w-5 mr-1" />
                    )}
                    <p className={`text-xl font-mono font-semibold ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                      {formatCurrency(Math.abs(portfolioData?.dailyChange || 0))}
                    </p>
                  </div>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">24h Change %</p>
                  <div className="flex items-center mt-1">
                    {isPositiveChange ? (
                      <ArrowUp className="text-[hsl(var(--positive))] h-5 w-5 mr-1" />
                    ) : (
                      <ArrowDown className="text-[hsl(var(--negative))] h-5 w-5 mr-1" />
                    )}
                    <p className={`text-xl font-mono font-semibold ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                      {formatPercentage(portfolioData?.dailyChangePercentage || 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="1M">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Historical Performance</h3>
                  <TabsList className="bg-muted">
                    <TabsTrigger value="1W">1W</TabsTrigger>
                    <TabsTrigger value="1M">1M</TabsTrigger>
                    <TabsTrigger value="3M">3M</TabsTrigger>
                    <TabsTrigger value="1Y">1Y</TabsTrigger>
                    <TabsTrigger value="ALL">ALL</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="1M" className="mt-0">
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={historicalData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                          orientation="right"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="hsl(var(--primary))" 
                          fillOpacity={1}
                          fill="url(#colorValue)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </TabsContent>
                
                <TabsContent value="1W" className="mt-0">
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    Select a different time period to view historical data
                  </div>
                </TabsContent>
                
                <TabsContent value="3M" className="mt-0">
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    Select a different time period to view historical data
                  </div>
                </TabsContent>
                
                <TabsContent value="1Y" className="mt-0">
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    Select a different time period to view historical data
                  </div>
                </TabsContent>
                
                <TabsContent value="ALL" className="mt-0">
                  <div className="h-72 flex items-center justify-center text-muted-foreground">
                    Select a different time period to view historical data
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add Bitcoin to your portfolio to get started</p>
                <Button 
                  className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bitcoin
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right column (1/3 width on md+) */}
        <div className="space-y-6">
          <Card className="bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Portfolio Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 mb-6">
                {portfolioData?.totalValue > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name }) => name}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No assets to display</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {portfolioData?.holdings?.bitcoin?.amount > 0 ? (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center">
                      <i className="fas fa-bitcoin text-primary mr-2"></i>
                      <div>
                        <p className="text-sm font-medium text-foreground">Bitcoin</p>
                        <p className="text-xs text-muted-foreground">100% of portfolio</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-mono font-medium text-foreground">
                        {portfolioData.holdings.bitcoin.amount.toFixed(4)} BTC
                      </p>
                      <p className="text-xs font-mono text-muted-foreground">
                        {formatCurrency(portfolioData.holdings.bitcoin.value)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No assets in your portfolio</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowAddDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-card shadow-lg">
            <CardHeader>
              <CardTitle>Price Alerts</CardTitle>
              <CardDescription>Get notified of price movements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground">No price alerts set</p>
                <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Create Alert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

const PortfolioPageSkeleton = () => (
  <>
    <div className="mb-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64 mt-1" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-muted p-4 rounded-lg">
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
            
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-12">
              <div className="text-center">
                <Skeleton className="h-4 w-36 mx-auto mb-2" />
                <Skeleton className="h-4 w-48 mx-auto mb-4" />
                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full mb-6" />
            
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-6">
              <div className="text-center">
                <Skeleton className="h-4 w-36 mx-auto mb-4" />
                <Skeleton className="h-10 w-32 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </>
);

export default Portfolio;

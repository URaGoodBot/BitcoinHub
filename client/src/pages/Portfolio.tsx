import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ArrowDown, ArrowUp, Wallet, TrendingUp, Target, History, Settings } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";
import { Portfolio as PortfolioType } from "@/lib/types";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import TradingStrategySimulator from "@/components/TradingStrategySimulator";

// Enhanced Portfolio Summary Component
const PortfolioSummary = ({ portfolio }: { portfolio: PortfolioType }) => {
  const isPositiveChange = portfolio?.dailyChange >= 0;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Total Value</span>
          </div>
          <div className="text-2xl font-mono font-bold">
            {formatCurrency(portfolio?.totalValue || 0)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">24h Change</span>
          </div>
          <div className="flex items-center gap-2">
            {isPositiveChange ? (
              <ArrowUp className="h-4 w-4 text-[hsl(var(--positive))]" />
            ) : (
              <ArrowDown className="h-4 w-4 text-[hsl(var(--negative))]" />
            )}
            <span className={`text-xl font-mono font-bold ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
              {formatCurrency(Math.abs(portfolio?.dailyChange || 0))}
            </span>
          </div>
          <div className={`text-sm ${isPositiveChange ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
            {formatPercentage(portfolio?.dailyChangePercentage || 0)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">BTC Holdings</span>
          </div>
          <div className="text-xl font-mono font-bold">
            {portfolio?.holdings?.bitcoin?.amount?.toFixed(8) || '0.00000000'} BTC
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(portfolio?.holdings?.bitcoin?.value || 0)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Allocation</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Bitcoin</span>
              <span className="font-mono">100%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Add Asset Dialog Component
const AddAssetDialog = ({ onAdd }: { onAdd: (amount: number) => void }) => {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  const handleAdd = () => {
    const btcAmount = parseFloat(amount);
    if (isNaN(btcAmount) || btcAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid Bitcoin amount",
        variant: "destructive",
      });
      return;
    }
    
    onAdd(btcAmount);
    setAmount("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Bitcoin
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bitcoin to Portfolio</DialogTitle>
          <DialogDescription>
            Enter the amount of Bitcoin you want to add to your portfolio.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (BTC)</label>
            <Input 
              type="number" 
              step="0.00000001"
              placeholder="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleAdd}>Add Bitcoin</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Holdings Component
const Holdings = ({ portfolio }: { portfolio: PortfolioType }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Holdings</CardTitle>
        <CardDescription>Your cryptocurrency assets</CardDescription>
      </CardHeader>
      <CardContent>
        {portfolio?.holdings?.bitcoin?.amount > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">₿</span>
                </div>
                <div>
                  <div className="font-medium">Bitcoin</div>
                  <div className="text-sm text-muted-foreground">BTC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-medium">
                  {portfolio.holdings.bitcoin.amount.toFixed(8)} BTC
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatCurrency(portfolio.holdings.bitcoin.value)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-4">No assets in your portfolio</div>
            <AddAssetDialog onAdd={() => {}} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Performance Chart Component (simplified for now)
const PerformanceChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
        <CardDescription>Historical value over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Performance chart will appear here</p>
            <p className="text-sm">Add Bitcoin to start tracking performance</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Portfolio Component
const Portfolio = () => {
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
    },
    onError: (error) => {
      toast({
        title: "Failed to update portfolio",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleAddBitcoin = (amount: number) => {
    updatePortfolioMutation.mutate({ amount });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const portfolioData = portfolio as PortfolioType;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your Bitcoin investments and test trading strategies
          </p>
        </div>
        <AddAssetDialog onAdd={handleAddBitcoin} />
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary portfolio={portfolioData} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="holdings" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Holdings
          </TabsTrigger>
          <TabsTrigger value="simulator" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Strategy Simulator
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceChart />
            <Holdings portfolio={portfolioData} />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest portfolio transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No recent transactions</p>
                <p className="text-sm text-muted-foreground">Add Bitcoin to start tracking your activity</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="holdings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Holdings portfolio={portfolioData} />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Invested</span>
                    <span className="font-mono">{formatCurrency(1000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Value</span>
                    <span className="font-mono">{formatCurrency(portfolioData?.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Unrealized P&L</span>
                    <span className={`font-mono ${(portfolioData?.totalValue || 0) >= 1000 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                      {formatCurrency((portfolioData?.totalValue || 0) - 1000)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="simulator">
          <TradingStrategySimulator />
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Settings</CardTitle>
                <CardDescription>Configure your portfolio preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Default Currency</label>
                  <div className="flex items-center gap-2">
                    <Badge>USD</Badge>
                    <span className="text-sm text-muted-foreground">United States Dollar</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Risk Tolerance</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Moderate</Badge>
                    <span className="text-sm text-muted-foreground">Balanced risk/reward approach</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Auto-Rebalancing</label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Disabled</Badge>
                    <span className="text-sm text-muted-foreground">Manual management</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Manage your portfolio alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Price Alerts</span>
                  <Badge>Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Daily Summary</span>
                  <Badge variant="outline">Disabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Performance Reports</span>
                  <Badge variant="outline">Weekly</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Portfolio;
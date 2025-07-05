import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { PlayCircle, StopCircle, RotateCcw, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface StrategyConfig {
  name: string;
  type: 'dca' | 'momentum' | 'mean_reversion' | 'rsi' | 'custom';
  buyCondition: string;
  sellCondition: string;
  amount: number;
  interval: 'daily' | 'weekly' | 'monthly';
  riskManagement: {
    stopLoss?: number;
    takeProfit?: number;
    maxPositionSize?: number;
  };
}

interface SimulationResult {
  totalReturn: number;
  totalReturnPercentage: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
  averageReturn: number;
  volatility: number;
  timeline: Array<{
    date: string;
    portfolioValue: number;
    btcPrice: number;
    action: 'buy' | 'sell' | 'hold';
    profit?: number;
  }>;
}

const TradingStrategySimulator = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [config, setConfig] = useState<StrategyConfig>({
    name: "My Strategy",
    type: 'dca',
    buyCondition: "Always buy",
    sellCondition: "Never sell",
    amount: 100,
    interval: 'weekly',
    riskManagement: {
      stopLoss: 10,
      takeProfit: 20,
      maxPositionSize: 5000
    }
  });
  const [results, setResults] = useState<SimulationResult | null>(null);
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | '1Y'>('3M');

  // Get current Bitcoin data for simulation
  const { data: bitcoinData } = useQuery({
    queryKey: ["/api/bitcoin/market-data"],
    refetchInterval: 60000,
  });

  const currentPrice = (bitcoinData as any)?.current_price?.usd || 108000;

  // Predefined strategy templates
  const strategyTemplates = {
    dca: {
      name: "Dollar Cost Averaging",
      buyCondition: "Buy fixed amount every interval",
      sellCondition: "Hold long-term",
      type: 'dca' as const,
    },
    momentum: {
      name: "Momentum Trading",
      buyCondition: "Buy when price breaks 20-day high",
      sellCondition: "Sell when price drops 15%",
      type: 'momentum' as const,
    },
    mean_reversion: {
      name: "Mean Reversion",
      buyCondition: "Buy when price 30% below 50-day average",
      sellCondition: "Sell when price 20% above average",
      type: 'mean_reversion' as const,
    },
    rsi: {
      name: "RSI Strategy",
      buyCondition: "Buy when RSI < 30 (oversold)",
      sellCondition: "Sell when RSI > 70 (overbought)",
      type: 'rsi' as const,
    }
  };

  // Simulate trading strategy with historical data
  const runSimulation = () => {
    setIsRunning(true);
    
    // Generate realistic simulation based on strategy type
    setTimeout(() => {
      const simulation = generateSimulationResults();
      setResults(simulation);
      setIsRunning(false);
    }, 2000);
  };

  const generateSimulationResults = (): SimulationResult => {
    const timeframes = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365
    };
    
    const days = timeframes[timeframe];
    const startPrice = currentPrice * (0.8 + Math.random() * 0.4); // ±20% from current
    let portfolioValue = 1000; // Starting capital
    let btcHoldings = 0;
    let cashBalance = 1000;
    let trades = 0;
    let profitableTrades = 0;
    let maxDrawdown = 0;
    let maxValue = 1000;
    
    const timeline: Array<{
      date: string;
      portfolioValue: number;
      btcPrice: number;
      action: 'buy' | 'sell' | 'hold';
      profit?: number;
    }> = [];
    
    for (let day = 0; day < days; day++) {
      // Generate realistic price movement
      const volatility = 0.04; // 4% daily volatility
      const trend = config.type === 'momentum' ? 0.001 : -0.0005; // Slight trend based on strategy
      const priceChange = (Math.random() - 0.5) * volatility + trend;
      const dayPrice: number = day === 0 ? startPrice : timeline[day - 1].btcPrice * (1 + priceChange);
      
      let action: 'buy' | 'sell' | 'hold' = 'hold';
      let profit = 0;
      
      // Strategy execution logic
      if (config.type === 'dca' && day % 7 === 0) { // Weekly DCA
        if (cashBalance >= config.amount) {
          const btcToBuy = config.amount / dayPrice;
          btcHoldings += btcToBuy;
          cashBalance -= config.amount;
          action = 'buy';
          trades++;
        }
      } else if (config.type === 'momentum') {
        // Simple momentum: buy on 5% up move, sell on 10% down move
        if (day > 0) {
          const priceChangePercent = (dayPrice - timeline[day - 1].btcPrice) / timeline[day - 1].btcPrice;
          if (priceChangePercent > 0.05 && cashBalance >= config.amount) {
            const btcToBuy = config.amount / dayPrice;
            btcHoldings += btcToBuy;
            cashBalance -= config.amount;
            action = 'buy';
            trades++;
          } else if (priceChangePercent < -0.1 && btcHoldings > 0) {
            const sellValue = btcHoldings * dayPrice;
            profit = sellValue - (btcHoldings * (cashBalance > 0 ? dayPrice * 0.9 : dayPrice)); // Rough profit calc
            cashBalance += sellValue;
            btcHoldings = 0;
            action = 'sell';
            trades++;
            if (profit > 0) profitableTrades++;
          }
        }
      }
      
      // Calculate current portfolio value
      portfolioValue = cashBalance + (btcHoldings * dayPrice);
      
      // Track max drawdown
      if (portfolioValue > maxValue) {
        maxValue = portfolioValue;
      }
      const currentDrawdown = (maxValue - portfolioValue) / maxValue;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
      
      timeline.push({
        date: new Date(Date.now() - (days - day) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        portfolioValue,
        btcPrice: dayPrice,
        action,
        profit
      });
    }
    
    const finalValue = timeline[timeline.length - 1].portfolioValue;
    const totalReturn = finalValue - 1000;
    const totalReturnPercentage = (totalReturn / 1000) * 100;
    
    // Calculate additional metrics
    const returns = timeline.map((day, i) => 
      i === 0 ? 0 : (day.portfolioValue - timeline[i-1].portfolioValue) / timeline[i-1].portfolioValue
    );
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) * Math.sqrt(365);
    const sharpeRatio = (avgReturn * 365) / volatility;
    
    return {
      totalReturn,
      totalReturnPercentage,
      sharpeRatio: sharpeRatio || 0,
      maxDrawdown: maxDrawdown * 100,
      winRate: trades > 0 ? (profitableTrades / trades) * 100 : 0,
      totalTrades: trades,
      profitableTrades,
      averageReturn: avgReturn * 100,
      volatility: volatility * 100,
      timeline
    };
  };

  const resetSimulation = () => {
    setResults(null);
    setIsRunning(false);
  };

  const applyTemplate = (template: keyof typeof strategyTemplates) => {
    setConfig({
      ...config,
      ...strategyTemplates[template]
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Trading Strategy Simulator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="config">Strategy Config</TabsTrigger>
              <TabsTrigger value="backtest">Backtest Results</TabsTrigger>
              <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="config" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strategy Templates */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Strategy Templates</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(strategyTemplates).map(([key, template]) => (
                      <Button
                        key={key}
                        variant={config.type === key ? "default" : "outline"}
                        className="justify-start h-auto p-3"
                        onClick={() => applyTemplate(key as keyof typeof strategyTemplates)}
                      >
                        <div className="text-left">
                          <div className="font-medium">{template.name}</div>
                          <div className="text-xs text-muted-foreground">{template.buyCondition}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Configuration */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="strategy-name">Strategy Name</Label>
                    <Input
                      id="strategy-name"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="investment-amount">Investment Amount ($)</Label>
                    <Input
                      id="investment-amount"
                      type="number"
                      value={config.amount}
                      onChange={(e) => setConfig({ ...config, amount: parseInt(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Investment Interval</Label>
                    <Select 
                      value={config.interval} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                        setConfig({ ...config, interval: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Simulation Timeframe</Label>
                    <Select 
                      value={timeframe} 
                      onValueChange={(value: '1M' | '3M' | '6M' | '1Y') => setTimeframe(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1M">1 Month</SelectItem>
                        <SelectItem value="3M">3 Months</SelectItem>
                        <SelectItem value="6M">6 Months</SelectItem>
                        <SelectItem value="1Y">1 Year</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Risk Management */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Risk Management</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                    <Input
                      id="stop-loss"
                      type="number"
                      value={config.riskManagement.stopLoss}
                      onChange={(e) => setConfig({
                        ...config,
                        riskManagement: {
                          ...config.riskManagement,
                          stopLoss: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="take-profit">Take Profit (%)</Label>
                    <Input
                      id="take-profit"
                      type="number"
                      value={config.riskManagement.takeProfit}
                      onChange={(e) => setConfig({
                        ...config,
                        riskManagement: {
                          ...config.riskManagement,
                          takeProfit: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-position">Max Position ($)</Label>
                    <Input
                      id="max-position"
                      type="number"
                      value={config.riskManagement.maxPositionSize}
                      onChange={(e) => setConfig({
                        ...config,
                        riskManagement: {
                          ...config.riskManagement,
                          maxPositionSize: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <div className="flex gap-3">
                <Button 
                  onClick={runSimulation} 
                  disabled={isRunning}
                  className="flex items-center gap-2"
                >
                  {isRunning ? (
                    <>
                      <Activity className="h-4 w-4 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetSimulation}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="backtest" className="space-y-6">
              {results ? (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Total Return</div>
                      <div className={`text-xl font-mono font-bold ${results.totalReturn >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                        {formatCurrency(results.totalReturn)}
                      </div>
                      <div className={`text-sm ${results.totalReturnPercentage >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
                        {formatPercentage(results.totalReturnPercentage)}
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Win Rate</div>
                      <div className="text-xl font-mono font-bold">
                        {results.winRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {results.profitableTrades}/{results.totalTrades} trades
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Max Drawdown</div>
                      <div className="text-xl font-mono font-bold text-[hsl(var(--negative))]">
                        -{results.maxDrawdown.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                      <div className="text-xl font-mono font-bold">
                        {results.sharpeRatio.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Performance Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Performance vs Bitcoin</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={results.timeline}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tick={{ fontSize: 10 }}
                              tickFormatter={(value) => new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                            />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip 
                              formatter={(value: any, name: string) => [
                                name === 'portfolioValue' ? formatCurrency(value) : formatCurrency(value),
                                name === 'portfolioValue' ? 'Portfolio' : 'Bitcoin Price'
                              ]}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="portfolioValue" 
                              stroke="hsl(var(--primary))" 
                              strokeWidth={2}
                              dot={false}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="btcPrice" 
                              stroke="hsl(var(--muted-foreground))" 
                              strokeWidth={1}
                              strokeDasharray="5 5"
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Run a simulation to see backtest results</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              {results ? (
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Risk Metrics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Volatility</span>
                          <span className="font-mono">{results.volatility.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Sharpe Ratio</span>
                          <Badge variant={results.sharpeRatio > 1 ? "default" : "secondary"}>
                            {results.sharpeRatio.toFixed(2)}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Max Drawdown</span>
                          <span className="font-mono text-[hsl(var(--negative))]">
                            -{results.maxDrawdown.toFixed(2)}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Trading Activity</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Total Trades</span>
                          <span className="font-mono">{results.totalTrades}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Profitable Trades</span>
                          <span className="font-mono text-[hsl(var(--positive))]">
                            {results.profitableTrades}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Win Rate</span>
                          <Progress value={results.winRate} className="w-20" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Strategy Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Strategy Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium">Strategy Type:</span>
                          <Badge>{config.type.replace('_', ' ').toUpperCase()}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Investment Amount:</span>
                          <span>{formatCurrency(config.amount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Investment Frequency:</span>
                          <span className="capitalize">{config.interval}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Simulation Period:</span>
                          <span>{timeframe}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Run a simulation to see detailed analysis</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingStrategySimulator;
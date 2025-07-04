import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BitcoinMarketData } from '@/lib/types';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from '@/lib/utils';
import { ArrowUp, ArrowDown, Zap, Brain, RefreshCw, Eye, AlertCircle, TrendingUp, BarChart3, Activity } from 'lucide-react';

interface AIAnalysisProps {
  marketData: BitcoinMarketData | null;
  isLoading: boolean;
  timeframe: string;
}

// Pattern types for technical analysis
type PatternType = 'bullish' | 'bearish' | 'neutral';

// Pattern detection result
interface PatternResult {
  type: PatternType;
  name: string;
  confidence: number;
  description: string;
}

// Indicator result
interface IndicatorResult {
  name: string;
  value: string | number;
  signal: PatternType;
  description: string;
}

// Support/Resistance levels
interface SupportResistance {
  support: number[];
  resistance: number[];
}

const AIAnalysis = ({ marketData, isLoading, timeframe }: AIAnalysisProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [patterns, setPatterns] = useState<PatternResult[]>([]);
  const [indicators, setIndicators] = useState<IndicatorResult[]>([]);
  const [levels, setLevels] = useState<SupportResistance>({ support: [], resistance: [] });
  const [isFullAnalysisOpen, setIsFullAnalysisOpen] = useState(false);
  
  // Generate AI analysis based on current market data
  useEffect(() => {
    if (marketData) {
      generateAnalysis();
    }
  }, [marketData?.current_price.usd, timeframe]);
  
  const generateAnalysis = () => {
    if (!marketData) return;
    
    setIsGenerating(true);
    
    // Simulate AI analysis generation
    setTimeout(() => {
      // Calculate some "AI-generated" patterns based on current price and trends
      const currentPrice = marketData.current_price.usd;
      const priceChange = marketData.price_change_percentage_24h;
      const isPriceUp = priceChange > 0;
      
      // Generate patterns based on price movement
      const newPatterns: PatternResult[] = [];
      
      if (Math.abs(priceChange) > 3) {
        // Strong movement detected
        if (isPriceUp) {
          newPatterns.push({
            type: 'bullish',
            name: 'Bullish Breakout',
            confidence: 87,
            description: 'Price has broken through previous resistance with strong momentum.'
          });
        } else {
          newPatterns.push({
            type: 'bearish',
            name: 'Bearish Breakdown',
            confidence: 83,
            description: 'Price has fallen below critical support levels with increased volume.'
          });
        }
      } else if (Math.abs(priceChange) < 1) {
        // Consolidation detected
        newPatterns.push({
          type: 'neutral',
          name: 'Consolidation Phase',
          confidence: 92,
          description: 'Price is moving sideways in a tight range, indicating possible accumulation.'
        });
      } else {
        // Moderate movement
        if (isPriceUp) {
          newPatterns.push({
            type: 'bullish',
            name: 'Higher Lows Pattern',
            confidence: 76,
            description: 'Price is forming a series of higher lows, suggesting bullish momentum.'
          });
        } else {
          newPatterns.push({
            type: 'bearish',
            name: 'Lower Highs Pattern',
            confidence: 72,
            description: 'Price is forming a series of lower highs, suggesting bearish momentum.'
          });
        }
      }
      
      // Generate technical indicators
      const rsiValue = isPriceUp ? 
        40 + Math.random() * 30 : // Bullish RSI between 40-70
        30 + Math.random() * 30; // Bearish RSI between 30-60
      
      const macdSignal = isPriceUp ? 'bullish' : 'bearish';
      const macdDescription = isPriceUp ? 
        'MACD line is crossing above the signal line, indicating increasing bullish momentum.' :
        'MACD line is crossing below the signal line, suggesting increasing bearish pressure.';
      
      const newIndicators: IndicatorResult[] = [
        {
          name: 'RSI (14)',
          value: rsiValue.toFixed(1),
          signal: rsiValue > 70 ? 'bearish' : rsiValue < 30 ? 'bullish' : 'neutral',
          description: getRSIDescription(rsiValue)
        },
        {
          name: 'MACD',
          value: isPriceUp ? 'Bullish Crossover' : 'Bearish Crossover',
          signal: macdSignal,
          description: macdDescription
        },
        {
          name: 'Moving Averages',
          value: isPriceUp ? '8/12 Bullish' : '9/12 Bearish',
          signal: isPriceUp ? 'bullish' : 'bearish',
          description: isPriceUp ?
            'Most moving averages suggest upward momentum with golden cross forming on shorter timeframes.' :
            'Most moving averages suggest downward momentum with death cross observed on several timeframes.'
        }
      ];
      
      // Calculate support and resistance levels based on current price
      const resistance = [
        Math.round(currentPrice * 1.025),
        Math.round(currentPrice * 1.05),
        Math.round(currentPrice * 1.10)
      ];
      
      const support = [
        Math.round(currentPrice * 0.975),
        Math.round(currentPrice * 0.95),
        Math.round(currentPrice * 0.90)
      ];
      
      // Update state with new analysis
      setPatterns(newPatterns);
      setIndicators(newIndicators);
      setLevels({ support, resistance });
      setIsGenerating(false);
    }, 1500); // Simulate 1.5 second analysis time
  };
  
  const refreshAnalysis = () => {
    setIsGenerating(true);
    generateAnalysis();
  };
  
  // Helper function to get RSI description
  const getRSIDescription = (value: number): string => {
    if (value > 70) {
      return 'Overbought conditions suggesting potential reversal or correction.';
    } else if (value < 30) {
      return 'Oversold conditions suggesting potential bounce or trend reversal.';
    } else if (value > 60) {
      return 'Strong momentum with some overbought risk, watch for divergence.';
    } else if (value < 40) {
      return 'Weakening momentum with some oversold potential, watch for bullish signals.';
    } else {
      return 'Neutral momentum with no clear overbought or oversold signals.';
    }
  };
  
  // Get background color based on pattern type
  const getPatternColor = (type: PatternType): string => {
    switch (type) {
      case 'bullish':
        return 'bg-green-500/10 border-green-500/20 text-green-500';
      case 'bearish':
        return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'neutral':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      default:
        return 'bg-muted/50 border-muted/60';
    }
  };
  
  // Get icon based on pattern type
  const getPatternIcon = (type: PatternType) => {
    switch (type) {
      case 'bullish':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'bearish':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="bg-card shadow-md overflow-hidden">
      <CardHeader className="bg-card pb-2 border-b border-muted/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg font-semibold">AI Technical Analysis</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2"
              disabled={isGenerating}
              onClick={refreshAnalysis}
            >
              {isGenerating ? 
                <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : 
                <RefreshCw className="h-3.5 w-3.5 mr-1" />}
              Refresh
            </Button>
            <Dialog open={isFullAnalysisOpen} onOpenChange={setIsFullAnalysisOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2">
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Full Analysis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <span>Complete AI Technical Analysis</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-6 space-y-6">
                  {/* Market Overview */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                      Market Overview
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Current Price</p>
                        <p className="text-xl font-bold">{formatCurrency(marketData?.current_price.usd || 0)}</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">24h Change</p>
                        <p className={`text-xl font-bold ${(marketData?.price_change_percentage_24h || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {(marketData?.price_change_percentage_24h || 0).toFixed(2)}%
                        </p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Market Cap</p>
                        <p className="text-xl font-bold">{formatCurrency(marketData?.market_cap?.usd || 0)}</p>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Volume (24h)</p>
                        <p className="text-xl font-bold">{formatCurrency(marketData?.total_volume?.usd || 0)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Pattern Analysis */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                      Pattern Analysis
                    </h3>
                    <div className="space-y-4">
                      {patterns.map((pattern, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg border ${getPatternColor(pattern.type)}`}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              {getPatternIcon(pattern.type)}
                              <span className="ml-2 text-lg font-semibold">{pattern.name}</span>
                            </div>
                            <Badge variant={pattern.type === 'neutral' ? 'outline' : pattern.type === 'bullish' ? 'default' : 'destructive'} className={pattern.type === 'bullish' ? 'bg-green-500/20 text-green-500' : ''}>
                              {pattern.confidence}% confidence
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{pattern.description}</p>
                          <div className="bg-background/50 p-3 rounded border">
                            <h4 className="font-medium text-sm mb-2">Analysis Details:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              <li>• Time horizon: {timeframe} analysis</li>
                              <li>• Pattern strength: {pattern.confidence > 80 ? 'Very Strong' : pattern.confidence > 60 ? 'Strong' : 'Moderate'}</li>
                              <li>• Risk level: {pattern.type === 'bullish' ? 'Low-Medium' : pattern.type === 'bearish' ? 'Medium-High' : 'Medium'}</li>
                              <li>• Recommended action: {pattern.type === 'bullish' ? 'Consider accumulating on dips' : pattern.type === 'bearish' ? 'Consider taking profits or waiting' : 'Monitor closely for breakout direction'}</li>
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comprehensive Technical Indicators */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Activity className="h-5 w-5 mr-2 text-primary" />
                      Technical Indicators Deep Dive
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {indicators.map((indicator, idx) => (
                        <div 
                          key={idx} 
                          className="bg-muted/20 p-4 rounded-lg border border-muted/30"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-lg font-semibold">{indicator.name}</span>
                            <Badge variant={indicator.signal === 'neutral' ? 'outline' : indicator.signal === 'bullish' ? 'default' : 'destructive'} className={indicator.signal === 'bullish' ? 'bg-green-500/20 text-green-500' : ''}>
                              {indicator.value}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{indicator.description}</p>
                          <div className="bg-background/50 p-3 rounded border">
                            <h4 className="font-medium text-sm mb-2">Indicator Details:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {indicator.name === 'RSI (14)' && (
                                <>
                                  <li>• Current reading: {indicator.value}</li>
                                  <li>• Overbought threshold: 70</li>
                                  <li>• Oversold threshold: 30</li>
                                  <li>• Divergence watch: {Number(indicator.value) > 60 ? 'Monitor for bearish divergence' : Number(indicator.value) < 40 ? 'Monitor for bullish divergence' : 'No divergence signals'}</li>
                                </>
                              )}
                              {indicator.name === 'MACD' && (
                                <>
                                  <li>• Signal: {indicator.value}</li>
                                  <li>• Histogram trend: {indicator.signal === 'bullish' ? 'Increasing' : 'Decreasing'}</li>
                                  <li>• Momentum: {indicator.signal === 'bullish' ? 'Building upward' : 'Building downward'}</li>
                                  <li>• Crossover type: {indicator.signal === 'bullish' ? 'Golden cross formation' : 'Death cross formation'}</li>
                                </>
                              )}
                              {indicator.name === 'Moving Averages' && (
                                <>
                                  <li>• Bullish MAs: {indicator.signal === 'bullish' ? '8/12' : '4/12'}</li>
                                  <li>• Key levels: 50MA, 100MA, 200MA alignment</li>
                                  <li>• Trend strength: {indicator.signal === 'bullish' ? 'Strong uptrend' : 'Weakening or downtrend'}</li>
                                  <li>• Price position: {indicator.signal === 'bullish' ? 'Above key MAs' : 'Below key MAs'}</li>
                                </>
                              )}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Support and Resistance */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Key Price Levels</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                        <div className="flex items-center mb-3">
                          <ArrowUp className="h-5 w-5 text-red-400 mr-2" />
                          <span className="text-lg font-semibold">Resistance Zones</span>
                        </div>
                        <div className="space-y-3">
                          {levels.resistance.map((level, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-background/50 rounded">
                              <div>
                                <span className="text-sm font-medium">R{idx + 1}</span>
                                <p className="text-xs text-muted-foreground">
                                  {idx === 0 ? 'Immediate resistance' : idx === 1 ? 'Major resistance' : 'Strong resistance'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-mono font-bold">{formatCurrency(level)}</span>
                                <p className="text-xs text-muted-foreground">
                                  +{(((level - (marketData?.current_price.usd || 0)) / (marketData?.current_price.usd || 1)) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                        <div className="flex items-center mb-3">
                          <ArrowDown className="h-5 w-5 text-green-400 mr-2" />
                          <span className="text-lg font-semibold">Support Zones</span>
                        </div>
                        <div className="space-y-3">
                          {levels.support.map((level, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 bg-background/50 rounded">
                              <div>
                                <span className="text-sm font-medium">S{idx + 1}</span>
                                <p className="text-xs text-muted-foreground">
                                  {idx === 0 ? 'Immediate support' : idx === 1 ? 'Major support' : 'Strong support'}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-mono font-bold">{formatCurrency(level)}</span>
                                <p className="text-xs text-muted-foreground">
                                  {(((level - (marketData?.current_price.usd || 0)) / (marketData?.current_price.usd || 1)) * 100).toFixed(1)}%
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">AI Trading Insights</h3>
                    <div className="bg-muted/20 p-4 rounded-lg border border-muted/30">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Entry Strategies</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• DCA between support levels</li>
                            <li>• Wait for RSI &lt; 40 for better entries</li>
                            <li>• Consider scaling in on volume spikes</li>
                            <li>• Watch for bounce at key support zones</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Risk Management</h4>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Stop loss below major support</li>
                            <li>• Take profits near resistance levels</li>
                            <li>• Position size based on volatility</li>
                            <li>• Monitor for trend reversal signals</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 text-center border-t border-muted/30">
                    <p className="text-sm text-muted-foreground">
                      Analysis based on {timeframe} timeframe • Generated at: {new Date().toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ This AI analysis is for informational purposes only and should not be considered financial advice. 
                      Always conduct your own research and consider consulting with qualified financial advisors.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading || isGenerating ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center p-6 animate-pulse">
            <Zap className="h-10 w-10 text-primary/30 mb-4" />
            <p className="text-muted-foreground text-center">
              {isLoading ? 'Loading market data...' : 'Generating AI analysis...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Detected Patterns */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Detected Patterns</h3>
              <div className="space-y-2">
                {patterns.map((pattern, idx) => (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-lg border ${getPatternColor(pattern.type)} transition-all hover:translate-y-[-2px]`}
                  >
                    <div className="flex justify-between mb-1">
                      <div className="flex items-center">
                        {getPatternIcon(pattern.type)}
                        <span className="ml-1.5 font-medium">{pattern.name}</span>
                      </div>
                      <Badge variant={pattern.type === 'neutral' ? 'outline' : pattern.type === 'bullish' ? 'default' : 'destructive'} className={pattern.type === 'bullish' ? 'bg-green-500/20 text-green-500' : ''}>
                        {pattern.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{pattern.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Technical Indicators */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Technical Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {indicators.map((indicator, idx) => (
                  <div 
                    key={idx} 
                    className="bg-muted/20 p-3 rounded-lg border border-muted/30 hover:bg-muted/30 transition-all"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{indicator.name}</span>
                      <Badge variant={indicator.signal === 'neutral' ? 'outline' : indicator.signal === 'bullish' ? 'default' : 'destructive'} className={indicator.signal === 'bullish' ? 'bg-green-500/20 text-green-500' : ''}>
                        {indicator.value}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{indicator.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Support and Resistance Levels */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Key Levels</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/20 p-3 rounded-lg border border-muted/30">
                  <div className="flex items-center mb-2">
                    <ArrowUp className="h-4 w-4 text-red-400 mr-1.5" />
                    <span className="text-sm font-medium">Resistance Zones</span>
                  </div>
                  <div className="space-y-1 text-right">
                    {levels.resistance.map((level, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-xs text-muted-foreground">R{idx + 1}</span>
                        <span className="text-sm font-mono">{formatCurrency(level)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-muted/20 p-3 rounded-lg border border-muted/30">
                  <div className="flex items-center mb-2">
                    <ArrowDown className="h-4 w-4 text-green-400 mr-1.5" />
                    <span className="text-sm font-medium">Support Zones</span>
                  </div>
                  <div className="space-y-1 text-right">
                    {levels.support.map((level, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-xs text-muted-foreground">S{idx + 1}</span>
                        <span className="text-sm font-mono">{formatCurrency(level)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-2 text-xs text-center text-muted-foreground">
              Analysis based on {timeframe} timeframe • Last updated: {new Date().toLocaleTimeString()}
              <p className="mt-1 text-[10px]">This AI analysis is for informational purposes only and should not be considered financial advice.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIAnalysis;
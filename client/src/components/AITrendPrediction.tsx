import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, TrendingDown, Activity, Target, Calendar, AlertTriangle, Zap, BarChart3, TrendingUpDown } from "lucide-react";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface TimeframePrediction {
  timeframe: string;
  duration: string;
  targetPrice: number;
  lowEstimate: number;
  highEstimate: number;
  probability: number;
  keyDrivers: string[];
  risks: string[];
  technicalOutlook: string;
}

interface MultiTimeframePredictions {
  currentPrice: number;
  timestamp: string;
  predictions: {
    oneMonth: TimeframePrediction;
    threeMonth: TimeframePrediction;
    sixMonth: TimeframePrediction;
    oneYear: TimeframePrediction;
  };
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  marketRegime: string;
  volatilityOutlook: string;
  riskRewardRatio: number;
  keyEvents: Array<{
    date: string;
    event: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  aiInsights: string[];
}

const AITrendPrediction = () => {
  const [activeTab, setActiveTab] = useState("1m");

  const { data: predictions, isLoading } = useQuery<MultiTimeframePredictions>({
    queryKey: ["/api/ai/multi-timeframe-predictions"],
    refetchInterval: 15 * 60 * 1000, // Refresh every 15 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Multi-Timeframe Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!predictions) {
    return null;
  }

  const getDirectionIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-[hsl(var(--positive))]" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-[hsl(var(--negative))]" />;
      default: return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getDirectionColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'text-[hsl(var(--positive))]';
      case 'bearish': return 'text-[hsl(var(--negative))]';
      default: return 'text-yellow-600';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderPredictionCard = (prediction: TimeframePrediction, currentPrice: number) => {
    const priceChange = ((prediction.targetPrice - currentPrice) / currentPrice) * 100;
    const upside = ((prediction.highEstimate - currentPrice) / currentPrice) * 100;
    const downside = ((prediction.lowEstimate - currentPrice) / currentPrice) * 100;

    return (
      <div className="space-y-6">
        {/* Price Targets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg border border-muted/20">
            <div className="text-xs text-muted-foreground mb-1">Target Price</div>
            <div className="text-2xl font-bold font-mono">{formatCurrency(prediction.targetPrice)}</div>
            <div className={`text-sm font-medium mt-1 ${priceChange >= 0 ? 'text-[hsl(var(--positive))]' : 'text-[hsl(var(--negative))]'}`}>
              {formatPercentage(priceChange)}
            </div>
          </div>

          <div className="text-center p-4 bg-green-500/5 rounded-lg border border-green-500/20">
            <div className="text-xs text-muted-foreground mb-1">Best Case</div>
            <div className="text-xl font-bold font-mono text-[hsl(var(--positive))]">{formatCurrency(prediction.highEstimate)}</div>
            <div className="text-sm text-[hsl(var(--positive))] mt-1">
              +{formatPercentage(upside)}
            </div>
          </div>

          <div className="text-center p-4 bg-red-500/5 rounded-lg border border-red-500/20">
            <div className="text-xs text-muted-foreground mb-1">Worst Case</div>
            <div className="text-xl font-bold font-mono text-[hsl(var(--negative))]">{formatCurrency(prediction.lowEstimate)}</div>
            <div className="text-sm text-[hsl(var(--negative))] mt-1">
              {formatPercentage(downside)}
            </div>
          </div>
        </div>

        {/* Probability & Technical Outlook */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Prediction Confidence</span>
            <span className="text-sm font-mono">{prediction.probability}%</span>
          </div>
          <Progress value={prediction.probability} className="h-2" />
          
          <div className="p-3 bg-muted/30 rounded-lg border border-muted/20">
            <div className="text-xs text-muted-foreground mb-1">Technical Outlook</div>
            <p className="text-sm">{prediction.technicalOutlook}</p>
          </div>
        </div>

        {/* Key Drivers */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 text-[hsl(var(--positive))]" />
            Key Bullish Drivers
          </h4>
          <div className="space-y-2">
            {prediction.keyDrivers.map((driver, index) => (
              <div key={index} className="flex items-start gap-2 text-sm p-2 bg-green-500/5 rounded border border-green-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--positive))] mt-1.5 flex-shrink-0" />
                <span className="text-muted-foreground">{driver}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-[hsl(var(--negative))]" />
            Key Risks
          </h4>
          <div className="space-y-2">
            {prediction.risks.map((risk, index) => (
              <div key={index} className="flex items-start gap-2 text-sm p-2 bg-red-500/5 rounded border border-red-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--negative))] mt-1.5 flex-shrink-0" />
                <span className="text-muted-foreground">{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Multi-Timeframe Predictions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Market Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg border border-muted/20">
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Overall Sentiment</div>
            <div className="flex items-center justify-center gap-2">
              {getDirectionIcon(predictions.overallSentiment)}
              <span className={`text-lg font-bold capitalize ${getDirectionColor(predictions.overallSentiment)}`}>
                {predictions.overallSentiment}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Market Regime</div>
            <div className="text-sm font-medium flex items-center justify-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {predictions.marketRegime}
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Risk/Reward Ratio</div>
            <div className="text-lg font-bold font-mono flex items-center justify-center gap-2">
              <TrendingUpDown className="h-4 w-4" />
              {predictions.riskRewardRatio.toFixed(1)}:1
            </div>
          </div>
        </div>

        {/* Timeframe Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="1m" data-testid="tab-1month">1 Month</TabsTrigger>
            <TabsTrigger value="3m" data-testid="tab-3month">3 Months</TabsTrigger>
            <TabsTrigger value="6m" data-testid="tab-6month">6 Months</TabsTrigger>
            <TabsTrigger value="1y" data-testid="tab-1year">1 Year</TabsTrigger>
          </TabsList>

          <TabsContent value="1m" className="mt-6">
            {renderPredictionCard(predictions.predictions.oneMonth, predictions.currentPrice)}
          </TabsContent>

          <TabsContent value="3m" className="mt-6">
            {renderPredictionCard(predictions.predictions.threeMonth, predictions.currentPrice)}
          </TabsContent>

          <TabsContent value="6m" className="mt-6">
            {renderPredictionCard(predictions.predictions.sixMonth, predictions.currentPrice)}
          </TabsContent>

          <TabsContent value="1y" className="mt-6">
            {renderPredictionCard(predictions.predictions.oneYear, predictions.currentPrice)}
          </TabsContent>
        </Tabs>

        {/* Key Events */}
        {predictions.keyEvents && predictions.keyEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming Key Events
            </h4>
            <div className="grid gap-2">
              {predictions.keyEvents.map((event, index) => (
                <div key={index} className="flex items-start justify-between p-3 rounded-lg border border-muted/20 bg-muted/20">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{event.event}</div>
                    <div className="text-xs text-muted-foreground mt-1">{event.date}</div>
                  </div>
                  <Badge variant="outline" className={`text-xs ${getImpactColor(event.impact)}`}>
                    {event.impact} impact
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Insights */}
        {predictions.aiInsights && predictions.aiInsights.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="h-4 w-4" />
              AI Strategic Insights
            </h4>
            <div className="space-y-2">
              {predictions.aiInsights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2 text-sm p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-muted-foreground">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="space-y-2 pt-3 border-t border-muted/20">
          <div className="text-xs text-muted-foreground text-center">
            Volatility Outlook: {predictions.volatilityOutlook}
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Predictions update every 15 minutes • Powered by Grok AI • Not financial advice
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITrendPrediction;

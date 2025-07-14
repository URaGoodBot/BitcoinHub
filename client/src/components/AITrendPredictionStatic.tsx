import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, TrendingUp, Brain, Clock, Target } from 'lucide-react';

const AITrendPredictionStatic = () => {
  // Static trend prediction data for the static website
  const predictionData = {
    prediction: {
      direction: "Bullish",
      confidence: 78,
      targetPrice: 125000,
      timeframe: "24-48h"
    },
    factors: [
      { name: "Technical Momentum", weight: 0.3, signal: "Bullish" },
      { name: "Market Sentiment", weight: 0.25, signal: "Bullish" },
      { name: "On-chain Metrics", weight: 0.25, signal: "Neutral" },
      { name: "Macro Environment", weight: 0.2, signal: "Bullish" }
    ],
    reasoning: "Strong technical momentum combined with positive market sentiment suggests continued upward movement. Fed policy stability and institutional interest remain supportive factors."
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getSignalColor = (signal: string) => {
    switch (signal.toLowerCase()) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      case 'neutral':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const getSignalBadge = (signal: string) => {
    switch (signal.toLowerCase()) {
      case 'bullish':
        return <Badge variant="default" className="bg-green-500/20 text-green-500">Bullish</Badge>;
      case 'bearish':
        return <Badge variant="destructive">Bearish</Badge>;
      case 'neutral':
        return <Badge variant="outline">Neutral</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-blue-500" />
          <span>AI Trend Prediction</span>
          <Badge variant="outline" className="ml-auto">
            <Clock className="h-3 w-3 mr-1" />
            {predictionData.prediction.timeframe}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Main Prediction */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <TrendingUp className={`h-6 w-6 ${getSignalColor(predictionData.prediction.direction)}`} />
              <div className="text-2xl font-bold">
                {predictionData.prediction.direction.toUpperCase()}
              </div>
            </div>
            <div className="text-lg text-muted-foreground">
              Target: {formatCurrency(predictionData.prediction.targetPrice)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge variant="outline">{predictionData.prediction.confidence}%</Badge>
            </div>
          </div>

          {/* Confidence Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Prediction Confidence</span>
              <span>{predictionData.prediction.confidence}%</span>
            </div>
            <Progress value={predictionData.prediction.confidence} className="h-3" />
          </div>

          {/* Analysis Factors */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Analysis Factors</span>
            </h4>
            
            {predictionData.factors.map((factor, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{factor.name}</span>
                    {getSignalBadge(factor.signal)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(factor.weight * 100)}% weight
                  </span>
                </div>
                <Progress value={factor.weight * 100} className="h-2" />
              </div>
            ))}
          </div>

          {/* AI Reasoning */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
              <Target className="h-4 w-4" />
              <span>AI Analysis</span>
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {predictionData.reasoning}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This AI prediction is for informational purposes only and should not be considered financial advice. 
              Always conduct your own research and consider your risk tolerance before making investment decisions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AITrendPredictionStatic;
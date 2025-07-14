import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BitcoinMarketData } from '@/lib/types';
import { Brain, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

interface AIAnalysisProps {
  marketData?: BitcoinMarketData;
  isLoading?: boolean;
  timeframe?: string;
}

const AIAnalysisStatic = ({ marketData, isLoading, timeframe = "1D" }: AIAnalysisProps) => {
  // Static AI analysis data for the static website
  const analysisData = {
    technicalAnalysis: {
      rsi: 68,
      macd: "Bullish",
      movingAverages: {
        ma20: 118500,
        ma50: 115200,
        ma200: 95800
      },
      supportResistance: {
        support: [115000, 110000, 105000],
        resistance: [125000, 130000, 135000]
      }
    },
    marketSignals: {
      trend: "Bullish",
      momentum: "Strong",
      volatility: "Moderate"
    },
    priceTargets: {
      nextTarget: 125000,
      confidence: 75,
      timeframe: "7-14 days"
    },
    reasoning: "Bitcoin is showing strong bullish momentum with RSI at 68, indicating room for further upside. Price is trading above all major moving averages, confirming the uptrend. Next resistance at $125,000 presents a reasonable target within 7-14 days."
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>AI Technical Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>AI Technical Analysis</span>
          <Badge variant="outline">{timeframe}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Market Signals */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {analysisData.marketSignals.trend === "Bullish" ? (
                  <TrendingUp className="h-5 w-5 text-green-500" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-500" />
                )}
              </div>
              <div className="text-lg font-semibold">{analysisData.marketSignals.trend}</div>
              <div className="text-sm text-muted-foreground">Trend</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analysisData.marketSignals.momentum}</div>
              <div className="text-sm text-muted-foreground">Momentum</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{analysisData.marketSignals.volatility}</div>
              <div className="text-sm text-muted-foreground">Volatility</div>
            </div>
          </div>

          {/* Technical Indicators */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Technical Indicators</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">RSI (14)</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{analysisData.technicalAnalysis.rsi}</span>
                  <Badge variant={analysisData.technicalAnalysis.rsi > 70 ? "destructive" : analysisData.technicalAnalysis.rsi < 30 ? "default" : "secondary"}>
                    {analysisData.technicalAnalysis.rsi > 70 ? "Overbought" : analysisData.technicalAnalysis.rsi < 30 ? "Oversold" : "Neutral"}
                  </Badge>
                </div>
              </div>
              <Progress value={analysisData.technicalAnalysis.rsi} className="h-2" />

              <div className="flex items-center justify-between">
                <span className="text-sm">MACD</span>
                <Badge variant={analysisData.technicalAnalysis.macd === "Bullish" ? "default" : "destructive"}>
                  {analysisData.technicalAnalysis.macd}
                </Badge>
              </div>
            </div>
          </div>

          {/* Moving Averages */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Moving Averages</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium">MA20</div>
                <div className="text-muted-foreground">{formatCurrency(analysisData.technicalAnalysis.movingAverages.ma20)}</div>
              </div>
              <div>
                <div className="font-medium">MA50</div>
                <div className="text-muted-foreground">{formatCurrency(analysisData.technicalAnalysis.movingAverages.ma50)}</div>
              </div>
              <div>
                <div className="font-medium">MA200</div>
                <div className="text-muted-foreground">{formatCurrency(analysisData.technicalAnalysis.movingAverages.ma200)}</div>
              </div>
            </div>
          </div>

          {/* Support and Resistance */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Key Levels</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-green-600 mb-2">Support Levels</div>
                {analysisData.technicalAnalysis.supportResistance.support.map((level, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {formatCurrency(level)}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-medium text-red-600 mb-2">Resistance Levels</div>
                {analysisData.technicalAnalysis.supportResistance.resistance.map((level, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    {formatCurrency(level)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Price Target */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4" />
              <h4 className="text-sm font-medium">Price Target</h4>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold">{formatCurrency(analysisData.priceTargets.nextTarget)}</span>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{analysisData.priceTargets.timeframe}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Confidence:</span>
              <Badge variant="outline">{analysisData.priceTargets.confidence}%</Badge>
            </div>
          </div>

          {/* AI Reasoning */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium mb-2">AI Analysis</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {analysisData.reasoning}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAnalysisStatic;
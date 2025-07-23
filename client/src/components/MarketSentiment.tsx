import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BitcoinMarketData } from '@/lib/types';
import { RefreshCw, TrendingUp, TrendingDown, Newspaper, Twitter, MessageCircle, Users, Globe, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface MarketSentimentProps {
  marketData: BitcoinMarketData | null;
  isLoading: boolean;
}

type SentimentType = 'bullish' | 'bearish' | 'neutral';

interface SentimentScore {
  source: string;
  score: number;
  type: SentimentType;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  lastUpdated: string;
}

interface SentimentKeyword {
  text: string;
  weight: number;
  type: SentimentType;
}

interface SentimentData {
  overall: SentimentType;
  overallScore: number;
  confidence: number;
  sources: SentimentScore[];
  keywords: SentimentKeyword[];
  lastUpdated: string;
}

const MarketSentiment = ({ marketData, isLoading }: MarketSentimentProps) => {
  // Fetch real-time sentiment data from multiple authentic sources
  const { data: sentimentData, isLoading: isLoadingSentiment, refetch } = useQuery<SentimentData>({
    queryKey: ['/api/sentiment/analysis'],
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
    staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
  });

  // Get appropriate icon for each sentiment source
  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'News & Media':
        return <Newspaper className="h-4 w-4 text-blue-400" />;
      case 'Social Sentiment':
        return <Twitter className="h-4 w-4 text-sky-400" />;
      case 'Market Data':
        return <BarChart3 className="h-4 w-4 text-green-400" />;
      case 'Trading Activity':
        return <Users className="h-4 w-4 text-amber-400" />;
      default:
        return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSourceDescription = (source: string, score: number, type: SentimentType) => {
    const scoreText = score >= 80 ? 'extremely bullish' : 
                      score >= 70 ? 'bullish' :
                      score >= 60 ? 'moderately bullish' :
                      score >= 40 ? 'neutral' :
                      score >= 30 ? 'moderately bearish' :
                      score >= 20 ? 'bearish' : 'extremely bearish';
    
    switch (source) {
      case 'News & Media':
        return `Real-time Bitcoin news analysis using Grok AI shows ${scoreText} sentiment`;
      case 'Social Sentiment':
        return `Reddit r/Bitcoin community sentiment analysis shows ${scoreText} mood`;
      case 'Market Data':
        return `CoinPaprika on-chain network metrics indicate ${scoreText} fundamentals`;
      case 'Trading Activity':
        return `Fear & Greed Index and derivatives data shows ${scoreText} trading sentiment`;
      default:
        return `Comprehensive market analysis indicates ${scoreText} sentiment`;
    }
  };

  const getSourceUrl = (source: string) => {
    switch (source) {
      case 'News & Media':
        return 'https://newsapi.org/';
      case 'Social Sentiment':
        return 'https://www.reddit.com/r/Bitcoin/';
      case 'Market Data':
        return 'https://coinpaprika.com/coin/btc-bitcoin/';
      case 'Trading Activity':
        return 'https://alternative.me/crypto/fear-and-greed-index/';
      default:
        return 'https://coinmarketcap.com/currencies/bitcoin/';
    }
  };

  const getSentimentBadge = (type: SentimentType) => {
    switch (type) {
      case 'bullish':
        return (
          <Badge variant="default" className="bg-green-500/20 text-green-500 ml-2">
            <TrendingUp className="h-3 w-3 mr-1" /> Bullish
          </Badge>
        );
      case 'bearish':
        return (
          <Badge variant="destructive" className="ml-2">
            <TrendingDown className="h-3 w-3 mr-1" /> Bearish
          </Badge>
        );
      case 'neutral':
        return (
          <Badge variant="outline" className="ml-2">
            <Globe className="h-3 w-3 mr-1" /> Neutral
          </Badge>
        );
    }
  };

  const getProgressColor = (type: SentimentType) => {
    switch (type) {
      case 'bullish':
        return 'bg-green-500';
      case 'bearish':
        return 'bg-red-500';
      case 'neutral':
        return 'bg-orange-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'decreasing':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Globe className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading || isLoadingSentiment) {
    return (
      <Card className="bg-card border-muted/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Market Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Loading skeleton */}
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                      <div className="h-2 bg-muted rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sentimentData) {
    return (
      <Card className="bg-card border-muted/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Market Sentiment Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Unable to load sentiment data. Please try again.
            </p>
            <Button 
              variant="outline" 
              onClick={() => refetch()}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-muted/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Market Sentiment Analysis
            {getSentimentBadge(sentimentData.overall)}
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoadingSentiment}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingSentiment ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Sentiment Score with Actionable Context */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">
                Market Sentiment: {sentimentData.overallScore}/100
              </p>
              <p className="text-xs text-muted-foreground">
                Confidence: {Math.round(sentimentData.confidence * 100)}% • Updated {formatTime(sentimentData.lastUpdated)}
              </p>
            </div>
            <div className="text-right">
              {getSentimentBadge(sentimentData.overall)}
            </div>
          </div>
          <Progress 
            value={sentimentData.overallScore} 
            className="h-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Very Bearish (0-20)</span>
            <span>Neutral (40-60)</span>
            <span>Very Bullish (80-100)</span>
          </div>
        </div>

        {/* Clickable Source Cards with Data Sources */}
        <div className="grid grid-cols-2 gap-3">
          {sentimentData.sources.map((source, index) => (
            <button
              key={index}
              onClick={() => window.open(getSourceUrl(source.source), '_blank')}
              className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer text-left group"
            >
              <div className="flex items-center gap-2">
                {getSourceIcon(source.source)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium group-hover:text-blue-400 transition-colors">
                      {source.source}
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(source.trend)}
                      <span className="text-xs font-semibold text-muted-foreground">
                        {Math.round(source.score)}
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={source.score} 
                    className="h-1 mt-1"
                  />
                </div>
              </div>
              <div className="text-xs text-muted-foreground leading-tight">
                {getSourceDescription(source.source, source.score, source.type)}
              </div>
              <div className="text-xs text-blue-400/70 group-hover:text-blue-400 transition-colors flex items-center gap-1">
                <span>View live data</span>
                <Globe className="h-3 w-3" />
              </div>
            </button>
          ))}
        </div>

        {/* Actionable Market Signals */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">
            Key Market Signals & Trading Context
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Current Market Context */}
            <div className="p-3 rounded-lg bg-muted/30 border">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">CURRENT CONTEXT</h5>
              <div className="space-y-1">
                <p className="text-xs text-foreground">
                  Market sentiment: <span className="font-medium">{sentimentData.overall.charAt(0).toUpperCase() + sentimentData.overall.slice(1)}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {sentimentData.overallScore >= 70 ? "Strong bullish momentum with institutional backing" :
                   sentimentData.overallScore >= 60 ? "Moderately positive sentiment, watch for continuation" :
                   sentimentData.overallScore >= 40 ? "Neutral market, awaiting directional catalyst" :
                   sentimentData.overallScore >= 30 ? "Bearish sentiment, look for support levels" :
                   "Extreme bearish conditions, high volatility expected"}
                </p>
              </div>
            </div>
            
            {/* Trading Signals */}
            <div className="p-3 rounded-lg bg-muted/30 border">
              <h5 className="text-xs font-medium text-muted-foreground mb-2">TRADING SIGNALS</h5>
              <div className="space-y-1">
                <p className="text-xs text-foreground">
                  {sentimentData.overallScore >= 70 ? "🟢 Consider long positions" :
                   sentimentData.overallScore >= 60 ? "🟡 Cautious optimism" :
                   sentimentData.overallScore >= 40 ? "⚪ Range-bound trading" :
                   sentimentData.overallScore >= 30 ? "🟡 Risk management critical" :
                   "🔴 High caution advised"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Confidence: {Math.round(sentimentData.confidence * 100)}% • 
                  Sources: {sentimentData.sources.length} live feeds
                </p>
              </div>
            </div>
          </div>
          
          {/* Trending Keywords */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-muted-foreground">TRENDING MARKET THEMES</h5>
            <div className="flex flex-wrap gap-2">
              {sentimentData.keywords.slice(0, 8).map((keyword, index) => (
                <Badge 
                  key={index}
                  variant={keyword.type === 'bullish' ? 'default' : keyword.type === 'bearish' ? 'destructive' : 'outline'}
                  className={`text-xs ${
                    keyword.type === 'bullish' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                    keyword.type === 'bearish' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                    'bg-orange-500/20 text-orange-500 border-orange-500/30'
                  }`}
                >
                  {keyword.text}
              </Badge>
            ))}
            </div>
          </div>
        </div>

        {/* Live Data Attribution with Disclaimers */}
        <div className="pt-3 border-t border-muted/20 space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            <p className="font-medium">Live Data Sources</p>
            <p>NewsAPI • Reddit r/Bitcoin • CoinPaprika • Fear & Greed Index</p>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            Updated {formatTime(sentimentData.lastUpdated)} • 
            Analysis powered by Grok AI • 
            Click source cards for live data
          </div>
          <div className="text-xs text-amber-600/80 text-center bg-amber-500/10 rounded p-2">
            ⚠️ For informational purposes only. Not financial advice. Always DYOR.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSentiment;
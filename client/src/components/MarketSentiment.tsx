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
    const scoreText = score >= 70 ? 'very positive' : 
                      score >= 60 ? 'positive' :
                      score >= 40 ? 'neutral' :
                      score >= 30 ? 'negative' : 'very negative';
    
    switch (source) {
      case 'News & Media':
        return `Bitcoin news articles show ${scoreText} sentiment (${Math.round(score)}/100)`;
      case 'Social Sentiment':
        return `Social media discussions are ${scoreText} about Bitcoin (${Math.round(score)}/100)`;
      case 'Market Data':
        return `On-chain metrics and market indicators are ${scoreText} (${Math.round(score)}/100)`;
      case 'Trading Activity':
        return `Derivatives and trading patterns show ${scoreText} sentiment (${Math.round(score)}/100)`;
      default:
        return `Sentiment analysis shows ${scoreText} outlook (${Math.round(score)}/100)`;
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
        {/* Overall Sentiment Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              Overall Score: {sentimentData.overallScore}/100
            </p>
            <span className="text-xs text-muted-foreground">
              Based on real-time news & market data
            </span>
          </div>
          <Progress 
            value={sentimentData.overallScore} 
            className="h-3"
          />
        </div>

        {/* Simplified Source Cards */}
        <div className="grid grid-cols-2 gap-3">
          {sentimentData.sources.map((source, index) => (
            <div key={index} className="flex flex-col gap-2 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2">
                {getSourceIcon(source.source)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{source.source}</span>
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
            </div>
          ))}
        </div>

        {/* Key Market Indicators */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">
            Key Market Signals
          </h4>
          <div className="flex flex-wrap gap-2">
            {sentimentData.keywords.slice(0, 6).map((keyword, index) => (
              <Badge 
                key={index}
                variant={keyword.type === 'bullish' ? 'default' : keyword.type === 'bearish' ? 'destructive' : 'outline'}
                className={`text-xs ${
                  keyword.type === 'bullish' ? 'bg-green-500/20 text-green-500' :
                  keyword.type === 'bearish' ? 'bg-red-500/20 text-red-500' :
                  'bg-orange-500/20 text-orange-500'
                }`}
              >
                {keyword.text}
              </Badge>
            ))}
          </div>
        </div>

        {/* Simplified Footer */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-muted/20">
          Live data from news, social media, and market analysis • Updated {formatTime(sentimentData.lastUpdated)}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSentiment;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BitcoinMarketData } from '@/lib/types';
import { TrendingUp, TrendingDown, Newspaper, Users, Globe, BarChart3 } from 'lucide-react';

interface MarketSentimentProps {
  marketData?: BitcoinMarketData;
  isLoading?: boolean;
}

const MarketSentimentStatic = ({ marketData, isLoading }: MarketSentimentProps) => {
  // Static sentiment data for the static website
  const sentimentData = {
    overall: "bullish" as const,
    overallScore: 68,
    confidence: 75,
    sources: [
      { source: "Social Media", score: 72, type: "bullish" as const, confidence: 80 },
      { source: "News Analysis", score: 65, type: "bullish" as const, confidence: 70 },
      { source: "Technical Signals", score: 78, type: "bullish" as const, confidence: 85 },
      { source: "On-chain Metrics", score: 60, type: "neutral" as const, confidence: 75 }
    ],
    keywords: [
      { text: "adoption", weight: 85, type: "bullish" as const },
      { text: "institutional", weight: 78, type: "bullish" as const },
      { text: "hodl", weight: 72, type: "bullish" as const },
      { text: "resistance", weight: 45, type: "neutral" as const }
    ],
    lastUpdated: new Date().toISOString()
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'News Analysis':
        return <Newspaper className="h-4 w-4 text-blue-400" />;
      case 'Social Media':
        return <Users className="h-4 w-4 text-sky-400" />;
      case 'Technical Signals':
        return <BarChart3 className="h-4 w-4 text-green-400" />;
      case 'On-chain Metrics':
        return <Globe className="h-4 w-4 text-amber-400" />;
      default:
        return <Globe className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSentimentBadge = (type: string) => {
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
      default:
        return (
          <Badge variant="secondary" className="ml-2">
            Unknown
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Market Sentiment Analysis</span>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Market Sentiment Analysis</span>
          <Badge variant={sentimentData.overall === 'bullish' ? 'default' : sentimentData.overall === 'bearish' ? 'destructive' : 'secondary'}>
            {sentimentData.overall.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Sentiment Score */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">
                {sentimentData.overallScore}/100
              </div>
              <p className="text-sm text-muted-foreground">
                Overall Sentiment Score
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">
                {sentimentData.confidence}%
              </div>
              <p className="text-sm text-muted-foreground">
                Confidence
              </p>
            </div>
          </div>

          {/* Sentiment Sources */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Sentiment Sources</h4>
            {sentimentData.sources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(source.source)}
                    <span className="text-sm font-medium">{source.source}</span>
                    {getSentimentBadge(source.type)}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {source.score}/100
                  </span>
                </div>
                <Progress value={source.score} className="h-2" />
              </div>
            ))}
          </div>

          {/* Trending Keywords */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Trending Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {sentimentData.keywords.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant={keyword.type === 'bullish' ? 'default' : keyword.type === 'bearish' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {keyword.text}
                </Badge>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(sentimentData.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketSentimentStatic;
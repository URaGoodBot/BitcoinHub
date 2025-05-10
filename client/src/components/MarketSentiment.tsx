import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BitcoinMarketData } from '@/lib/types';
import { RefreshCw, TrendingUp, TrendingDown, Newspaper, Twitter, MessageCircle, Users, Globe } from 'lucide-react';

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
  icon: React.ReactNode;
}

interface SentimentKeyword {
  text: string;
  weight: number;
  type: SentimentType;
}

const MarketSentiment = ({ marketData, isLoading }: MarketSentimentProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [overallSentiment, setOverallSentiment] = useState<SentimentType>('neutral');
  const [sentimentScores, setSentimentScores] = useState<SentimentScore[]>([]);
  const [keywords, setKeywords] = useState<SentimentKeyword[]>([]);
  
  // Generate sentiment analysis based on market data
  useEffect(() => {
    if (marketData) {
      generateSentiment();
    }
  }, [marketData?.price_change_percentage_24h]);
  
  const generateSentiment = () => {
    if (!marketData) return;
    
    setIsGenerating(true);
    
    // Simulate AI sentiment analysis generation
    setTimeout(() => {
      // Calculate sentiment based on price change
      const priceChange = marketData.price_change_percentage_24h;
      const isPriceUp = priceChange > 0;
      
      // Generate overall sentiment type based on price change
      const sentimentType: SentimentType = Math.abs(priceChange) < 1 
        ? 'neutral' 
        : isPriceUp ? 'bullish' : 'bearish';
      
      // Generate sentiment scores for different sources
      const newSentimentScores: SentimentScore[] = [
        {
          source: 'News Articles',
          score: isPriceUp ? 65 + Math.random() * 20 : 30 + Math.random() * 25,
          type: isPriceUp ? 'bullish' : Math.random() > 0.7 ? 'neutral' : 'bearish',
          trend: isPriceUp ? 'increasing' : 'decreasing',
          icon: <Newspaper className="h-4 w-4 text-blue-400" />
        },
        {
          source: 'Social Media',
          score: isPriceUp ? 70 + Math.random() * 20 : 40 + Math.random() * 20,
          type: isPriceUp ? 'bullish' : Math.random() > 0.6 ? 'neutral' : 'bearish',
          trend: isPriceUp ? 'increasing' : Math.random() > 0.7 ? 'stable' : 'decreasing',
          icon: <Twitter className="h-4 w-4 text-sky-400" />
        },
        {
          source: 'Forum Discussions',
          score: isPriceUp ? 60 + Math.random() * 25 : 45 + Math.random() * 15,
          type: isPriceUp ? Math.random() > 0.8 ? 'neutral' : 'bullish' : 'bearish',
          trend: Math.random() > 0.6 ? 'increasing' : 'stable',
          icon: <MessageCircle className="h-4 w-4 text-purple-400" />
        },
        {
          source: 'Market Analysts',
          score: isPriceUp ? 55 + Math.random() * 30 : 35 + Math.random() * 25,
          type: isPriceUp ? 'bullish' : Math.random() > 0.5 ? 'neutral' : 'bearish',
          trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
          icon: <Users className="h-4 w-4 text-amber-400" />
        },
      ];
      
      // Generate weighted sentiment keywords
      const bullishKeywords = [
        'breakout', 'accumulation', 'momentum', 'bullish', 'uptrend', 
        'buying pressure', 'strong support', 'FOMO', 'recovery', 'all-time high'
      ];
      
      const bearishKeywords = [
        'correction', 'selloff', 'distribution', 'bearish', 'downtrend',
        'resistance', 'weak support', 'profit-taking', 'liquidation', 'regulatory concerns'
      ];
      
      const neutralKeywords = [
        'consolidation', 'range-bound', 'volatility', 'indecision',
        'equilibrium', 'accumulation', 'institutional interest', 'technical levels'
      ];
      
      // Select keywords based on sentiment
      const keywordPool = sentimentType === 'bullish' 
        ? [...bullishKeywords, ...neutralKeywords.slice(0, 3)]
        : sentimentType === 'bearish'
          ? [...bearishKeywords, ...neutralKeywords.slice(0, 3)]
          : [...neutralKeywords, ...(Math.random() > 0.5 ? bullishKeywords : bearishKeywords).slice(0, 2)];
      
      // Shuffle and pick 8 keywords
      const shuffled = [...keywordPool].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 8);
      
      // Generate random weights for keywords
      const newKeywords: SentimentKeyword[] = selected.map(text => ({
        text,
        weight: 1 + Math.floor(Math.random() * 9),
        type: bullishKeywords.includes(text) 
          ? 'bullish' 
          : bearishKeywords.includes(text) 
            ? 'bearish' 
            : 'neutral'
      }));
      
      // Sort keywords by weight
      newKeywords.sort((a, b) => b.weight - a.weight);
      
      // Update state with new sentiment data
      setOverallSentiment(sentimentType);
      setSentimentScores(newSentimentScores);
      setKeywords(newKeywords);
      setIsGenerating(false);
    }, 1000); // Simulate 1 second analysis time
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
        return 'bg-yellow-500';
    }
  };
  
  return (
    <Card className="mb-6 shadow-md">
      <CardHeader className="pb-2 border-b border-muted/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CardTitle className="text-lg font-semibold">Market Sentiment</CardTitle>
            {!isLoading && !isGenerating && (
              getSentimentBadge(overallSentiment)
            )}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2"
            disabled={isGenerating || isLoading}
            onClick={generateSentiment}
          >
            {isGenerating ? 
              <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> : 
              <RefreshCw className="h-3.5 w-3.5 mr-1" />}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading || isGenerating ? (
          <div className="h-[250px] flex flex-col items-center justify-center p-6 animate-pulse">
            <RefreshCw className="h-10 w-10 text-primary/30 mb-4 animate-spin" />
            <p className="text-muted-foreground text-center">
              {isLoading ? 'Loading market data...' : 'Analyzing market sentiment...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sentiment Scores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sentimentScores.map((score, idx) => (
                <div key={idx} className="bg-muted/20 p-3 rounded-lg border border-muted/30">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center">
                      {score.icon}
                      <span className="ml-1.5 text-sm font-medium">{score.source}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      {score.trend === 'increasing' ? (
                        <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                      ) : score.trend === 'decreasing' ? (
                        <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                      ) : (
                        <span className="w-3 h-3 mr-1" />
                      )}
                      <span className={`font-mono ${
                        score.trend === 'increasing' ? 'text-green-500' : 
                        score.trend === 'decreasing' ? 'text-red-500' : 
                        'text-muted-foreground'
                      }`}>
                        {score.trend === 'stable' ? 'Stable' : score.trend}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center mb-1">
                    <Progress 
                      value={score.score} 
                      max={100} 
                      className={`h-2 ${getProgressColor(score.type)}`} 
                    />
                    <span className="ml-2 text-xs font-mono">{score.score.toFixed(1)}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {score.score > 65 
                      ? 'Strong positive sentiment detected in recent content.' 
                      : score.score > 50 
                        ? 'Moderately positive sentiment in discussions.' 
                        : score.score > 40 
                          ? 'Mixed sentiment with some caution expressed.' 
                          : 'Cautious or negative sentiment prevails.'}
                  </p>
                </div>
              ))}
            </div>
            
            {/* Trending Keywords */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Trending Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, idx) => (
                  <Badge 
                    key={idx}
                    variant="outline"
                    className={`
                      border py-1 px-2 
                      ${keyword.type === 'bullish' ? 'border-green-500/40 text-green-500' : 
                        keyword.type === 'bearish' ? 'border-red-500/40 text-red-500' : 
                        'border-yellow-500/40 text-yellow-500/90'}
                      ${keyword.weight > 7 ? 'text-base' : 
                        keyword.weight > 5 ? 'text-sm' : 'text-xs'}
                    `}
                  >
                    {keyword.text}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="pt-2 text-xs text-center text-muted-foreground">
              <p className="mt-1 text-[10px]">Sentiment analysis is generated based on simulated data and should not be considered financial advice.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MarketSentiment;
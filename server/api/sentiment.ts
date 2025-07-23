import OpenAI from 'openai';

// Types for sentiment analysis
interface SentimentSource {
  source: string;
  score: number;
  type: 'bullish' | 'bearish' | 'neutral';
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  lastUpdated: string;
}

interface NewsArticle {
  title: string;
  description: string;
  publishedAt: string;
  source: string;
  url: string;
}

interface SentimentData {
  overall: 'bullish' | 'bearish' | 'neutral';
  overallScore: number;
  confidence: number;
  sources: SentimentSource[];
  keywords: Array<{
    text: string;
    weight: number;
    type: 'bullish' | 'bearish' | 'neutral';
  }>;
  lastUpdated: string;
}

// Cache for sentiment data
let sentimentCache: SentimentData | null = null;
let lastSentimentUpdate = 0;
const SENTIMENT_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Initialize Grok AI client with xAI
const grok = new OpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY
});

// Fetch news articles for sentiment analysis
async function fetchBitcoinNews(): Promise<NewsArticle[]> {
  try {
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      console.log('NEWS_API_KEY not available, trying alternative news sources');
      return await fetchAlternativeNews();
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=bitcoin&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`
    );
    
    if (!response.ok) {
      console.log('NewsAPI request failed, trying alternative news sources');
      return await fetchAlternativeNews();
    }

    const data = await response.json();
    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description || '',
      publishedAt: article.publishedAt,
      source: article.source.name,
      url: article.url
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return await fetchAlternativeNews();
  }
}

// Fetch alternative news sources when NewsAPI is unavailable
async function fetchAlternativeNews(): Promise<NewsArticle[]> {
  try {
    // Try CoinDesk RSS feed as alternative
    const response = await fetch('https://feeds.coindesk.com/rss');
    if (response.ok) {
      const rssText = await response.text();
      // Simple RSS parsing - in production, use a proper RSS parser
      const titleMatches = rssText.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/g) || [];
      const linkMatches = rssText.match(/<link>(.*?)<\/link>/g) || [];
      const dateMatches = rssText.match(/<pubDate>(.*?)<\/pubDate>/g) || [];
      
      const articles: NewsArticle[] = [];
      for (let i = 0; i < Math.min(10, titleMatches.length); i++) {
        if (titleMatches[i] && linkMatches[i] && dateMatches[i]) {
          articles.push({
            title: titleMatches[i].replace(/<title><!\[CDATA\[/, '').replace(/\]\]><\/title>/, ''),
            description: 'Bitcoin news from CoinDesk',
            publishedAt: dateMatches[i].replace(/<pubDate>/, '').replace(/<\/pubDate>/, ''),
            source: 'CoinDesk',
            url: linkMatches[i].replace(/<link>/, '').replace(/<\/link>/, '')
          });
        }
      }
      
      if (articles.length > 0) return articles;
    }
  } catch (error) {
    console.error('Error fetching alternative news:', error);
  }
  
  // If all news sources fail, return empty array - no fake data
  console.warn('All news sources unavailable, sentiment analysis will use market data only');
  return [];
}

// Enhanced news sentiment analysis using Grok AI with comprehensive market context
async function analyzeNewsSentiment(articles: NewsArticle[]): Promise<{score: number, type: 'bullish' | 'bearish' | 'neutral', confidence: number}> {
  if (articles.length === 0) {
    console.log('No news articles available for sentiment analysis');
    return { score: 50, type: 'neutral', confidence: 0.3 };
  }

  try {
    const newsText = articles.slice(0, 15).map(article => 
      `${article.title} - ${article.description || 'No description'}`
    ).join('\n\n');

    const prompt = `You are a professional Bitcoin market analyst. Analyze these recent Bitcoin news headlines and descriptions for market sentiment.

Consider these factors:
- Regulatory developments (positive/negative for adoption)
- Institutional activity (ETFs, corporate purchases, etc.)
- Technical developments (network upgrades, adoption)
- Market structure changes (derivatives, liquidity)
- Macroeconomic factors affecting Bitcoin

Provide JSON response with:
- score: number 0-100 (0=extremely bearish, 30=bearish, 50=neutral, 70=bullish, 100=extremely bullish)
- type: "bullish", "bearish", or "neutral"
- confidence: 0-1 (how confident you are in this analysis)
- reasoning: brief explanation of key factors driving sentiment

Recent Bitcoin news:
${newsText}

Respond with JSON only:`;

    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    console.log(`🤖 Grok AI news sentiment: ${result.score}/100 (${result.type}) - ${result.reasoning}`);
    
    return {
      score: Math.max(0, Math.min(100, result.score || 50)),
      type: result.type || 'neutral',
      confidence: Math.max(0, Math.min(1, result.confidence || 0.7))
    };
  } catch (error) {
    console.error('Error in Grok AI sentiment analysis:', error);
    return analyzeSentimentByKeywords(articles);
  }
}

// Fallback keyword-based sentiment analysis
function analyzeSentimentByKeywords(articles: NewsArticle[]): {score: number, type: 'bullish' | 'bearish' | 'neutral', confidence: number} {
  const bullishKeywords = [
    'bullish', 'surge', 'rally', 'breakout', 'adoption', 'institutional', 
    'buy', 'accumulate', 'positive', 'growth', 'increase', 'rise', 'upward',
    'all-time high', 'breakthrough', 'milestone', 'record', 'optimistic'
  ];
  
  const bearishKeywords = [
    'bearish', 'crash', 'dump', 'selloff', 'decline', 'regulatory',
    'sell', 'negative', 'fall', 'drop', 'decrease', 'downward', 'correction',
    'liquidation', 'resistance', 'concerns', 'warning', 'risk'
  ];

  let bullishScore = 0;
  let bearishScore = 0;
  let totalWords = 0;

  articles.forEach(article => {
    const text = `${article.title} ${article.description}`.toLowerCase();
    const words = text.split(/\s+/);
    totalWords += words.length;

    bullishKeywords.forEach(keyword => {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      bullishScore += matches * 2; // Weight positive sentiment
    });

    bearishKeywords.forEach(keyword => {
      const matches = (text.match(new RegExp(keyword, 'g')) || []).length;
      bearishScore += matches * 2; // Weight negative sentiment
    });
  });

  const netSentiment = bullishScore - bearishScore;
  const maxPossibleScore = Math.max(bullishScore + bearishScore, 1);
  const normalizedScore = 50 + (netSentiment / maxPossibleScore) * 50;
  
  const score = Math.max(0, Math.min(100, normalizedScore));
  const type = score > 60 ? 'bullish' : score < 40 ? 'bearish' : 'neutral';
  const confidence = Math.min(0.9, (bullishScore + bearishScore) / totalWords * 10);

  return { score, type, confidence };
}

// Analyze social media sentiment using real Reddit data
async function analyzeSocialMediaSentiment(): Promise<{score: number, type: 'bullish' | 'bearish' | 'neutral', confidence: number}> {
  try {
    // Use Reddit API to get Bitcoin subreddit sentiment
    const response = await fetch('https://www.reddit.com/r/Bitcoin/hot.json?limit=25');
    if (response.ok) {
      const data = await response.json();
      const posts = data.data.children;
      
      let totalScore = 0;
      let validPosts = 0;
      
      // Analyze post titles and content for sentiment
      for (const post of posts) {
        const title = post.data.title.toLowerCase();
        const score = post.data.score;
        const ratio = post.data.upvote_ratio;
        
        // Basic sentiment analysis based on keywords and engagement
        let sentimentScore = 50; // neutral baseline
        
        // Positive keywords
        if (title.includes('bullish') || title.includes('moon') || title.includes('hodl') || 
            title.includes('buying') || title.includes('pump') || title.includes('rally') ||
            title.includes('adoption') || title.includes('institutional')) {
          sentimentScore += 20;
        }
        
        // Negative keywords
        if (title.includes('bearish') || title.includes('crash') || title.includes('dump') ||
            title.includes('sell') || title.includes('fear') || title.includes('regulation')) {
          sentimentScore -= 20;
        }
        
        // Factor in engagement metrics
        if (score > 100 && ratio > 0.8) sentimentScore += 10;
        if (score < 50 || ratio < 0.6) sentimentScore -= 10;
        
        totalScore += Math.max(0, Math.min(100, sentimentScore));
        validPosts++;
      }
      
      const avgScore = validPosts > 0 ? totalScore / validPosts : 50;
      return {
        score: avgScore,
        type: avgScore > 60 ? 'bullish' : avgScore < 40 ? 'bearish' : 'neutral',
        confidence: 0.75
      };
    }
  } catch (error) {
    console.error('Error fetching Reddit sentiment:', error);
  }

  // Fallback to CoinPaprika market data if Reddit fails
  try {
    const response = await fetch('https://api.coinpaprika.com/v1/coins/btc-bitcoin');
    if (response.ok) {
      const data = await response.json();
      // Use price change as sentiment proxy
      const price_change_24h = data.quotes?.USD?.percent_change_24h || 0;
      const baseScore = 50 + (price_change_24h * 2); // Convert % to sentiment score
      const score = Math.max(20, Math.min(80, baseScore));
      
      return {
        score,
        type: score > 60 ? 'bullish' : score < 40 ? 'bearish' : 'neutral',
        confidence: 0.6
      };
    }
  } catch (error) {
    console.error('Error fetching CoinPaprika data:', error);
  }

  return { score: 50, type: 'neutral', confidence: 0.3 };
}

// Analyze on-chain metrics sentiment using CoinPaprika data
async function analyzeOnChainSentiment(): Promise<{score: number, type: 'bullish' | 'bearish' | 'neutral', confidence: number}> {
  try {
    // Fetch comprehensive Bitcoin data from CoinPaprika
    const [marketResponse, ohlcResponse] = await Promise.all([
      fetch('https://api.coinpaprika.com/v1/coins/btc-bitcoin'),
      fetch('https://api.coinpaprika.com/v1/coins/btc-bitcoin/ohlcv/latest')
    ]);
    
    if (marketResponse.ok && ohlcResponse.ok) {
      const marketData = await marketResponse.json();
      const ohlcData = await ohlcResponse.json();
      
      let sentimentScore = 50; // neutral baseline
      
      // Analyze market cap changes
      const marketCapChange = marketData.quotes?.USD?.market_cap_change_24h || 0;
      if (marketCapChange > 2) sentimentScore += 15;
      else if (marketCapChange < -2) sentimentScore -= 15;
      
      // Analyze volume trends
      const volumeChange = marketData.quotes?.USD?.volume_24h_change_24h || 0;
      if (volumeChange > 10) sentimentScore += 10;
      else if (volumeChange < -10) sentimentScore -= 10;
      
      // Analyze price position vs highs/lows
      if (ohlcData && ohlcData.length > 0) {
        const latest = ohlcData[0];
        const pricePosition = (latest.close - latest.low) / (latest.high - latest.low);
        
        if (pricePosition > 0.8) sentimentScore += 10; // Near highs
        else if (pricePosition < 0.2) sentimentScore -= 10; // Near lows
      }
      
      // Analyze ranking stability (Bitcoin should be #1)
      if (marketData.rank === 1) sentimentScore += 5;
      
      const finalScore = Math.max(20, Math.min(80, sentimentScore));
      
      return {
        score: finalScore,
        type: finalScore > 55 ? 'bullish' : finalScore < 45 ? 'bearish' : 'neutral',
        confidence: 0.8
      };
    }
  } catch (error) {
    console.error('Error fetching CoinPaprika on-chain sentiment:', error);
  }

  // Fallback with minimal confidence
  return { score: 50, type: 'neutral', confidence: 0.3 };
}

// Analyze derivatives market sentiment
async function analyzeDerivativesSentiment(): Promise<{score: number, type: 'bullish' | 'bearish' | 'neutral', confidence: number}> {
  try {
    // Fetch fear & greed index as proxy for derivatives sentiment
    const response = await fetch('https://api.coinybubble.com/fear-greed/current');
    if (response.ok) {
      const data = await response.json();
      const fearGreedValue = data.value || 50;
      return {
        score: fearGreedValue,
        type: fearGreedValue > 60 ? 'bullish' : fearGreedValue < 40 ? 'bearish' : 'neutral',
        confidence: 0.85
      };
    }
  } catch (error) {
    console.error('Error fetching derivatives sentiment:', error);
  }

  return { score: 50, type: 'neutral', confidence: 0.5 };
}

// Main sentiment analysis function
export async function getMarketSentiment(): Promise<SentimentData> {
  const now = Date.now();
  
  // Return cached data if still fresh
  if (sentimentCache && (now - lastSentimentUpdate) < SENTIMENT_CACHE_DURATION) {
    return sentimentCache;
  }

  try {
    console.log('Analyzing market sentiment from authentic data sources...');
    
    // Fetch data from all sources
    const [
      articles,
      newsSentiment,
      socialSentiment,
      onChainSentiment,
      derivativesSentiment
    ] = await Promise.all([
      fetchBitcoinNews(),
      fetchBitcoinNews().then(analyzeNewsSentiment),
      analyzeSocialMediaSentiment(),
      analyzeOnChainSentiment(),
      analyzeDerivativesSentiment()
    ]);

    // Create source-specific sentiment data with clearer naming
    const sources: SentimentSource[] = [
      {
        source: 'News & Media',
        score: newsSentiment.score,
        type: newsSentiment.type,
        trend: newsSentiment.score > 55 ? 'increasing' : newsSentiment.score < 45 ? 'decreasing' : 'stable',
        confidence: newsSentiment.confidence,
        lastUpdated: new Date().toISOString()
      },
      {
        source: 'Social Sentiment',
        score: socialSentiment.score,
        type: socialSentiment.type,
        trend: socialSentiment.score > 55 ? 'increasing' : socialSentiment.score < 45 ? 'decreasing' : 'stable',
        confidence: socialSentiment.confidence,
        lastUpdated: new Date().toISOString()
      },
      {
        source: 'Market Data',
        score: onChainSentiment.score,
        type: onChainSentiment.type,
        trend: onChainSentiment.score > 55 ? 'increasing' : onChainSentiment.score < 45 ? 'decreasing' : 'stable',
        confidence: onChainSentiment.confidence,
        lastUpdated: new Date().toISOString()
      },
      {
        source: 'Trading Activity',
        score: derivativesSentiment.score,
        type: derivativesSentiment.type,
        trend: derivativesSentiment.score > 55 ? 'increasing' : derivativesSentiment.score < 45 ? 'decreasing' : 'stable',
        confidence: derivativesSentiment.confidence,
        lastUpdated: new Date().toISOString()
      }
    ];

    // Calculate weighted overall sentiment
    const totalWeight = sources.reduce((sum, source) => sum + source.confidence, 0);
    const weightedScore = sources.reduce((sum, source) => sum + (source.score * source.confidence), 0) / totalWeight;
    const overallConfidence = totalWeight / sources.length;

    const overallType: 'bullish' | 'bearish' | 'neutral' = 
      weightedScore > 60 ? 'bullish' : weightedScore < 40 ? 'bearish' : 'neutral';

    // Extract simpler, more actionable keywords from news articles
    const keywords = extractActionableKeywords(articles, overallType);

    sentimentCache = {
      overall: overallType,
      overallScore: Math.round(weightedScore),
      confidence: overallConfidence,
      sources,
      keywords,
      lastUpdated: new Date().toISOString()
    };

    lastSentimentUpdate = now;
    console.log(`Live sentiment analysis: ${overallType} (${Math.round(weightedScore)}) from ${sources.length} data sources`);
    
    return sentimentCache;
  } catch (error) {
    console.error('Error in sentiment analysis:', error);
    
    // Return fallback sentiment data
    return {
      overall: 'neutral',
      overallScore: 50,
      confidence: 0.5,
      sources: [
        {
          source: 'Market Data',
          score: 50,
          type: 'neutral',
          trend: 'stable',
          confidence: 0.5,
          lastUpdated: new Date().toISOString()
        }
      ],
      keywords: [
        { text: 'consolidation', weight: 5, type: 'neutral' },
        { text: 'volatility', weight: 4, type: 'neutral' }
      ],
      lastUpdated: new Date().toISOString()
    };
  }
}

// Extract more actionable keywords
function extractActionableKeywords(articles: NewsArticle[], overallSentiment: 'bullish' | 'bearish' | 'neutral') {
  const allText = articles.map(article => `${article.title} ${article.description}`).join(' ').toLowerCase();
  
  const actionableKeywords = [
    // Bullish signals
    'breaking out', 'institutional buying', 'adoption surge', 'price target', 'strong support',
    // Bearish signals  
    'selling pressure', 'resistance level', 'profit taking', 'market correction', 'regulatory concerns',
    // Neutral signals
    'consolidation', 'range trading', 'volatility', 'waiting for breakout', 'technical analysis'
  ];

  const keywordCounts: { [key: string]: number } = {};
  
  actionableKeywords.forEach(keyword => {
    const matches = (allText.match(new RegExp(keyword.replace(' ', '\\s+'), 'g')) || []).length;
    if (matches > 0) {
      keywordCounts[keyword] = matches;
    }
  });

  // If no specific keywords found, use general market terms
  if (Object.keys(keywordCounts).length === 0) {
    return [
      { text: 'market analysis', weight: 6, type: 'neutral' as const },
      { text: 'price action', weight: 5, type: overallSentiment },
      { text: 'trading volume', weight: 4, type: 'neutral' as const },
      { text: 'technical levels', weight: 4, type: 'neutral' as const }
    ];
  }

  // Sort by frequency and take top 6
  const sortedKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([text, weight]) => ({
      text,
      weight: Math.min(10, weight * 3),
      type: getBullishKeywords().some(k => text.includes(k)) ? 'bullish' as const :
            getBearishKeywords().some(k => text.includes(k)) ? 'bearish' as const : 'neutral' as const
    }));

  return sortedKeywords;
}

// Extract trending keywords from news articles
function extractKeywords(articles: NewsArticle[], overallSentiment: 'bullish' | 'bearish' | 'neutral') {
  const allText = articles.map(article => `${article.title} ${article.description}`).join(' ').toLowerCase();
  
  const keywordCandidates = [
    // Bullish keywords
    'bullish', 'surge', 'rally', 'breakout', 'adoption', 'institutional', 'growth', 'milestone', 'record',
    // Bearish keywords  
    'bearish', 'correction', 'selloff', 'decline', 'regulatory', 'resistance', 'concerns', 'liquidation',
    // Neutral keywords
    'consolidation', 'volatility', 'support', 'technical', 'analysis', 'trading', 'volume', 'price'
  ];

  const keywordCounts: { [key: string]: number } = {};
  
  keywordCandidates.forEach(keyword => {
    const matches = (allText.match(new RegExp(keyword, 'g')) || []).length;
    if (matches > 0) {
      keywordCounts[keyword] = matches;
    }
  });

  // Sort by frequency and take top 8
  const sortedKeywords = Object.entries(keywordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([text, weight]) => ({
      text,
      weight: Math.min(10, weight * 2),
      type: getBullishKeywords().includes(text) ? 'bullish' as const :
            getBearishKeywords().includes(text) ? 'bearish' as const : 'neutral' as const
    }));

  return sortedKeywords.length > 0 ? sortedKeywords : [
    { text: 'bitcoin', weight: 8, type: overallSentiment },
    { text: 'market', weight: 6, type: 'neutral' as const },
    { text: 'trading', weight: 5, type: 'neutral' as const }
  ];
}

function getBullishKeywords(): string[] {
  return ['bullish', 'surge', 'rally', 'breakout', 'adoption', 'institutional', 'growth', 'milestone', 'record'];
}

function getBearishKeywords(): string[] {
  return ['bearish', 'correction', 'selloff', 'decline', 'regulatory', 'resistance', 'concerns', 'liquidation'];
}
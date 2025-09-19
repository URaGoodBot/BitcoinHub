import OpenAI from 'openai';

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  score: number;
  ups: number;
  downs: number;
  num_comments: number;
  created_utc: number;
  author: string;
  url: string;
  permalink: string;
}

interface RedditResponse {
  data: {
    children: Array<{
      data: RedditPost;
    }>;
  };
}

interface WSBSentimentPost {
  id: string;
  title: string;
  content: string;
  score: number;
  comments: number;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  sentimentScore: number; // -1 to 1
  confidence: number; // 0 to 1
  bitcoinMentions: number;
  cryptoKeywords: string[];
  timeAgo: string;
  url: string;
  author: string;
}

interface WSBSentimentData {
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  overallScore: number; // -1 to 1
  confidence: number;
  posts: WSBSentimentPost[];
  totalPosts: number;
  bullishCount: number;
  bearishCount: number;
  neutralCount: number;
  topKeywords: Array<{ keyword: string; count: number }>;
  lastUpdated: string;
}

// Cache for WSB sentiment data
let wsbSentimentCache: WSBSentimentData | null = null;
let lastWSBUpdate = 0;
const WSB_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

// Bitcoin and crypto keywords to filter posts
const CRYPTO_KEYWORDS = [
  'bitcoin', 'btc', 'crypto', 'cryptocurrency', 'ethereum', 'eth', 'altcoin',
  'blockchain', 'satoshi', 'hodl', 'diamond hands', 'paper hands', 'moon',
  'rocket', 'lambo', 'to the moon', 'btfd', 'dip', 'ath', 'all time high'
];

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diffInSeconds = now - timestamp;
  
  if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }
}

function containsCryptoKeywords(text: string): { contains: boolean; keywords: string[]; bitcoinMentions: number } {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  let bitcoinMentions = 0;
  
  for (const keyword of CRYPTO_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
      if (keyword.toLowerCase().includes('bitcoin') || keyword.toLowerCase().includes('btc')) {
        bitcoinMentions++;
      }
    }
  }
  
  return {
    contains: foundKeywords.length > 0,
    keywords: Array.from(new Set(foundKeywords)),
    bitcoinMentions
  };
}

async function fetchWallStreetBetsPosts(): Promise<RedditPost[]> {
  try {
    // Use Reddit's JSON API - no authentication required for public posts
    const response = await fetch('https://www.reddit.com/r/wallstreetbets/hot.json?limit=100', {
      headers: {
        'User-Agent': 'BitcoinHub/1.0 (sentiment analysis bot)'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data: RedditResponse = await response.json();
    return data.data.children.map(child => child.data);
  } catch (error) {
    console.error('Error fetching WSB posts:', error);
    throw error;
  }
}

async function analyzeSentimentWithOpenAI(text: string): Promise<{
  sentiment: 'bullish' | 'bearish' | 'neutral';
  score: number;
  confidence: number;
}> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not available');
    }

    const prompt = `Analyze the sentiment of this WallStreetBets post regarding Bitcoin and cryptocurrency. 
    
    Text: "${text}"
    
    Please respond with JSON in this exact format:
    {
      "sentiment": "bullish|bearish|neutral",
      "score": number between -1 (very bearish) and 1 (very bullish),
      "confidence": number between 0 and 1
    }
    
    Consider WSB slang like "diamond hands", "paper hands", "moon", "rocket", "HODL", etc.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are an expert at analyzing WallStreetBets sentiment regarding cryptocurrency. Understand WSB slang and community sentiment patterns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      sentiment: result.sentiment || 'neutral',
      score: Math.max(-1, Math.min(1, result.score || 0)),
      confidence: Math.max(0, Math.min(1, result.confidence || 0))
    };
  } catch (error) {
    console.error('Error analyzing sentiment with OpenAI:', error);
    // Fallback sentiment analysis
    const text_lower = text.toLowerCase();
    if (text_lower.includes('moon') || text_lower.includes('rocket') || text_lower.includes('diamond hands')) {
      return { sentiment: 'bullish', score: 0.6, confidence: 0.3 };
    } else if (text_lower.includes('crash') || text_lower.includes('dump') || text_lower.includes('paper hands')) {
      return { sentiment: 'bearish', score: -0.6, confidence: 0.3 };
    }
    return { sentiment: 'neutral', score: 0, confidence: 0.1 };
  }
}

function getTopKeywords(posts: WSBSentimentPost[]): Array<{ keyword: string; count: number }> {
  const keywordCounts: { [key: string]: number } = {};
  
  posts.forEach(post => {
    post.cryptoKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });
  
  return Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export async function getWSBSentimentData(): Promise<WSBSentimentData> {
  const now = Date.now();
  
  // Return cached data if valid
  if (wsbSentimentCache && (now - lastWSBUpdate) < WSB_CACHE_DURATION) {
    return wsbSentimentCache;
  }
  
  console.log('🔄 Fetching fresh WallStreetBets sentiment data...');
  
  try {
    // Fetch Reddit posts
    const redditPosts = await fetchWallStreetBetsPosts();
    
    // Filter posts that mention crypto/Bitcoin
    const cryptoPosts = redditPosts.filter(post => {
      const fullText = `${post.title} ${post.selftext}`;
      return containsCryptoKeywords(fullText).contains;
    });
    
    console.log(`📊 Found ${cryptoPosts.length} crypto-related posts out of ${redditPosts.length} total WSB posts`);
    
    // Analyze sentiment for each crypto post
    const analyzedPosts: WSBSentimentPost[] = [];
    
    for (const post of cryptoPosts.slice(0, 20)) { // Limit to 20 posts to avoid API limits
      const fullText = `${post.title} ${post.selftext}`;
      const cryptoAnalysis = containsCryptoKeywords(fullText);
      
      if (cryptoAnalysis.contains) {
        const sentimentAnalysis = await analyzeSentimentWithOpenAI(fullText);
        
        analyzedPosts.push({
          id: post.id,
          title: post.title,
          content: post.selftext.substring(0, 200) + (post.selftext.length > 200 ? '...' : ''),
          score: post.score,
          comments: post.num_comments,
          sentiment: sentimentAnalysis.sentiment,
          sentimentScore: sentimentAnalysis.score,
          confidence: sentimentAnalysis.confidence,
          bitcoinMentions: cryptoAnalysis.bitcoinMentions,
          cryptoKeywords: cryptoAnalysis.keywords,
          timeAgo: formatTimeAgo(post.created_utc),
          url: `https://reddit.com${post.permalink}`,
          author: post.author
        });
      }
    }
    
    // Calculate overall sentiment
    const validPosts = analyzedPosts.filter(post => post.confidence > 0.1);
    const totalWeightedScore = validPosts.reduce((sum, post) => sum + (post.sentimentScore * post.confidence), 0);
    const totalWeight = validPosts.reduce((sum, post) => sum + post.confidence, 0);
    const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
    
    const bullishCount = analyzedPosts.filter(post => post.sentiment === 'bullish').length;
    const bearishCount = analyzedPosts.filter(post => post.sentiment === 'bearish').length;
    const neutralCount = analyzedPosts.filter(post => post.sentiment === 'neutral').length;
    
    let overallSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (overallScore > 0.1) overallSentiment = 'bullish';
    else if (overallScore < -0.1) overallSentiment = 'bearish';
    
    const sentimentData: WSBSentimentData = {
      overallSentiment,
      overallScore,
      confidence: totalWeight / validPosts.length || 0,
      posts: analyzedPosts.sort((a, b) => b.score - a.score), // Sort by Reddit score
      totalPosts: analyzedPosts.length,
      bullishCount,
      bearishCount,
      neutralCount,
      topKeywords: getTopKeywords(analyzedPosts),
      lastUpdated: new Date().toISOString()
    };
    
    // Cache the result
    wsbSentimentCache = sentimentData;
    lastWSBUpdate = now;
    
    console.log(`✅ WSB sentiment analysis complete: ${overallSentiment} (${overallScore.toFixed(3)})`);
    
    return sentimentData;
  } catch (error) {
    console.error('Error getting WSB sentiment data:', error);
    
    // Return fallback data
    const fallbackData: WSBSentimentData = {
      overallSentiment: 'neutral',
      overallScore: 0,
      confidence: 0,
      posts: [],
      totalPosts: 0,
      bullishCount: 0,
      bearishCount: 0,
      neutralCount: 0,
      topKeywords: [],
      lastUpdated: new Date().toISOString()
    };
    
    return fallbackData;
  }
}
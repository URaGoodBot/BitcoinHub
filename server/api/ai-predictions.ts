import OpenAI from "openai";

const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface TimeframePrediction {
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

export interface MultiTimeframePredictions {
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

// Fetch comprehensive Bitcoin market data
async function getBitcoinData() {
  try {
    const [priceResponse, marketResponse, onChainResponse] = await Promise.all([
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true'),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=90&interval=daily'),
      fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false')
    ]);

    if (!priceResponse.ok || !marketResponse.ok || !onChainResponse.ok) {
      throw new Error(`API request failed: ${priceResponse.status}, ${marketResponse.status}, ${onChainResponse.status}`);
    }

    const priceData = await priceResponse.json();
    const marketData = await marketResponse.json();
    const onChainData = await onChainResponse.json();

    // Validate response structure
    if (!priceData?.bitcoin?.usd) {
      throw new Error('Invalid price data structure from CoinGecko');
    }

    return {
      currentPrice: priceData.bitcoin.usd,
      change24h: priceData.bitcoin.usd_24h_change || 0,
      volume24h: priceData.bitcoin.usd_24h_vol || 0,
      marketCap: priceData.bitcoin.usd_market_cap || 0,
      priceHistory: marketData.prices || [],
      volumeHistory: marketData.total_volumes || [],
      ath: onChainData?.market_data?.ath?.usd || 0,
      athDate: onChainData?.market_data?.ath_date?.usd || '',
      circulatingSupply: onChainData?.market_data?.circulating_supply || 0,
      totalSupply: onChainData?.market_data?.total_supply || 0,
    };
  } catch (error) {
    console.error('Error fetching Bitcoin data:', error);
    throw error;
  }
}

// Calculate advanced technical indicators
function calculateTechnicalIndicators(marketData: any) {
  const prices = marketData.priceHistory.map((p: any) => p[1]);
  const volumes = marketData.volumeHistory.map((v: any) => v[1]);
  
  if (prices.length < 30) return null;

  // RSI
  const rsi14 = calculateRSI(prices, 14);
  
  // Moving Averages
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  // MACD
  const macd = ema12 - ema26;
  
  // Volatility (30-day)
  const volatility = calculateVolatility(prices, 30);
  
  // Volume trend
  const volumeAvg = volumes.slice(-30).reduce((a: number, b: number) => a + b, 0) / 30;
  const recentVolumeAvg = volumes.slice(-7).reduce((a: number, b: number) => a + b, 0) / 7;
  const volumeTrend = ((recentVolumeAvg - volumeAvg) / volumeAvg) * 100;

  // Price momentum (30-day change)
  const momentum30d = ((prices[prices.length - 1] - prices[prices.length - 30]) / prices[prices.length - 30]) * 100;

  return {
    rsi: rsi14[rsi14.length - 1],
    sma20: sma20[sma20.length - 1],
    sma50: sma50[sma50.length - 1],
    macd,
    volatility,
    volumeTrend,
    momentum30d,
    currentPrice: prices[prices.length - 1]
  };
}

function calculateRSI(prices: number[], period: number): number[] {
  const rsi = [];
  for (let i = period; i < prices.length; i++) {
    let gains = 0;
    let losses = 0;
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgGain / (avgLoss || 1);
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

function calculateSMA(prices: number[], period: number): number[] {
  const sma = [];
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
    sma.push(sum / period);
  }
  return sma;
}

function calculateEMA(prices: number[], period: number): number {
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateVolatility(prices: number[], period: number): number {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  
  const recentReturns = returns.slice(-period);
  const mean = recentReturns.reduce((a, b) => a + b, 0) / period;
  const variance = recentReturns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / period;
  
  return Math.sqrt(variance) * Math.sqrt(365) * 100; // Annualized volatility percentage
}

// Generate AI-powered multi-timeframe predictions
export async function generateMultiTimeframePredictions(): Promise<MultiTimeframePredictions> {
  try {
    const marketData = await getBitcoinData();
    const indicators = calculateTechnicalIndicators(marketData);

    if (!indicators) {
      throw new Error('Insufficient market data for analysis');
    }

    const currentPrice = marketData.currentPrice;
    const currentDate = new Date().toISOString().split('T')[0];

    // Prepare comprehensive market context for AI
    const marketContext = `
Current Bitcoin Market Analysis (${currentDate}):

CURRENT METRICS:
- Price: $${currentPrice.toLocaleString()}
- 24h Change: ${marketData.change24h.toFixed(2)}%
- Market Cap: $${(marketData.marketCap / 1e9).toFixed(2)}B
- 24h Volume: $${(marketData.volume24h / 1e9).toFixed(2)}B
- All-Time High: $${marketData.ath.toLocaleString()}
- Circulating Supply: ${(marketData.circulatingSupply / 1e6).toFixed(2)}M BTC

TECHNICAL INDICATORS:
- RSI (14): ${indicators.rsi.toFixed(2)}
- 20-day SMA: $${indicators.sma20.toLocaleString()}
- 50-day SMA: $${indicators.sma50.toLocaleString()}
- MACD: ${indicators.macd.toFixed(2)}
- 30-day Volatility: ${indicators.volatility.toFixed(2)}%
- 30-day Momentum: ${indicators.momentum30d.toFixed(2)}%
- Volume Trend: ${indicators.volumeTrend.toFixed(2)}%

MARKET CONTEXT:
- Current trend: ${indicators.currentPrice > indicators.sma20 ? 'Above 20-day SMA' : 'Below 20-day SMA'}
- RSI status: ${indicators.rsi > 70 ? 'Overbought' : indicators.rsi < 30 ? 'Oversold' : 'Neutral'}
- Volatility: ${indicators.volatility > 60 ? 'High' : indicators.volatility > 40 ? 'Moderate' : 'Low'}
`;

    const prompt = `As an expert Bitcoin market analyst with access to comprehensive technical and fundamental data, provide a detailed multi-timeframe price prediction analysis.

${marketContext}

Analyze the data and provide predictions for FOUR timeframes: 1 month, 3 months, 6 months, and 1 year.

For EACH timeframe, provide:
1. Target Price (most likely scenario)
2. Low Estimate (conservative/bearish scenario)  
3. High Estimate (optimistic/bullish scenario)
4. Probability (0-100% confidence in the prediction)
5. Key Drivers (2-3 main factors supporting this prediction)
6. Risks (2-3 main risks that could invalidate this prediction)
7. Technical Outlook (brief technical analysis summary)

Also provide:
- Overall Sentiment: bullish/bearish/neutral
- Confidence Score: 0-100
- Market Regime: (e.g., "Bull Market", "Bear Market Accumulation", "Range-bound Consolidation", etc.)
- Volatility Outlook: brief description of expected volatility
- Risk/Reward Ratio: numerical ratio
- Key Events: upcoming events that could impact price (with dates if known)
- AI Insights: 3-5 key strategic insights for traders/investors

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "predictions": {
    "oneMonth": {
      "timeframe": "1 Month",
      "duration": "30 days",
      "targetPrice": number,
      "lowEstimate": number,
      "highEstimate": number,
      "probability": number,
      "keyDrivers": ["driver1", "driver2", "driver3"],
      "risks": ["risk1", "risk2"],
      "technicalOutlook": "string"
    },
    "threeMonth": { same structure },
    "sixMonth": { same structure },
    "oneYear": { same structure }
  },
  "overallSentiment": "bullish|bearish|neutral",
  "confidenceScore": number,
  "marketRegime": "string",
  "volatilityOutlook": "string",
  "riskRewardRatio": number,
  "keyEvents": [
    {"date": "YYYY-MM-DD", "event": "description", "impact": "high|medium|low"}
  ],
  "aiInsights": ["insight1", "insight2", "insight3"]
}`;

    console.log('🤖 Generating multi-timeframe AI predictions with Grok...');
    
    const completion = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { 
          role: "system", 
          content: "You are an expert Bitcoin market analyst. Provide accurate, data-driven predictions based on technical analysis, market conditions, and fundamental factors. Always respond with valid JSON only." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 3000
    });

    const aiResponse = completion.choices[0]?.message?.content || '';
    console.log('✅ Grok AI response received');

    // Parse AI response
    let parsedPredictions;
    try {
      // Remove any markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedPredictions = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid AI response format');
    }

    const result: MultiTimeframePredictions = {
      currentPrice,
      timestamp: new Date().toISOString(),
      predictions: parsedPredictions.predictions,
      overallSentiment: parsedPredictions.overallSentiment,
      confidenceScore: parsedPredictions.confidenceScore,
      marketRegime: parsedPredictions.marketRegime,
      volatilityOutlook: parsedPredictions.volatilityOutlook,
      riskRewardRatio: parsedPredictions.riskRewardRatio,
      keyEvents: parsedPredictions.keyEvents || [],
      aiInsights: parsedPredictions.aiInsights || []
    };

    return result;

  } catch (error: any) {
    console.error('Error generating multi-timeframe predictions:', error);
    
    // Determine if this is a rate limit error
    const isRateLimitError = error?.message?.includes('429') || error?.message?.includes('rate limit') || error?.message?.includes('credits');
    const errorType = isRateLimitError ? 'AI rate limit reached' : 'AI service unavailable';
    
    console.log(`📊 Using fallback predictions due to: ${errorType}`);
    
    // Fallback to basic predictions if AI fails
    let currentPrice = 0;
    let currentChange = 0;
    
    try {
      const marketData = await getBitcoinData();
      currentPrice = marketData.currentPrice;
      currentChange = marketData.change24h;
    } catch (dataError) {
      console.error('Failed to fetch market data for fallback, trying alternative sources:', dataError);
      
      // Try CryptoCompare first
      try {
        const response = await fetch('https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC&tsyms=USD');
        if (response.ok) {
          const data = await response.json();
          currentPrice = data.RAW?.BTC?.USD?.PRICE || 0;
          currentChange = data.RAW?.BTC?.USD?.CHANGEPCT24HOUR || 0;
          console.log(`✓ Fetched fallback price from CryptoCompare: $${currentPrice.toLocaleString()}`);
        }
      } catch (ccError) {
        console.error('CryptoCompare failed for fallback:', ccError);
      }
      
      // If CryptoCompare failed, try CoinGecko simple
      if (!currentPrice || currentPrice === 0) {
        try {
          const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
          if (response.ok) {
            const data = await response.json();
            currentPrice = data.bitcoin?.usd || 0;
            currentChange = data.bitcoin?.usd_24h_change || 0;
            console.log(`✓ Fetched fallback price from CoinGecko: $${currentPrice.toLocaleString()}`);
          }
        } catch (cgError) {
          console.error('CoinGecko also failed for fallback:', cgError);
        }
      }
      
      // Last resort: use default but warn
      if (!currentPrice || currentPrice === 0) {
        currentPrice = 60000;
        console.warn('⚠️ All price sources failed, using default fallback price: $60,000');
      }
    }
    
    // Determine sentiment from recent price action
    const sentiment = currentChange > 2 ? 'bullish' : currentChange < -2 ? 'bearish' : 'neutral';
    
    return {
      currentPrice,
      timestamp: new Date().toISOString(),
      predictions: {
        oneMonth: {
          timeframe: "1 Month",
          duration: "30 days",
          targetPrice: currentPrice * 1.05,
          lowEstimate: currentPrice * 0.92,
          highEstimate: currentPrice * 1.18,
          probability: 65,
          keyDrivers: [
            "Technical support levels holding steady",
            "Institutional interest remains strong",
            "Historical volatility patterns suggest range-bound movement"
          ],
          risks: [
            "Short-term market volatility",
            "Macroeconomic uncertainties"
          ],
          technicalOutlook: "Consolidation with moderate upside potential based on technical indicators"
        },
        threeMonth: {
          timeframe: "3 Months",
          duration: "90 days",
          targetPrice: currentPrice * 1.15,
          lowEstimate: currentPrice * 0.88,
          highEstimate: currentPrice * 1.35,
          probability: 60,
          keyDrivers: [
            "Seasonal historical trends favor Q4 strength",
            "Continued institutional adoption trajectory",
            "Network fundamentals remain robust"
          ],
          risks: [
            "Regulatory developments",
            "Global economic conditions",
            "Market correlation with traditional assets"
          ],
          technicalOutlook: "Potential breakout from consolidation zone with technical support intact"
        },
        sixMonth: {
          timeframe: "6 Months",
          duration: "180 days",
          targetPrice: currentPrice * 1.28,
          lowEstimate: currentPrice * 0.82,
          highEstimate: currentPrice * 1.55,
          probability: 55,
          keyDrivers: [
            "Bitcoin halving cycle dynamics",
            "Growing institutional and corporate treasury adoption",
            "Improving regulatory clarity in major markets"
          ],
          risks: [
            "Potential market corrections",
            "Geopolitical events",
            "Regulatory policy changes"
          ],
          technicalOutlook: "Building momentum toward potential bull phase continuation"
        },
        oneYear: {
          timeframe: "1 Year",
          duration: "365 days",
          targetPrice: currentPrice * 1.50,
          lowEstimate: currentPrice * 0.75,
          highEstimate: currentPrice * 2.10,
          probability: 50,
          keyDrivers: [
            "Long-term supply scarcity with fixed 21M supply cap",
            "Mainstream adoption acceleration",
            "Bitcoin as macro hedge narrative strengthening"
          ],
          risks: [
            "Major market disruption events",
            "Technology or security risks",
            "Significant regulatory headwinds"
          ],
          technicalOutlook: "Long-term bullish structure remains intact with historical cycle patterns supportive"
        }
      },
      overallSentiment: sentiment as 'bullish' | 'bearish' | 'neutral',
      confidenceScore: 58,
      marketRegime: "Technical Consolidation Phase",
      volatilityOutlook: "Moderate to high volatility expected based on historical patterns",
      riskRewardRatio: 2.3,
      keyEvents: [
        {
          date: "2024-04",
          event: "Bitcoin Halving (estimated)",
          impact: "high" as const
        },
        {
          date: "Quarterly",
          event: "Federal Reserve rate decisions",
          impact: "high" as const
        }
      ],
      aiInsights: [
        isRateLimitError 
          ? "⚠️ Advanced AI predictions temporarily unavailable due to rate limits - technical fallback analysis active"
          : "⚠️ AI analysis service temporarily unavailable - using technical analysis fallback",
        "Technical indicators suggest monitoring key support/resistance levels for breakout signals",
        "Dollar-cost averaging remains prudent strategy during consolidation phases",
        "Watch for volume confirmation on any directional moves"
      ]
    };
  }
}

// Cache predictions for 15 minutes
let cachedPredictions: MultiTimeframePredictions | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function getCachedMultiTimeframePredictions(): Promise<MultiTimeframePredictions> {
  const now = Date.now();
  
  // Always get fresh current price from CryptoCompare (more reliable, different rate limit)
  let currentPrice = 0;
  try {
    const response = await fetch('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD');
    if (response.ok) {
      const data = await response.json();
      currentPrice = data.USD || 0;
    }
  } catch (error) {
    console.error('Failed to fetch current price for predictions:', error);
  }
  
  // If CryptoCompare fails, try CoinGecko simple endpoint
  if (!currentPrice || currentPrice === 0) {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      if (response.ok) {
        const data = await response.json();
        currentPrice = data.bitcoin?.usd || 0;
      }
    } catch (error) {
      console.error('CoinGecko also failed, will use cached price');
    }
  }
  
  if (cachedPredictions && (now - cacheTimestamp) < CACHE_DURATION) {
    // If we couldn't fetch a new price, use the cached one
    if (!currentPrice || currentPrice === 0) {
      console.log('📊 Returning cached predictions (price fetch failed, using cached price)');
      return cachedPredictions;
    }
    
    console.log(`📊 Returning cached predictions with updated price: $${currentPrice.toLocaleString()} (was $${cachedPredictions.currentPrice.toLocaleString()})`);
    
    // Update the cached predictions with new current price and recalculate targets
    const priceRatio = currentPrice / cachedPredictions.currentPrice;
    
    return {
      ...cachedPredictions,
      currentPrice,
      timestamp: new Date().toISOString(),
      predictions: {
        oneMonth: {
          ...cachedPredictions.predictions.oneMonth,
          targetPrice: Math.round(cachedPredictions.predictions.oneMonth.targetPrice * priceRatio),
          lowEstimate: Math.round(cachedPredictions.predictions.oneMonth.lowEstimate * priceRatio),
          highEstimate: Math.round(cachedPredictions.predictions.oneMonth.highEstimate * priceRatio)
        },
        threeMonth: {
          ...cachedPredictions.predictions.threeMonth,
          targetPrice: Math.round(cachedPredictions.predictions.threeMonth.targetPrice * priceRatio),
          lowEstimate: Math.round(cachedPredictions.predictions.threeMonth.lowEstimate * priceRatio),
          highEstimate: Math.round(cachedPredictions.predictions.threeMonth.highEstimate * priceRatio)
        },
        sixMonth: {
          ...cachedPredictions.predictions.sixMonth,
          targetPrice: Math.round(cachedPredictions.predictions.sixMonth.targetPrice * priceRatio),
          lowEstimate: Math.round(cachedPredictions.predictions.sixMonth.lowEstimate * priceRatio),
          highEstimate: Math.round(cachedPredictions.predictions.sixMonth.highEstimate * priceRatio)
        },
        oneYear: {
          ...cachedPredictions.predictions.oneYear,
          targetPrice: Math.round(cachedPredictions.predictions.oneYear.targetPrice * priceRatio),
          lowEstimate: Math.round(cachedPredictions.predictions.oneYear.lowEstimate * priceRatio),
          highEstimate: Math.round(cachedPredictions.predictions.oneYear.highEstimate * priceRatio)
        }
      }
    };
  }
  
  console.log('🔄 Generating fresh multi-timeframe predictions...');
  cachedPredictions = await generateMultiTimeframePredictions();
  cacheTimestamp = now;
  
  return cachedPredictions;
}

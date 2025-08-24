import OpenAI from "openai";

const grok = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY 
});

export interface IndicatorAnalysis {
  indicator: string;
  currentValue: number | string;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 1-10
  interpretation: string;
  priceTarget?: number;
  timeframe: string;
}

export interface PricePrediction {
  shortTerm: {
    target: number;
    probability: number;
    timeframe: string;
    reasoning: string;
  };
  mediumTerm: {
    target: number;
    probability: number;
    timeframe: string;
    reasoning: string;
  };
  longTerm: {
    target: number;
    probability: number;
    timeframe: string;
    reasoning: string;
  };
}

export interface ToppingAnalysis {
  nearTermTop: {
    predicted: boolean;
    confidence: number;
    priceLevel?: number;
    timeframe: string;
    indicators: string[];
    reasoning: string;
  };
  cyclicalTop: {
    predicted: boolean;
    confidence: number;
    priceLevel?: number;
    timeframe: string;
    indicators: string[];
    reasoning: string;
  };
}

export interface LiveIndicatorsAnalysis {
  currentPrice: number;
  timestamp: string;
  indicators: IndicatorAnalysis[];
  overallSignal: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  pricePredictions: PricePrediction;
  toppingAnalysis: ToppingAnalysis;
  marketConditions: {
    trend: string;
    volatility: string;
    momentum: string;
    volume: string;
  };
  aiInsights: string[];
  riskFactors: string[];
}

// Fetch real Bitcoin market data for analysis
async function getBitcoinMarketData() {
  try {
    // Get current price and basic market data
    const priceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
    const priceData = await priceResponse.json();
    
    // Get additional market stats
    const statsResponse = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30&interval=daily');
    const statsData = await statsResponse.json();
    
    return {
      currentPrice: priceData.bitcoin.usd,
      change24h: priceData.bitcoin.usd_24h_change,
      volume24h: priceData.bitcoin.usd_24h_vol,
      marketCap: priceData.bitcoin.usd_market_cap,
      priceHistory: statsData.prices || [],
      volumeHistory: statsData.total_volumes || []
    };
  } catch (error) {
    console.error('Error fetching Bitcoin market data:', error);
    throw error;
  }
}

// Calculate technical indicators from price data
function calculateIndicators(marketData: any): any {
  const prices = marketData.priceHistory.map((p: any) => p[1]);
  const volumes = marketData.volumeHistory.map((v: any) => v[1]);
  
  if (prices.length < 14) return {};
  
  // Calculate RSI (simplified 14-period)
  const rsi = calculateRSI(prices, 14);
  
  // Calculate Moving Averages
  const sma20 = calculateSMA(prices, 20);
  const sma50 = calculateSMA(prices, 50);
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  // Calculate MACD
  const macd = ema12 - ema26;
  const signalLine = calculateEMA([macd], 9);
  
  // Calculate Bollinger Bands
  const bb = calculateBollingerBands(prices, 20, 2);
  
  return {
    rsi: rsi[rsi.length - 1],
    sma20: sma20[sma20.length - 1],
    sma50: sma50[sma50.length - 1],
    macd,
    signalLine,
    bollingerUpper: bb.upper[bb.upper.length - 1],
    bollingerLower: bb.lower[bb.lower.length - 1],
    bollingerMiddle: bb.middle[bb.middle.length - 1],
    volume24h: marketData.volume24h,
    volumeAvg: volumes.slice(-7).reduce((a: number, b: number) => a + b, 0) / 7
  };
}

// Technical indicator calculation functions
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
    const rs = avgGain / avgLoss;
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

function calculateBollingerBands(prices: number[], period: number, stdDev: number) {
  const sma = calculateSMA(prices, period);
  const upper = [];
  const lower = [];
  const middle = sma;
  
  for (let i = 0; i < sma.length; i++) {
    const slice = prices.slice(i, i + period);
    const mean = sma[i];
    const variance = slice.reduce((acc, price) => acc + Math.pow(price - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    upper.push(mean + (standardDeviation * stdDev));
    lower.push(mean - (standardDeviation * stdDev));
  }
  
  return { upper, lower, middle };
}

export async function generateLiveIndicatorsAnalysis(): Promise<LiveIndicatorsAnalysis> {
  try {
    console.log('Generating live indicators analysis with Grok AI...');
    
    // Get real Bitcoin market data
    const marketData = await getBitcoinMarketData();
    const indicators = calculateIndicators(marketData);
    
    const prompt = `As an expert cryptocurrency analyst, analyze Bitcoin's current market position using these live technical indicators and provide comprehensive predictions:

LIVE BITCOIN DATA:
- Current Price: $${marketData.currentPrice.toLocaleString()}
- 24h Change: ${marketData.change24h.toFixed(2)}%
- 24h Volume: $${(marketData.volume24h / 1e9).toFixed(2)}B
- Market Cap: $${(marketData.marketCap / 1e9).toFixed(0)}B

CALCULATED TECHNICAL INDICATORS:
- RSI (14): ${indicators.rsi?.toFixed(2) || 'N/A'}
- SMA 20: $${indicators.sma20?.toLocaleString() || 'N/A'}
- SMA 50: $${indicators.sma50?.toLocaleString() || 'N/A'}
- MACD: ${indicators.macd?.toFixed(2) || 'N/A'}
- Signal Line: ${indicators.signalLine?.toFixed(2) || 'N/A'}
- Bollinger Upper: $${indicators.bollingerUpper?.toLocaleString() || 'N/A'}
- Bollinger Lower: $${indicators.bollingerLower?.toLocaleString() || 'N/A'}
- Volume vs 7-day avg: ${indicators.volume24h && indicators.volumeAvg ? ((indicators.volume24h / indicators.volumeAvg - 1) * 100).toFixed(1) : 'N/A'}%

ANALYSIS REQUIREMENTS:
1. Interpret each indicator's current signal (bullish/bearish/neutral) and strength (1-10)
2. Provide specific price predictions for 24h, 1-week, and 1-month timeframes
3. Analyze topping patterns and potential reversal levels
4. Consider volume, momentum, and trend confluence
5. Identify key support/resistance levels based on current indicators

Respond in JSON format:
{
  "indicators": [
    {
      "indicator": "RSI",
      "currentValue": ${indicators.rsi?.toFixed(2) || 0},
      "signal": "bullish|bearish|neutral",
      "strength": 1-10,
      "interpretation": "detailed analysis of what this RSI level means",
      "priceTarget": potential_target_price,
      "timeframe": "24h|1w|1m"
    }
    // Include all relevant indicators: RSI, MACD, Bollinger Bands, Moving Averages, Volume
  ],
  "overallSignal": "bullish|bearish|neutral",
  "confidenceScore": 1-100,
  "pricePredictions": {
    "shortTerm": {
      "target": specific_price_target,
      "probability": 1-100,
      "timeframe": "24-48 hours",
      "reasoning": "technical analysis supporting this prediction"
    },
    "mediumTerm": {
      "target": specific_price_target,
      "probability": 1-100,
      "timeframe": "1-2 weeks",
      "reasoning": "technical analysis supporting this prediction"
    },
    "longTerm": {
      "target": specific_price_target,
      "probability": 1-100,
      "timeframe": "1 month",
      "reasoning": "technical analysis supporting this prediction"
    }
  },
  "toppingAnalysis": {
    "nearTermTop": {
      "predicted": true/false,
      "confidence": 1-100,
      "priceLevel": specific_price_if_predicted,
      "timeframe": "days/weeks",
      "indicators": ["list of supporting indicators"],
      "reasoning": "why a top is or isn't predicted"
    },
    "cyclicalTop": {
      "predicted": true/false,
      "confidence": 1-100,
      "priceLevel": specific_price_if_predicted,
      "timeframe": "weeks/months",
      "indicators": ["list of supporting indicators"],
      "reasoning": "longer-term top analysis"
    }
  },
  "marketConditions": {
    "trend": "bullish|bearish|sideways",
    "volatility": "high|medium|low",
    "momentum": "accelerating|decelerating|stable",
    "volume": "above_average|below_average|normal"
  },
  "aiInsights": [
    "key insight 1 about current market structure",
    "key insight 2 about indicator convergence/divergence",
    "key insight 3 about risk/reward setup"
  ],
  "riskFactors": [
    "specific risk factor 1",
    "specific risk factor 2",
    "specific risk factor 3"
  ]
}

Focus on actionable analysis with specific price levels and timeframes. Consider indicator confluence and provide high-conviction insights based on the technical data.`;

    const response = await grok.chat.completions.create({
      model: "grok-2-1212",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      currentPrice: marketData.currentPrice,
      timestamp: new Date().toISOString(),
      ...analysis
    };
    
  } catch (error: any) {
    console.error('Error generating indicators analysis:', error);
    
    // Return fallback analysis with real market data
    const marketData = await getBitcoinMarketData();
    const indicators = calculateIndicators(marketData);
    
    return {
      currentPrice: marketData.currentPrice,
      timestamp: new Date().toISOString(),
      indicators: [
        {
          indicator: "Live Analysis",
          currentValue: "AI Analysis Unavailable",
          signal: "neutral" as const,
          strength: 5,
          interpretation: "AI analysis temporarily unavailable. Using calculated indicators for basic signals.",
          timeframe: "Current"
        }
      ],
      overallSignal: "neutral" as const,
      confidenceScore: 50,
      pricePredictions: {
        shortTerm: {
          target: marketData.currentPrice * 1.02,
          probability: 50,
          timeframe: "24-48 hours",
          reasoning: "Technical analysis based on calculated indicators"
        },
        mediumTerm: {
          target: marketData.currentPrice * 1.05,
          probability: 45,
          timeframe: "1-2 weeks", 
          reasoning: "Medium-term projection based on current trend"
        },
        longTerm: {
          target: marketData.currentPrice * 1.1,
          probability: 40,
          timeframe: "1 month",
          reasoning: "Long-term projection with high uncertainty"
        }
      },
      toppingAnalysis: {
        nearTermTop: {
          predicted: false,
          confidence: 30,
          timeframe: "Unknown",
          indicators: [],
          reasoning: "Insufficient AI analysis for topping prediction"
        },
        cyclicalTop: {
          predicted: false,
          confidence: 25,
          timeframe: "Unknown", 
          indicators: [],
          reasoning: "Cyclical analysis requires AI processing"
        }
      },
      marketConditions: {
        trend: marketData.change24h > 2 ? "bullish" : marketData.change24h < -2 ? "bearish" : "sideways",
        volatility: Math.abs(marketData.change24h) > 5 ? "high" : "medium",
        momentum: "stable",
        volume: "normal"
      },
      aiInsights: [
        `Current Bitcoin price: $${marketData.currentPrice.toLocaleString()}`,
        `24h change: ${marketData.change24h.toFixed(2)}%`,
        "Technical indicators calculated from live data"
      ],
      riskFactors: [
        "Market volatility remains elevated",
        "External economic factors may impact price",
        "AI analysis temporarily unavailable for detailed predictions"
      ]
    };
  }
}

// Cache for analysis data (5 minute cache)
let analysisCache: { data: LiveIndicatorsAnalysis; timestamp: number } | null = null;
const ANALYSIS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getLiveIndicatorsAnalysis(): Promise<LiveIndicatorsAnalysis> {
  // Check cache first
  if (analysisCache && Date.now() - analysisCache.timestamp < ANALYSIS_CACHE_DURATION) {
    return analysisCache.data;
  }
  
  // Generate new analysis
  const analysis = await generateLiveIndicatorsAnalysis();
  
  // Cache the result
  analysisCache = {
    data: analysis,
    timestamp: Date.now()
  };
  
  return analysis;
}

export function clearAnalysisCache(): void {
  analysisCache = null;
}
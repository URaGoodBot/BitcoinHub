import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, BarChart3, Search, ExternalLink, Activity, Zap, Target, Gauge, RefreshCw, AlertTriangle, Brain, DollarSign } from "lucide-react";

interface TradingIndicator {
  id: string;
  name: string;
  category: 'trend' | 'momentum' | 'volume' | 'volatility' | 'support_resistance';
  description: string;
  usage: string;
  freeSources: Array<{
    name: string;
    url: string;
    description: string;
  }>;
  interpretation: {
    bullish: string;
    bearish: string;
    neutral: string;
  };
}

interface IndicatorAnalysis {
  indicator: string;
  currentValue: number | string;
  signal: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  interpretation: string;
  priceTarget?: number;
  timeframe: string;
}

interface PricePrediction {
  target: number;
  probability: number;
  timeframe: string;
  reasoning: string;
}

interface ToppingAnalysis {
  predicted: boolean;
  confidence: number;
  priceLevel?: number;
  timeframe: string;
  indicators: string[];
  reasoning: string;
}

interface LiveAnalysisData {
  currentPrice: number;
  timestamp: string;
  indicators: IndicatorAnalysis[];
  overallSignal: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number;
  pricePredictions: {
    shortTerm: PricePrediction;
    mediumTerm: PricePrediction;
    longTerm: PricePrediction;
  };
  toppingAnalysis: {
    nearTermTop: ToppingAnalysis;
    cyclicalTop: ToppingAnalysis;
  };
  marketConditions: {
    trend: string;
    volatility: string;
    momentum: string;
    volume: string;
  };
  aiInsights: string[];
  riskFactors: string[];
}

const tradingIndicators: TradingIndicator[] = [
  {
    id: "rsi",
    name: "Relative Strength Index (RSI)",
    category: "momentum",
    description: "Measures the speed and change of price movements to identify overbought or oversold conditions.",
    usage: "Values above 70 suggest overbought conditions, below 30 suggest oversold. Used for entry/exit timing.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Free charts with RSI indicator" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Market data with technical indicators" }
    ],
    interpretation: {
      bullish: "RSI below 30 indicates oversold conditions, potential buying opportunity",
      bearish: "RSI above 70 indicates overbought conditions, potential selling opportunity",
      neutral: "RSI between 30-70 indicates normal trading range"
    }
  },
  {
    id: "macd",
    name: "Moving Average Convergence Divergence (MACD)",
    category: "momentum",
    description: "Shows the relationship between two moving averages to identify trend changes and momentum.",
    usage: "Signal line crossovers and histogram analysis for trend confirmation and entry signals.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Comprehensive MACD analysis tools" },
      { name: "Binance", url: "https://binance.com", description: "Free advanced charting with MACD" }
    ],
    interpretation: {
      bullish: "MACD line crosses above signal line, positive histogram growth",
      bearish: "MACD line crosses below signal line, negative histogram growth",
      neutral: "MACD and signal lines move sideways with minimal divergence"
    }
  },
  {
    id: "bollinger_bands",
    name: "Bollinger Bands",
    category: "volatility",
    description: "Volatility bands around a moving average that expand and contract based on market volatility.",
    usage: "Price touching bands indicates potential reversal points, band width shows volatility.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Bollinger Bands with customizable settings" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Free charts with Bollinger Bands" }
    ],
    interpretation: {
      bullish: "Price bounces off lower band, band squeeze followed by upward breakout",
      bearish: "Price touches upper band multiple times, band squeeze followed by downward breakout",
      neutral: "Price trades within bands without touching extremes"
    }
  },
  {
    id: "volume",
    name: "Volume",
    category: "volume",
    description: "Measures the number of shares or contracts traded in a security during a given period.",
    usage: "Confirms price movements and identifies potential breakouts or reversals.",
    freeSources: [
      { name: "CoinGecko", url: "https://coingecko.com", description: "Real-time volume data and analysis" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Volume tracking across exchanges" }
    ],
    interpretation: {
      bullish: "High volume on price increases confirms upward momentum",
      bearish: "High volume on price decreases confirms downward momentum",
      neutral: "Low volume indicates lack of conviction in current price movement"
    }
  },
  {
    id: "stochastic",
    name: "Stochastic Oscillator",
    category: "momentum",
    description: "Compares closing price to price range over a specific period to identify overbought/oversold levels.",
    usage: "Values above 80 indicate overbought, below 20 indicate oversold conditions.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Stochastic with %K and %D lines" },
      { name: "Kraken", url: "https://kraken.com", description: "Free trading interface with stochastic" }
    ],
    interpretation: {
      bullish: "Stochastic crosses above 20 from oversold territory",
      bearish: "Stochastic crosses below 80 from overbought territory",
      neutral: "Stochastic oscillates between 20-80 without clear direction"
    }
  },
  {
    id: "fibonacci",
    name: "Fibonacci Retracement",
    category: "support_resistance",
    description: "Uses horizontal lines to indicate areas of support or resistance at key Fibonacci levels.",
    usage: "Identifies potential reversal levels at 23.6%, 38.2%, 50%, 61.8%, and 78.6% retracements.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Fibonacci tools with automatic calculations" },
      { name: "Binance", url: "https://binance.com", description: "Built-in Fibonacci drawing tools" }
    ],
    interpretation: {
      bullish: "Price bounces off key Fibonacci support levels (38.2%, 50%, 61.8%)",
      bearish: "Price fails to break through Fibonacci resistance levels",
      neutral: "Price consolidates between Fibonacci levels without clear direction"
    }
  },
  {
    id: "moving_averages",
    name: "Moving Averages (SMA/EMA)",
    category: "trend",
    description: "Smooths price data to identify trend direction and potential support/resistance levels.",
    usage: "SMA for trend identification, EMA for faster signals. Common periods: 20, 50, 100, 200.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Multiple MA types and periods" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Simple and exponential moving averages" }
    ],
    interpretation: {
      bullish: "Price above MA, shorter MA above longer MA (golden cross)",
      bearish: "Price below MA, shorter MA below longer MA (death cross)",
      neutral: "Price oscillates around MA without clear trend"
    }
  },
  {
    id: "atr",
    name: "Average True Range (ATR)",
    category: "volatility",
    description: "Measures market volatility by calculating the average range between high and low prices.",
    usage: "Higher ATR indicates higher volatility, used for position sizing and stop-loss placement.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "ATR indicator with customizable periods" },
      { name: "Binance", url: "https://binance.com", description: "Advanced charting with ATR" }
    ],
    interpretation: {
      bullish: "Rising ATR with upward price movement confirms strong trend",
      bearish: "Rising ATR with downward price movement confirms strong downtrend",
      neutral: "Low ATR indicates consolidation and low volatility"
    }
  },
  {
    id: "obv",
    name: "On-Balance Volume (OBV)",
    category: "volume",
    description: "Relates volume to price change to predict price movements based on volume flow.",
    usage: "Rising OBV suggests accumulation, falling OBV suggests distribution.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "OBV with trend line analysis" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Volume analysis tools" }
    ],
    interpretation: {
      bullish: "OBV making higher highs while price consolidates or rises",
      bearish: "OBV making lower lows while price consolidates or falls",
      neutral: "OBV moves sideways with price, indicating balance"
    }
  },
  {
    id: "ichimoku",
    name: "Ichimoku Cloud",
    category: "trend",
    description: "Comprehensive indicator showing support/resistance, trend direction, and momentum in one view.",
    usage: "Price above cloud is bullish, below is bearish. Cloud color and thickness indicate trend strength.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Full Ichimoku system with all components" },
      { name: "Kraken", url: "https://kraken.com", description: "Ichimoku cloud in pro trading interface" }
    ],
    interpretation: {
      bullish: "Price above cloud, Tenkan above Kijun, future cloud turning green",
      bearish: "Price below cloud, Tenkan below Kijun, future cloud turning red",
      neutral: "Price within cloud, mixed signals from Ichimoku components"
    }
  },
  {
    id: "williams_r",
    name: "Williams %R",
    category: "momentum",
    description: "Momentum oscillator that measures overbought and oversold levels similar to Stochastic.",
    usage: "Values above -20 indicate overbought, below -80 indicate oversold conditions.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Williams %R with customizable periods" },
      { name: "Binance", url: "https://binance.com", description: "Williams %R in advanced charting" }
    ],
    interpretation: {
      bullish: "Williams %R moves above -80 from oversold territory",
      bearish: "Williams %R moves below -20 from overbought territory",
      neutral: "Williams %R oscillates between -20 and -80"
    }
  },
  {
    id: "cci",
    name: "Commodity Channel Index (CCI)",
    category: "momentum",
    description: "Measures the difference between current price and its statistical mean to identify cyclical trends.",
    usage: "Values above +100 indicate overbought, below -100 indicate oversold conditions.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "CCI indicator with divergence analysis" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Technical analysis with CCI" }
    ],
    interpretation: {
      bullish: "CCI moves above -100 from oversold territory, positive divergence",
      bearish: "CCI moves below +100 from overbought territory, negative divergence",
      neutral: "CCI oscillates between -100 and +100 without clear direction"
    }
  },
  {
    id: "adx",
    name: "Average Directional Index (ADX)",
    category: "trend",
    description: "Measures the strength of a trend without regard to trend direction.",
    usage: "Values above 25 indicate strong trend, below 20 indicate weak trend or sideways movement.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "ADX with +DI and -DI components" },
      { name: "Binance", url: "https://binance.com", description: "Trend strength analysis with ADX" }
    ],
    interpretation: {
      bullish: "ADX above 25 with +DI above -DI indicates strong uptrend",
      bearish: "ADX above 25 with -DI above +DI indicates strong downtrend",
      neutral: "ADX below 20 indicates weak trend or consolidation"
    }
  },
  {
    id: "parabolic_sar",
    name: "Parabolic SAR",
    category: "trend",
    description: "Provides potential exit points by tracking price and time to determine stop and reverse points.",
    usage: "Dots below price indicate uptrend, dots above price indicate downtrend.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Parabolic SAR with customizable acceleration" },
      { name: "Kraken", url: "https://kraken.com", description: "SAR indicator in trading platform" }
    ],
    interpretation: {
      bullish: "SAR dots below price, recent switch from above to below",
      bearish: "SAR dots above price, recent switch from below to above",
      neutral: "Frequent SAR switches indicate choppy, trendless market"
    }
  },
  {
    id: "momentum",
    name: "Momentum Indicator",
    category: "momentum",
    description: "Measures the rate of change in price over a specified time period.",
    usage: "Positive momentum indicates accelerating prices, negative indicates decelerating prices.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Momentum with customizable periods" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Price momentum analysis" }
    ],
    interpretation: {
      bullish: "Momentum above zero and rising, positive momentum divergence",
      bearish: "Momentum below zero and falling, negative momentum divergence",
      neutral: "Momentum oscillating around zero without clear direction"
    }
  },
  {
    id: "roc",
    name: "Rate of Change (ROC)",
    category: "momentum",
    description: "Measures the percentage change in price from one period to the next.",
    usage: "Positive ROC indicates price increase, negative indicates price decrease from reference period.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "ROC indicator with multiple timeframes" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Rate of change analysis tools" }
    ],
    interpretation: {
      bullish: "ROC above zero and accelerating, positive ROC divergence",
      bearish: "ROC below zero and decelerating, negative ROC divergence",
      neutral: "ROC near zero indicates price stability"
    }
  },
  {
    id: "money_flow",
    name: "Money Flow Index (MFI)",
    category: "volume",
    description: "Volume-weighted RSI that incorporates both price and volume to measure buying/selling pressure.",
    usage: "Values above 80 indicate overbought, below 20 indicate oversold conditions with volume confirmation.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "MFI with volume-price analysis" },
      { name: "Binance", url: "https://binance.com", description: "Money flow analysis tools" }
    ],
    interpretation: {
      bullish: "MFI below 20 indicates oversold with strong buying interest",
      bearish: "MFI above 80 indicates overbought with strong selling pressure",
      neutral: "MFI between 20-80 indicates balanced money flow"
    }
  },
  {
    id: "elder_ray",
    name: "Elder Ray Index",
    category: "momentum",
    description: "Combines moving averages with oscillators to measure buying and selling pressure.",
    usage: "Bull Power and Bear Power components show the strength of buyers vs sellers.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Elder Ray with Bull/Bear Power components" },
      { name: "Kraken", url: "https://kraken.com", description: "Advanced momentum analysis" }
    ],
    interpretation: {
      bullish: "Bull Power positive and rising, Bear Power improving",
      bearish: "Bear Power negative and falling, Bull Power declining",
      neutral: "Bull and Bear Power oscillating around zero"
    }
  },
  {
    id: "chande_momentum",
    name: "Chande Momentum Oscillator",
    category: "momentum",
    description: "Momentum oscillator that measures the difference between sum of gains and losses over N periods.",
    usage: "Values above +50 indicate strong upward momentum, below -50 indicate strong downward momentum.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Chande Momentum with overbought/oversold levels" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Momentum oscillator analysis" }
    ],
    interpretation: {
      bullish: "CMO above +50, momentum accelerating upward",
      bearish: "CMO below -50, momentum accelerating downward",
      neutral: "CMO between -50 and +50, moderate momentum"
    }
  },
  {
    id: "trix",
    name: "TRIX",
    category: "momentum",
    description: "Triple exponentially smoothed moving average that filters out price noise and shows momentum changes.",
    usage: "TRIX crossovers and divergences signal potential trend changes.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "TRIX indicator with signal line" },
      { name: "Binance", url: "https://binance.com", description: "TRIX momentum analysis" }
    ],
    interpretation: {
      bullish: "TRIX crosses above zero or signal line, positive divergence",
      bearish: "TRIX crosses below zero or signal line, negative divergence",
      neutral: "TRIX oscillating around zero without clear direction"
    }
  },
  {
    id: "keltner_channels",
    name: "Keltner Channels",
    category: "volatility",
    description: "Volatility-based channels that use ATR to set upper and lower boundaries around a moving average.",
    usage: "Price touching channels indicates potential reversal, breakouts signal trend continuation.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Keltner Channels with customizable ATR multiplier" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Volatility channel analysis" }
    ],
    interpretation: {
      bullish: "Price breaks above upper channel, sustained move above center line",
      bearish: "Price breaks below lower channel, sustained move below center line",
      neutral: "Price trading within channels without clear breakout"
    }
  },
  {
    id: "donchian_channels",
    name: "Donchian Channels",
    category: "support_resistance",
    description: "Shows the highest high and lowest low over a specified period, creating support and resistance levels.",
    usage: "Breakouts above/below channels signal potential trend continuation or reversal.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Donchian Channels with customizable periods" },
      { name: "Kraken", url: "https://kraken.com", description: "Support/resistance channel analysis" }
    ],
    interpretation: {
      bullish: "Price breaks above upper channel, new higher highs established",
      bearish: "Price breaks below lower channel, new lower lows established",
      neutral: "Price consolidating within established channel range"
    }
  },
  {
    id: "accumulation_distribution",
    name: "Accumulation/Distribution Line",
    category: "volume",
    description: "Volume indicator that shows the cumulative flow of money into and out of a security.",
    usage: "Rising A/D line indicates accumulation, falling line indicates distribution.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "A/D Line with divergence analysis" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Volume accumulation tracking" }
    ],
    interpretation: {
      bullish: "A/D line rising while price consolidates, positive divergence",
      bearish: "A/D line falling while price consolidates, negative divergence",
      neutral: "A/D line moving sideways with price action"
    }
  },
  {
    id: "ease_of_movement",
    name: "Ease of Movement (EMV)",
    category: "volume",
    description: "Combines price and volume to assess how easily a price can move based on volume.",
    usage: "Positive EMV indicates easy upward movement, negative indicates easy downward movement.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Ease of Movement with volume analysis" },
      { name: "Binance", url: "https://binance.com", description: "Price-volume relationship indicator" }
    ],
    interpretation: {
      bullish: "EMV positive and rising, price moves up easily on low volume",
      bearish: "EMV negative and falling, price moves down easily on low volume",
      neutral: "EMV near zero, price movement requires significant volume"
    }
  },
  {
    id: "force_index",
    name: "Force Index",
    category: "volume",
    description: "Combines price change and volume to measure the force behind price movements.",
    usage: "High positive values indicate strong buying force, high negative values indicate strong selling force.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Force Index with smoothing options" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Volume-price force analysis" }
    ],
    interpretation: {
      bullish: "Force Index positive and rising, strong buying pressure",
      bearish: "Force Index negative and falling, strong selling pressure",
      neutral: "Force Index near zero, balanced buying and selling forces"
    }
  },
  {
    id: "vwap",
    name: "Volume Weighted Average Price (VWAP)",
    category: "volume",
    description: "Average price weighted by volume, often used as a benchmark for institutional trading.",
    usage: "Price above VWAP suggests bullish sentiment, below suggests bearish sentiment.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "VWAP with standard deviation bands" },
      { name: "Binance", url: "https://binance.com", description: "Institutional trading benchmark" }
    ],
    interpretation: {
      bullish: "Price consistently trading above VWAP, volume supporting upward moves",
      bearish: "Price consistently trading below VWAP, volume supporting downward moves",
      neutral: "Price oscillating around VWAP without clear direction"
    }
  },
  {
    id: "price_oscillator",
    name: "Price Oscillator",
    category: "momentum",
    description: "Shows the difference between two moving averages as a percentage or absolute value.",
    usage: "Positive values indicate upward momentum, negative values indicate downward momentum.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Price Oscillator with customizable MA periods" },
      { name: "Kraken", url: "https://kraken.com", description: "Momentum oscillator analysis" }
    ],
    interpretation: {
      bullish: "Price Oscillator positive and rising, crossover above zero",
      bearish: "Price Oscillator negative and falling, crossover below zero",
      neutral: "Price Oscillator oscillating around zero line"
    }
  },
  {
    id: "ultimate_oscillator",
    name: "Ultimate Oscillator",
    category: "momentum",
    description: "Combines three different time periods to reduce false signals common in single-period oscillators.",
    usage: "Values above 70 indicate overbought, below 30 indicate oversold conditions.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Ultimate Oscillator with multi-timeframe analysis" },
      { name: "CoinGecko", url: "https://coingecko.com", description: "Advanced momentum oscillator" }
    ],
    interpretation: {
      bullish: "Ultimate Oscillator above 50 and rising, bullish divergence pattern",
      bearish: "Ultimate Oscillator below 50 and falling, bearish divergence pattern",
      neutral: "Ultimate Oscillator between 30-70 without clear trend"
    }
  },
  {
    id: "mass_index",
    name: "Mass Index",
    category: "volatility",
    description: "Identifies potential reversal points by analyzing the narrowing and widening of trading ranges.",
    usage: "Values above 27 suggest potential trend reversal, below 26.5 indicate stable trend.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Mass Index for reversal identification" },
      { name: "Binance", url: "https://binance.com", description: "Volatility-based reversal indicator" }
    ],
    interpretation: {
      bullish: "Mass Index spikes above 27 during downtrend, potential reversal",
      bearish: "Mass Index spikes above 27 during uptrend, potential reversal",
      neutral: "Mass Index below 26.5, trend likely to continue"
    }
  },
  {
    id: "chaikin_oscillator",
    name: "Chaikin Oscillator",
    category: "volume",
    description: "Applies MACD to the Accumulation/Distribution Line to measure momentum of volume flow.",
    usage: "Positive values indicate accumulation momentum, negative values indicate distribution momentum.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Chaikin Oscillator with A/D Line analysis" },
      { name: "CoinMarketCap", url: "https://coinmarketcap.com", description: "Volume momentum indicator" }
    ],
    interpretation: {
      bullish: "Chaikin Oscillator crosses above zero, positive volume momentum",
      bearish: "Chaikin Oscillator crosses below zero, negative volume momentum",
      neutral: "Chaikin Oscillator oscillating around zero line"
    }
  },
  {
    id: "pivot_points",
    name: "Pivot Points",
    category: "support_resistance",
    description: "Calculates potential support and resistance levels based on previous period's high, low, and close.",
    usage: "Price above pivot is bullish bias, below is bearish bias. S1/S2/R1/R2 are key levels.",
    freeSources: [
      { name: "TradingView", url: "https://tradingview.com", description: "Multiple pivot point calculation methods" },
      { name: "Kraken", url: "https://kraken.com", description: "Daily/weekly/monthly pivot levels" }
    ],
    interpretation: {
      bullish: "Price above pivot point, testing resistance levels R1/R2",
      bearish: "Price below pivot point, testing support levels S1/S2",
      neutral: "Price oscillating around pivot point without clear direction"
    }
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'trend':
      return <TrendingUp className="h-4 w-4" />;
    case 'momentum':
      return <Zap className="h-4 w-4" />;
    case 'volume':
      return <BarChart3 className="h-4 w-4" />;
    case 'volatility':
      return <Activity className="h-4 w-4" />;
    case 'support_resistance':
      return <Target className="h-4 w-4" />;
    default:
      return <Gauge className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'trend':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'momentum':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'volume':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'volatility':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'support_resistance':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    default:
      return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  }
};

export function CryptoIndicators() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch live AI analysis
  const { data: liveAnalysis, isLoading: isLoadingAnalysis } = useQuery<LiveAnalysisData>({
    queryKey: ['/api/indicators/live-analysis'],
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
  });

  const categories = ["all", "trend", "momentum", "volume", "volatility", "support_resistance"];

  const filteredIndicators = tradingIndicators.filter(indicator => {
    const matchesSearch = indicator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         indicator.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || indicator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefreshAnalysis = async () => {
    try {
      setIsRefreshing(true);
      
      // Force refresh by clearing cache and fetching new data
      queryClient.removeQueries({ queryKey: ['/api/indicators/live-analysis'] });
      
      // Trigger a new fetch with force refresh parameter
      await queryClient.fetchQuery({
        queryKey: ['/api/indicators/live-analysis'],
        queryFn: () => fetch('/api/indicators/live-analysis?refresh=true').then(res => res.json())
      });
    } catch (error) {
      console.error('Failed to refresh analysis:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
        return 'text-green-500';
      case 'bearish':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getSignalBadgeColor = (signal: string) => {
    switch (signal) {
      case 'bullish':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'bearish':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Live Analysis Section */}
      {liveAnalysis && (
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Brain className="h-6 w-6 text-blue-500" />
                AI Live Bitcoin Analysis & Price Predictions
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshAnalysis}
                disabled={isRefreshing}
                className="h-8 w-8 p-0"
                title="Refresh AI analysis"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Current BTC: ${liveAnalysis.currentPrice.toLocaleString()}</span>
              <span>•</span>
              <span>Updated: {new Date(liveAnalysis.timestamp).toLocaleTimeString()}</span>
              <span>•</span>
              <Badge className={getSignalBadgeColor(liveAnalysis.overallSignal)}>
                {liveAnalysis.overallSignal.toUpperCase()}
              </Badge>
              <span>Confidence: {liveAnalysis.confidenceScore}%</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Price Predictions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <h4 className="font-semibold">Short Term (24-48h)</h4>
                </div>
                <div className="text-2xl font-bold text-green-500">
                  ${liveAnalysis.pricePredictions.shortTerm.target.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {liveAnalysis.pricePredictions.shortTerm.probability}% confidence
                </div>
                <p className="text-xs mt-2">{liveAnalysis.pricePredictions.shortTerm.reasoning}</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <h4 className="font-semibold">Medium Term (1-2w)</h4>
                </div>
                <div className="text-2xl font-bold text-blue-500">
                  ${liveAnalysis.pricePredictions.mediumTerm.target.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {liveAnalysis.pricePredictions.mediumTerm.probability}% confidence
                </div>
                <p className="text-xs mt-2">{liveAnalysis.pricePredictions.mediumTerm.reasoning}</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-500" />
                  <h4 className="font-semibold">Long Term (1m)</h4>
                </div>
                <div className="text-2xl font-bold text-purple-500">
                  ${liveAnalysis.pricePredictions.longTerm.target.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {liveAnalysis.pricePredictions.longTerm.probability}% confidence
                </div>
                <p className="text-xs mt-2">{liveAnalysis.pricePredictions.longTerm.reasoning}</p>
              </Card>
            </div>

            {/* Topping Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <h4 className="font-semibold">Near-Term Top Analysis</h4>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={liveAnalysis.toppingAnalysis.nearTermTop.predicted ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}>
                    {liveAnalysis.toppingAnalysis.nearTermTop.predicted ? 'TOP PREDICTED' : 'NO TOP PREDICTED'}
                  </Badge>
                  <span className="text-sm">{liveAnalysis.toppingAnalysis.nearTermTop.confidence}% confidence</span>
                </div>
                {liveAnalysis.toppingAnalysis.nearTermTop.priceLevel && (
                  <div className="text-lg font-semibold text-orange-500 mb-2">
                    Target: ${liveAnalysis.toppingAnalysis.nearTermTop.priceLevel.toLocaleString()}
                  </div>
                )}
                <p className="text-xs">{liveAnalysis.toppingAnalysis.nearTermTop.reasoning}</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <h4 className="font-semibold">Cyclical Top Analysis</h4>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={liveAnalysis.toppingAnalysis.cyclicalTop.predicted ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}>
                    {liveAnalysis.toppingAnalysis.cyclicalTop.predicted ? 'CYCLE TOP PREDICTED' : 'NO CYCLE TOP'}
                  </Badge>
                  <span className="text-sm">{liveAnalysis.toppingAnalysis.cyclicalTop.confidence}% confidence</span>
                </div>
                {liveAnalysis.toppingAnalysis.cyclicalTop.priceLevel && (
                  <div className="text-lg font-semibold text-red-500 mb-2">
                    Target: ${liveAnalysis.toppingAnalysis.cyclicalTop.priceLevel.toLocaleString()}
                  </div>
                )}
                <p className="text-xs">{liveAnalysis.toppingAnalysis.cyclicalTop.reasoning}</p>
              </Card>
            </div>

            {/* AI Analyzed Indicators */}
            {liveAnalysis.indicators && liveAnalysis.indicators.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Live Indicator Signals (AI Analyzed)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {liveAnalysis.indicators.map((indicator, index) => (
                    <Card key={index} className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium text-sm">{indicator.indicator}</h5>
                        <Badge className={getSignalBadgeColor(indicator.signal)}>
                          {indicator.signal.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Value: {indicator.currentValue} | Strength: {indicator.strength}/10
                      </div>
                      <p className="text-xs">{indicator.interpretation}</p>
                      {indicator.priceTarget && (
                        <div className="text-xs font-medium mt-1 text-primary">
                          Target: ${indicator.priceTarget.toLocaleString()}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights and Risk Factors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Brain className="h-4 w-4 text-blue-500" />
                  AI Insights
                </h4>
                <ul className="space-y-1">
                  {liveAnalysis.aiInsights.map((insight, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Risk Factors
                </h4>
                <ul className="space-y-1">
                  {liveAnalysis.riskFactors.map((risk, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {risk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Top 30 Cryptocurrency Trading Indicators
          </CardTitle>
          <p className="text-muted-foreground">
            Comprehensive analysis of key technical indicators with free data sources and interpretation guidance.
            All sources provide authentic, real-time data without relying on user-generated content.
          </p>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search indicators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category.replace("_", " ")}
                </Button>
              ))}
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500">{tradingIndicators.filter(i => i.category === 'trend').length}</div>
                <div className="text-xs text-muted-foreground">Trend</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">{tradingIndicators.filter(i => i.category === 'momentum').length}</div>
                <div className="text-xs text-muted-foreground">Momentum</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">{tradingIndicators.filter(i => i.category === 'volume').length}</div>
                <div className="text-xs text-muted-foreground">Volume</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">{tradingIndicators.filter(i => i.category === 'volatility').length}</div>
                <div className="text-xs text-muted-foreground">Volatility</div>
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-500">{tradingIndicators.filter(i => i.category === 'support_resistance').length}</div>
                <div className="text-xs text-muted-foreground">S&R</div>
              </div>
            </Card>
          </div>

          {/* Indicators Grid */}
          <div className="grid gap-4">
            {filteredIndicators.map((indicator) => (
              <Card key={indicator.id} className="border-muted/20 hover:border-muted/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{indicator.name}</h3>
                        <Badge className={getCategoryColor(indicator.category)}>
                          <div className="flex items-center gap-1">
                            {getCategoryIcon(indicator.category)}
                            {indicator.category.replace("_", " ").toUpperCase()}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {indicator.description}
                      </p>
                      <p className="text-sm mb-3">
                        <strong>Usage:</strong> {indicator.usage}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedCard(expandedCard === indicator.id ? null : indicator.id)}
                      className="ml-4"
                    >
                      {expandedCard === indicator.id ? "Less" : "More"}
                    </Button>
                  </div>

                  {expandedCard === indicator.id && (
                    <div className="space-y-4 mt-4 pt-4 border-t border-muted/20">
                      {/* Free Data Sources */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Free Data Sources:</h4>
                        <div className="space-y-2">
                          {indicator.freeSources.map((source, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-muted/10 rounded">
                              <div>
                                <div className="font-medium text-sm">{source.name}</div>
                                <div className="text-xs text-muted-foreground">{source.description}</div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(source.url, '_blank')}
                                className="h-8 w-8 p-0"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Interpretation Guide */}
                      <div>
                        <h4 className="font-medium text-sm mb-2">Interpretation Guide:</h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded">
                            <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm text-green-500">Bullish Signal</div>
                              <div className="text-xs text-muted-foreground">{indicator.interpretation.bullish}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded">
                            <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm text-red-500">Bearish Signal</div>
                              <div className="text-xs text-muted-foreground">{indicator.interpretation.bearish}</div>
                            </div>
                          </div>
                          <div className="flex items-start gap-2 p-2 bg-yellow-500/10 rounded">
                            <Activity className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <div>
                              <div className="font-medium text-sm text-yellow-500">Neutral Signal</div>
                              <div className="text-xs text-muted-foreground">{indicator.interpretation.neutral}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIndicators.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No indicators found matching your search criteria.</p>
            </div>
          )}

          {/* Footer Information */}
          <div className="mt-8 p-4 bg-muted/10 rounded-lg">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                <strong>Data Sources:</strong> All recommended sources provide free access to real-time cryptocurrency data and technical indicators. 
                Some platforms may require free account registration but do not rely on user-generated content.
              </p>
              <p>
                <strong>Last Updated:</strong> August 24, 2025 | 
                <strong> Total Indicators:</strong> {tradingIndicators.length} | 
                <strong> Categories:</strong> {categories.length - 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
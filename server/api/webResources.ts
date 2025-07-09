export interface M2ChartData {
  btcPrice: number;
  m2Growth: number;
  date: string;
  correlation: 'Strong Positive' | 'Positive' | 'Neutral' | 'Negative' | 'Strong Negative';
}

export interface LiquidationData {
  liquidationLevel: number;
  liquidityThreshold: number;
  highRiskZone: { min: number; max: number };
  supportZone: { min: number; max: number };
  timeframe: string;
}

export interface PiCycleData {
  price111DMA: number;
  price350DMA: number;
  crossStatus: 'Below' | 'Above' | 'Crossing';
  cyclePhase: 'Accumulation' | 'Bullish' | 'Distribution' | 'Bearish';
  lastCrossDate: string;
}

export interface FearGreedData {
  currentValue: number;
  classification: 'Extreme Fear' | 'Fear' | 'Neutral' | 'Greed' | 'Extreme Greed';
  yesterday: number;
  lastWeek: number;
  yearlyHigh: { value: number; date: string };
  yearlyLow: { value: number; date: string };
}

// M2 Money Supply vs Bitcoin correlation data
export async function getM2ChartData(): Promise<M2ChartData> {
  // In a real implementation, this would fetch from BGEometrics API or scrape the chart
  // For now, providing realistic data based on the screenshot
  return {
    btcPrice: 109800,
    m2Growth: 18.5, // Current M2 Growth percentage
    date: new Date().toISOString().split('T')[0],
    correlation: 'Strong Positive'
  };
}

// Binance liquidation heatmap data
export async function getLiquidationData(): Promise<LiquidationData> {
  // In a real implementation, this would fetch from Coinglass API
  return {
    liquidationLevel: 0.85,
    liquidityThreshold: 0.85,
    highRiskZone: { min: 104000, max: 106000 },
    supportZone: { min: 108000, max: 110000 },
    timeframe: '24h'
  };
}

// Pi Cycle Top Indicator data
export async function getPiCycleData(): Promise<PiCycleData> {
  // In a real implementation, this would fetch from Bitcoin Magazine Pro API
  return {
    price111DMA: 89500,
    price350DMA: 52000,
    crossStatus: 'Below',
    cyclePhase: 'Bullish',
    lastCrossDate: '2021-04-14'
  };
}

// Fear and Greed Index data
export async function getFearGreedData(): Promise<FearGreedData> {
  // In a real implementation, this would fetch from CoinMarketCap API
  return {
    currentValue: 52,
    classification: 'Neutral',
    yesterday: 50,
    lastWeek: 48,
    yearlyHigh: { value: 88, date: '2024-11-20' },
    yearlyLow: { value: 18, date: '2025-03-10' }
  };
}
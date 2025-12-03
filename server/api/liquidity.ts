import axios from 'axios';

export interface LiquidityIndicator {
  seriesId: string;
  name: string;
  shortName: string;
  value: number;
  previousValue: number;
  yoyChange: number;
  yoyChangePercent: number;
  date: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  unit: string;
  description: string;
  isAnomaly: boolean;
  anomalyThreshold: number;
}

export interface LiquidityData {
  indicators: LiquidityIndicator[];
  anomalies: LiquidityIndicator[];
  summary: {
    totalIndicators: number;
    anomalyCount: number;
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    lastUpdated: string;
  };
}

const LIQUIDITY_SERIES = [
  {
    seriesId: 'M2SL',
    name: 'M2 Money Stock',
    shortName: 'M2',
    frequency: 'Monthly' as const,
    unit: 'Billions USD',
    description: 'Broad money supply (cash + deposits + near-monies). YoY spikes >10% often precede inflation or asset bubbles.',
    anomalyThreshold: 5
  },
  {
    seriesId: 'M1SL',
    name: 'M1 Money Stock',
    shortName: 'M1',
    frequency: 'Monthly' as const,
    unit: 'Billions USD',
    description: 'Narrowest measure (cash + checking). Watch for velocity traps or sudden contractions signaling credit crunches.',
    anomalyThreshold: 5
  },
  {
    seriesId: 'RRPONTSYD',
    name: 'Overnight Reverse Repo (RRP)',
    shortName: 'RRP',
    frequency: 'Daily' as const,
    unit: 'Billions USD',
    description: 'Fed\'s "parking lot" for excess cash. Jumps >$2T indicate liquidity hoarding, sterilizing money supply growth.',
    anomalyThreshold: 10
  },
  {
    seriesId: 'WTREGEN',
    name: 'Treasury General Account (TGA)',
    shortName: 'TGA',
    frequency: 'Weekly' as const,
    unit: 'Billions USD',
    description: 'Government\'s "checking account" at Fed. Drawdowns inject reserves, builds drain it—key for QT/QE pivots.',
    anomalyThreshold: 15
  },
  {
    seriesId: 'WALCL',
    name: 'Fed Total Assets (Balance Sheet)',
    shortName: 'Fed BS',
    frequency: 'Weekly' as const,
    unit: 'Millions USD',
    description: 'Fed\'s full firepower. Expansions >$1T/quarter signal monetization, correlating with M2 surges and risk-on rallies.',
    anomalyThreshold: 5
  },
  {
    seriesId: 'WRESBAL',
    name: 'Bank Reserve Balances',
    shortName: 'Reserves',
    frequency: 'Weekly' as const,
    unit: 'Billions USD',
    description: 'Bank excess reserves. Floods here (>$3T) mute rate signals, but rapid drains can spike interbank rates.',
    anomalyThreshold: 10
  },
  {
    seriesId: 'CURRCIR',
    name: 'Currency in Circulation',
    shortName: 'Currency',
    frequency: 'Monthly' as const,
    unit: 'Billions USD',
    description: 'Physical dollars abroad/hoarded. Steady climbs amid digital shifts signal de-dollarization fears.',
    anomalyThreshold: 5
  },
  {
    seriesId: 'BOGMBASE',
    name: 'Monetary Base',
    shortName: 'M0',
    frequency: 'Monthly' as const,
    unit: 'Billions USD',
    description: 'High-powered money (reserves + currency). Divergences from M2 highlight multiplier breakdowns.',
    anomalyThreshold: 5
  }
];

let liquidityCache: {
  data: LiquidityData | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_DURATION = 10 * 60 * 1000;

async function fetchFREDSeries(seriesId: string): Promise<{ value: number; previousValue: number; date: string } | null> {
  try {
    const response = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
      params: {
        series_id: seriesId,
        api_key: process.env.FRED_API_KEY,
        file_type: 'json',
        limit: 30,
        sort_order: 'desc'
      },
      timeout: 10000
    });

    if (response.data?.observations) {
      const validObs = response.data.observations.filter(
        (obs: any) => obs.value && obs.value !== '.' && !isNaN(parseFloat(obs.value))
      );

      if (validObs.length >= 2) {
        const latest = validObs[0];
        
        const latestDate = new Date(latest.date);
        const oneYearAgo = new Date(latestDate);
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        
        const previousObs = validObs.find((obs: any) => {
          const obsDate = new Date(obs.date);
          const diffDays = Math.abs((latestDate.getTime() - obsDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= 350 && diffDays <= 380;
        }) || validObs[validObs.length - 1];

        return {
          value: parseFloat(latest.value),
          previousValue: parseFloat(previousObs.value),
          date: latest.date
        };
      }
    }
    return null;
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

export async function getLiquidityData(): Promise<LiquidityData> {
  const now = Date.now();
  if (liquidityCache.data && (now - liquidityCache.timestamp) < CACHE_DURATION) {
    console.log('✓ Returning cached liquidity data');
    return liquidityCache.data;
  }

  console.log('🔄 Fetching fresh FRED liquidity data...');

  const indicators: LiquidityIndicator[] = [];
  const anomalies: LiquidityIndicator[] = [];

  const fetchPromises = LIQUIDITY_SERIES.map(async (series) => {
    const data = await fetchFREDSeries(series.seriesId);
    
    if (data) {
      const yoyChange = data.value - data.previousValue;
      const yoyChangePercent = ((data.value - data.previousValue) / data.previousValue) * 100;
      const isAnomaly = Math.abs(yoyChangePercent) > series.anomalyThreshold;

      const indicator: LiquidityIndicator = {
        seriesId: series.seriesId,
        name: series.name,
        shortName: series.shortName,
        value: data.value,
        previousValue: data.previousValue,
        yoyChange,
        yoyChangePercent,
        date: data.date,
        frequency: series.frequency,
        unit: series.unit,
        description: series.description,
        isAnomaly,
        anomalyThreshold: series.anomalyThreshold
      };

      indicators.push(indicator);
      
      if (isAnomaly) {
        anomalies.push(indicator);
      }
    }
  });

  await Promise.all(fetchPromises);

  indicators.sort((a, b) => {
    const order = ['M2', 'M1', 'RRP', 'TGA', 'Fed BS', 'Reserves', 'Currency', 'M0'];
    return order.indexOf(a.shortName) - order.indexOf(b.shortName);
  });

  let overallSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  
  const m2 = indicators.find(i => i.seriesId === 'M2SL');
  const fedBS = indicators.find(i => i.seriesId === 'WALCL');
  const rrp = indicators.find(i => i.seriesId === 'RRPONTSYD');
  
  if (m2 && fedBS) {
    const liquidityExpanding = m2.yoyChangePercent > 3 || fedBS.yoyChangePercent > 5;
    const liquidityContracting = m2.yoyChangePercent < -2 || fedBS.yoyChangePercent < -3;
    const rrpDraining = rrp && rrp.yoyChangePercent < -20;
    
    if (liquidityExpanding || rrpDraining) {
      overallSignal = 'bullish';
    } else if (liquidityContracting) {
      overallSignal = 'bearish';
    }
  }

  const result: LiquidityData = {
    indicators,
    anomalies,
    summary: {
      totalIndicators: indicators.length,
      anomalyCount: anomalies.length,
      overallSignal,
      lastUpdated: new Date().toISOString()
    }
  };

  liquidityCache = { data: result, timestamp: now };
  
  console.log(`✓ Liquidity data fetched: ${indicators.length} indicators, ${anomalies.length} anomalies`);
  
  return result;
}

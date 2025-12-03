import axios from 'axios';

export interface LiquidityIndicator {
  seriesId: string;
  name: string;
  shortName: string;
  value: number;
  displayValue: string;
  previousValue: number;
  yoyChange: number;
  yoyChangePercent: number;
  date: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  unit: string;
  rawUnit: 'billions' | 'millions' | 'percent' | 'index';
  description: string;
  isAnomaly: boolean;
  anomalyThreshold: number;
  category: 'core' | 'velocity' | 'policy' | 'fed_holdings';
}

export interface DerivedMetric {
  id: string;
  name: string;
  shortName: string;
  value: number;
  displayValue: string;
  description: string;
  isAnomaly: boolean;
  anomalyThreshold: number;
  formula: string;
}

export interface LiquidityData {
  indicators: LiquidityIndicator[];
  derivedMetrics: DerivedMetric[];
  anomalies: LiquidityIndicator[];
  summary: {
    totalIndicators: number;
    anomalyCount: number;
    overallSignal: 'bullish' | 'bearish' | 'neutral';
    signalReasons: string[];
    lastUpdated: string;
  };
}

interface SeriesConfig {
  seriesId: string;
  name: string;
  shortName: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  rawUnit: 'billions' | 'millions' | 'percent' | 'index';
  description: string;
  anomalyThreshold: number;
  category: 'core' | 'velocity' | 'policy' | 'fed_holdings';
}

const LIQUIDITY_SERIES: SeriesConfig[] = [
  {
    seriesId: 'M2SL',
    name: 'M2 Money Stock',
    shortName: 'M2',
    frequency: 'Monthly',
    rawUnit: 'billions',
    description: 'Broad money supply (cash + deposits + near-monies). YoY spikes >10% often precede inflation or asset bubbles.',
    anomalyThreshold: 5,
    category: 'core'
  },
  {
    seriesId: 'M1SL',
    name: 'M1 Money Stock',
    shortName: 'M1',
    frequency: 'Monthly',
    rawUnit: 'billions',
    description: 'Narrowest measure (cash + checking). Watch for velocity traps or sudden contractions signaling credit crunches.',
    anomalyThreshold: 5,
    category: 'core'
  },
  {
    seriesId: 'RRPONTSYD',
    name: 'Overnight Reverse Repo (RRP)',
    shortName: 'RRP',
    frequency: 'Daily',
    rawUnit: 'billions',
    description: 'Fed\'s "parking lot" for excess cash. Jumps >$2T indicate liquidity hoarding, sterilizing money supply growth.',
    anomalyThreshold: 10,
    category: 'core'
  },
  {
    seriesId: 'WTREGEN',
    name: 'Treasury General Account (TGA)',
    shortName: 'TGA',
    frequency: 'Weekly',
    rawUnit: 'millions',
    description: 'Government\'s "checking account" at Fed. Drawdowns inject reserves, builds drain it—key for QT/QE pivots.',
    anomalyThreshold: 15,
    category: 'core'
  },
  {
    seriesId: 'WALCL',
    name: 'Fed Total Assets (Balance Sheet)',
    shortName: 'Fed BS',
    frequency: 'Weekly',
    rawUnit: 'millions',
    description: 'Fed\'s full firepower. Expansions >$1T/quarter signal monetization, correlating with M2 surges and risk-on rallies.',
    anomalyThreshold: 5,
    category: 'core'
  },
  {
    seriesId: 'WRESBAL',
    name: 'Bank Reserve Balances',
    shortName: 'Reserves',
    frequency: 'Weekly',
    rawUnit: 'millions',
    description: 'Bank excess reserves. Floods here (>$3T) mute rate signals, but rapid drains can spike interbank rates.',
    anomalyThreshold: 10,
    category: 'core'
  },
  {
    seriesId: 'CURRCIR',
    name: 'Currency in Circulation',
    shortName: 'Currency',
    frequency: 'Monthly',
    rawUnit: 'billions',
    description: 'Physical dollars abroad/hoarded. Steady climbs amid digital shifts signal de-dollarization fears.',
    anomalyThreshold: 5,
    category: 'core'
  },
  {
    seriesId: 'BOGMBASE',
    name: 'Monetary Base',
    shortName: 'M0',
    frequency: 'Monthly',
    rawUnit: 'billions',
    description: 'High-powered money (reserves + currency). Divergences from M2 highlight multiplier breakdowns.',
    anomalyThreshold: 5,
    category: 'core'
  },
  {
    seriesId: 'M2V',
    name: 'Velocity of M2 Money Stock',
    shortName: 'M2 Velocity',
    frequency: 'Quarterly',
    rawUnit: 'index',
    description: 'Money circulation speed. Plunges signal hoarding/trapped liquidity, amplifying debasement risks without growth.',
    anomalyThreshold: 5,
    category: 'velocity'
  },
  {
    seriesId: 'M1V',
    name: 'Velocity of M1 Money Stock',
    shortName: 'M1 Velocity',
    frequency: 'Quarterly',
    rawUnit: 'index',
    description: 'Transaction money velocity. Divergences from M2V highlight credit freezes or digital payment shifts.',
    anomalyThreshold: 5,
    category: 'velocity'
  },
  {
    seriesId: 'FEDFUNDS',
    name: 'Effective Federal Funds Rate',
    shortName: 'Fed Funds',
    frequency: 'Monthly',
    rawUnit: 'percent',
    description: 'Policy barometer. Spikes correlate with reserve crunches; overlay with Reserves for irregularity alerts.',
    anomalyThreshold: 20,
    category: 'policy'
  },
  {
    seriesId: 'TREAST',
    name: 'Treasury Securities Held by Fed',
    shortName: 'Fed Treasuries',
    frequency: 'Weekly',
    rawUnit: 'millions',
    description: 'Balance sheet breakdown. Surges indicate QE monetization, inflating base irregularly. Track vs Fed BS for asset mix.',
    anomalyThreshold: 5,
    category: 'fed_holdings'
  },
  {
    seriesId: 'WSHOMCB',
    name: 'Mortgage-Backed Securities Held by Fed',
    shortName: 'Fed MBS',
    frequency: 'Weekly',
    rawUnit: 'millions',
    description: 'QE relic. Runoffs drain liquidity subtly. Anomalies presage housing/credit distortions.',
    anomalyThreshold: 5,
    category: 'fed_holdings'
  }
];

let liquidityCache: {
  data: LiquidityData | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_DURATION = 10 * 60 * 1000;

function getObservationLimit(frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'): number {
  switch (frequency) {
    case 'Daily': return 400;
    case 'Weekly': return 80;
    case 'Monthly': return 24;
    case 'Quarterly': return 12;
    default: return 100;
  }
}

function normalizeToTrueValue(rawValue: number, rawUnit: 'billions' | 'millions' | 'percent' | 'index'): number {
  switch (rawUnit) {
    case 'millions':
      return rawValue / 1000;
    case 'billions':
    case 'percent':
    case 'index':
    default:
      return rawValue;
  }
}

function formatDisplayValue(valueInBillions: number, rawUnit: 'billions' | 'millions' | 'percent' | 'index'): string {
  if (rawUnit === 'percent') {
    return `${valueInBillions.toFixed(2)}%`;
  }
  if (rawUnit === 'index') {
    return valueInBillions.toFixed(2);
  }
  
  if (valueInBillions >= 1000) {
    return `$${(valueInBillions / 1000).toFixed(2)}T`;
  } else if (valueInBillions >= 1) {
    return `$${valueInBillions.toFixed(2)}B`;
  } else {
    return `$${(valueInBillions * 1000).toFixed(2)}M`;
  }
}

async function fetchFREDSeries(seriesId: string, frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly'): Promise<{ value: number; previousValue: number; date: string } | null> {
  try {
    const limit = getObservationLimit(frequency);
    
    const response = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
      params: {
        series_id: seriesId,
        api_key: process.env.FRED_API_KEY,
        file_type: 'json',
        limit: limit,
        sort_order: 'desc'
      },
      timeout: 15000
    });

    if (response.data?.observations) {
      const validObs = response.data.observations.filter(
        (obs: any) => obs.value && obs.value !== '.' && !isNaN(parseFloat(obs.value))
      );

      if (validObs.length >= 2) {
        const latest = validObs[0];
        const latestDate = new Date(latest.date);
        
        const targetDays = frequency === 'Quarterly' ? 365 : 365;
        const tolerance = frequency === 'Quarterly' ? 45 : 30;
        
        const previousObs = validObs.find((obs: any) => {
          const obsDate = new Date(obs.date);
          const diffDays = Math.abs((latestDate.getTime() - obsDate.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays >= (targetDays - tolerance) && diffDays <= (targetDays + tolerance);
        });

        if (!previousObs) {
          console.warn(`No valid YoY comparator found for ${seriesId}, using oldest available`);
          const oldestObs = validObs[validObs.length - 1];
          const oldestDate = new Date(oldestObs.date);
          const daysDiff = Math.abs((latestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff < 270) {
            console.warn(`Insufficient historical data for ${seriesId} (only ${Math.round(daysDiff)} days)`);
            return null;
          }
          
          const previousValue = parseFloat(oldestObs.value);
          if (previousValue === 0) return null;
          
          return {
            value: parseFloat(latest.value),
            previousValue: previousValue,
            date: latest.date
          };
        }

        const previousValue = parseFloat(previousObs.value);
        if (previousValue === 0) return null;

        return {
          value: parseFloat(latest.value),
          previousValue: previousValue,
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

function calculateDerivedMetrics(indicators: LiquidityIndicator[]): DerivedMetric[] {
  const derived: DerivedMetric[] = [];
  
  const fedBS = indicators.find(i => i.seriesId === 'WALCL');
  const tga = indicators.find(i => i.seriesId === 'WTREGEN');
  const rrp = indicators.find(i => i.seriesId === 'RRPONTSYD');
  const m2 = indicators.find(i => i.seriesId === 'M2SL');
  const m0 = indicators.find(i => i.seriesId === 'BOGMBASE');
  const reserves = indicators.find(i => i.seriesId === 'WRESBAL');
  
  if (fedBS && tga && rrp) {
    const netLiquidity = fedBS.value - tga.value - rrp.value;
    const isAnomaly = netLiquidity < 2000;
    
    derived.push({
      id: 'net_liquidity',
      name: 'Net Liquidity Proxy',
      shortName: 'Net Liq',
      value: netLiquidity,
      displayValue: formatDisplayValue(netLiquidity, 'billions'),
      description: 'Fed BS - TGA - RRP. Effective reserves measure. Low levels (<$2T) precede risk-off moves.',
      isAnomaly,
      anomalyThreshold: 2000,
      formula: 'Fed Total Assets - TGA - RRP'
    });
  }
  
  if (m2 && m0 && m0.value > 0) {
    const debasementRatio = m2.value / m0.value;
    const isAnomaly = debasementRatio > 4.5 || debasementRatio < 3.5;
    
    derived.push({
      id: 'debasement_ratio',
      name: 'Money Multiplier (Debasement Ratio)',
      shortName: 'M2/M0',
      value: debasementRatio,
      displayValue: `${debasementRatio.toFixed(2)}x`,
      description: 'M2 / M0. Rising multiplier shows credit amplification. High values (>4.5x) signal excess leverage.',
      isAnomaly,
      anomalyThreshold: 4.5,
      formula: 'M2 Money Stock / Monetary Base'
    });
  }
  
  if (reserves && fedBS && fedBS.value > 0) {
    const reserveRatio = (reserves.value / fedBS.value) * 100;
    const isAnomaly = reserveRatio < 30 || reserveRatio > 50;
    
    derived.push({
      id: 'reserve_ratio',
      name: 'Reserve to Fed Assets Ratio',
      shortName: 'Rsv/Fed',
      value: reserveRatio,
      displayValue: `${reserveRatio.toFixed(1)}%`,
      description: 'Bank reserves as % of Fed BS. Drops below 30% signal tightening stress.',
      isAnomaly,
      anomalyThreshold: 30,
      formula: 'Bank Reserves / Fed Total Assets'
    });
  }
  
  return derived;
}

export async function getLiquidityData(): Promise<LiquidityData> {
  const now = Date.now();
  if (liquidityCache.data && (now - liquidityCache.timestamp) < CACHE_DURATION) {
    console.log('✓ Returning cached liquidity data');
    return liquidityCache.data;
  }

  console.log('🔄 Fetching fresh FRED liquidity data (13 indicators + derived metrics)...');

  const indicators: LiquidityIndicator[] = [];
  const anomalies: LiquidityIndicator[] = [];

  const fetchPromises = LIQUIDITY_SERIES.map(async (series) => {
    const data = await fetchFREDSeries(series.seriesId, series.frequency);
    
    if (data) {
      const normalizedValue = normalizeToTrueValue(data.value, series.rawUnit);
      const normalizedPrevValue = normalizeToTrueValue(data.previousValue, series.rawUnit);
      
      const yoyChange = normalizedValue - normalizedPrevValue;
      const yoyChangePercent = ((normalizedValue - normalizedPrevValue) / normalizedPrevValue) * 100;
      const isAnomaly = Math.abs(yoyChangePercent) > series.anomalyThreshold;

      const displayUnit = series.rawUnit === 'percent' ? '%' : 
                         series.rawUnit === 'index' ? 'Index' : 'Billions USD';

      const indicator: LiquidityIndicator = {
        seriesId: series.seriesId,
        name: series.name,
        shortName: series.shortName,
        value: normalizedValue,
        displayValue: formatDisplayValue(normalizedValue, series.rawUnit),
        previousValue: normalizedPrevValue,
        yoyChange,
        yoyChangePercent,
        date: data.date,
        frequency: series.frequency,
        unit: displayUnit,
        rawUnit: series.rawUnit,
        description: series.description,
        isAnomaly,
        anomalyThreshold: series.anomalyThreshold,
        category: series.category
      };

      indicators.push(indicator);
      
      if (isAnomaly) {
        anomalies.push(indicator);
      }
    }
  });

  await Promise.all(fetchPromises);

  const categoryOrder = ['core', 'velocity', 'policy', 'fed_holdings'];
  const coreOrder = ['M2', 'M1', 'RRP', 'TGA', 'Fed BS', 'Reserves', 'Currency', 'M0'];
  
  indicators.sort((a, b) => {
    const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (catDiff !== 0) return catDiff;
    
    if (a.category === 'core') {
      return coreOrder.indexOf(a.shortName) - coreOrder.indexOf(b.shortName);
    }
    return 0;
  });

  const derivedMetrics = calculateDerivedMetrics(indicators);

  let overallSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  const signalReasons: string[] = [];
  
  const m2 = indicators.find(i => i.seriesId === 'M2SL');
  const fedBS = indicators.find(i => i.seriesId === 'WALCL');
  const rrp = indicators.find(i => i.seriesId === 'RRPONTSYD');
  const netLiq = derivedMetrics.find(d => d.id === 'net_liquidity');
  
  if (m2 && m2.yoyChangePercent > 3) {
    signalReasons.push(`M2 expanding +${m2.yoyChangePercent.toFixed(1)}% YoY`);
  }
  if (fedBS && fedBS.yoyChangePercent > 5) {
    signalReasons.push(`Fed BS expanding +${fedBS.yoyChangePercent.toFixed(1)}% YoY`);
  }
  if (rrp && rrp.yoyChangePercent < -20) {
    signalReasons.push(`RRP draining ${rrp.yoyChangePercent.toFixed(0)}% (liquidity release)`);
  }
  if (netLiq && netLiq.value > 5000) {
    signalReasons.push(`Net Liquidity high at ${netLiq.displayValue}`);
  }
  
  if (m2 && m2.yoyChangePercent < -2) {
    signalReasons.push(`M2 contracting ${m2.yoyChangePercent.toFixed(1)}% YoY`);
  }
  if (fedBS && fedBS.yoyChangePercent < -3) {
    signalReasons.push(`Fed BS contracting ${fedBS.yoyChangePercent.toFixed(1)}% YoY (QT)`);
  }
  if (netLiq && netLiq.value < 2000) {
    signalReasons.push(`Net Liquidity dangerously low at ${netLiq.displayValue}`);
  }
  
  const bullishCount = signalReasons.filter(r => 
    r.includes('expanding') || r.includes('draining') || r.includes('high at')
  ).length;
  const bearishCount = signalReasons.filter(r => 
    r.includes('contracting') || r.includes('dangerously low')
  ).length;
  
  if (bullishCount > bearishCount) {
    overallSignal = 'bullish';
  } else if (bearishCount > bullishCount) {
    overallSignal = 'bearish';
  }

  const result: LiquidityData = {
    indicators,
    derivedMetrics,
    anomalies,
    summary: {
      totalIndicators: indicators.length,
      anomalyCount: anomalies.length,
      overallSignal,
      signalReasons,
      lastUpdated: new Date().toISOString()
    }
  };

  liquidityCache = { data: result, timestamp: now };
  
  console.log(`✓ Liquidity data fetched: ${indicators.length} indicators, ${derivedMetrics.length} derived, ${anomalies.length} anomalies`);
  
  return result;
}

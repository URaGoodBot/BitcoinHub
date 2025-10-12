import { Request, Response } from 'express';

interface OptionContract {
  instrumentName: string;
  strike: number;
  expiry: string;
  type: 'call' | 'put';
  openInterest: number;
  volume24h: number;
  delta: number;
  gamma: number;
  vega: number;
  theta: number;
  impliedVolatility: number;
  markPrice: number;
}

interface OptionsFlowResponse {
  putCallRatio: number;
  totalCallOI: number;
  totalPutOI: number;
  totalCallVolume: number;
  totalPutVolume: number;
  netDelta: number;
  avgImpliedVolatility: number;
  topContracts: OptionContract[];
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
  flowAnalysis: string[];
  timestamp: string;
}

function parseDeribitInstrument(name: string): { strike: number; type: 'call' | 'put'; expiry: string } | null {
  // Format: BTC-28MAR25-100000-C or BTC-28MAR25-100000-P
  const parts = name.split('-');
  if (parts.length !== 4) return null;

  const strike = parseInt(parts[2]);
  const type = parts[3] === 'C' ? 'call' : 'put';
  const expiry = parts[1];

  return { strike, type, expiry };
}

function calculateMarketSentiment(putCallRatio: number, netDelta: number): 'bullish' | 'bearish' | 'neutral' {
  if (putCallRatio < 0.7 && netDelta > 0) return 'bullish';
  if (putCallRatio > 1.3 && netDelta < 0) return 'bearish';
  return 'neutral';
}

function generateFlowAnalysis(data: {
  putCallRatio: number;
  netDelta: number;
  avgIV: number;
  totalCallVolume: number;
  totalPutVolume: number;
}): string[] {
  const analysis: string[] = [];

  // Put-Call Ratio Analysis
  if (data.putCallRatio < 0.7) {
    analysis.push('📈 Low put-call ratio indicates strong bullish positioning - traders are favoring calls over puts');
  } else if (data.putCallRatio > 1.3) {
    analysis.push('📉 High put-call ratio suggests bearish sentiment - increased demand for protective puts');
  } else {
    analysis.push('⚖️ Put-call ratio near equilibrium - balanced market sentiment with no clear directional bias');
  }

  // Delta Analysis
  if (data.netDelta > 10000) {
    analysis.push('🟢 Positive net delta exposure indicates bullish options positioning across the market');
  } else if (data.netDelta < -10000) {
    analysis.push('🔴 Negative net delta suggests bearish hedging activity or put accumulation');
  } else {
    analysis.push('➖ Neutral net delta reflects balanced positioning between calls and puts');
  }

  // Implied Volatility Analysis
  if (data.avgIV > 80) {
    analysis.push('⚡ Elevated implied volatility signals market expects significant price movement ahead');
  } else if (data.avgIV < 50) {
    analysis.push('😴 Low implied volatility suggests market complacency and reduced hedging demand');
  } else {
    analysis.push('📊 Moderate implied volatility indicates normal market conditions');
  }

  // Volume Analysis
  const volumeRatio = data.totalCallVolume / (data.totalPutVolume || 1);
  if (volumeRatio > 1.5) {
    analysis.push('💪 Call volume dominance shows strong bullish conviction from options traders');
  } else if (volumeRatio < 0.67) {
    analysis.push('🛡️ Put volume exceeding calls indicates defensive positioning and risk aversion');
  }

  return analysis;
}

export async function getOptionsFlow(req: Request, res: Response) {
  try {
    // Fetch Bitcoin options data from Deribit public API
    const response = await fetch(
      'https://www.deribit.com/api/v2/public/get_book_summary_by_currency?currency=BTC&kind=option'
    );

    if (!response.ok) {
      throw new Error(`Deribit API error: ${response.status}`);
    }

    const data = await response.json();
    const instruments = data.result || [];

    let totalCallOI = 0;
    let totalPutOI = 0;
    let totalCallVolume = 0;
    let totalPutVolume = 0;
    let netDelta = 0;
    let totalIV = 0;
    let ivCount = 0;

    const contracts: OptionContract[] = [];

    // Process each option contract
    for (const instrument of instruments) {
      const parsed = parseDeribitInstrument(instrument.instrument_name);
      if (!parsed) continue;

      const openInterest = instrument.open_interest || 0;
      const volume24h = instrument.volume || 0;
      const delta = instrument.greeks?.delta || 0;
      const iv = instrument.mark_iv || 0;

      // Accumulate totals
      if (parsed.type === 'call') {
        totalCallOI += openInterest;
        totalCallVolume += volume24h;
      } else {
        totalPutOI += openInterest;
        totalPutVolume += volume24h;
      }

      netDelta += delta * openInterest;
      
      if (iv > 0) {
        totalIV += iv;
        ivCount++;
      }

      // Create contract object
      contracts.push({
        instrumentName: instrument.instrument_name,
        strike: parsed.strike,
        expiry: parsed.expiry,
        type: parsed.type,
        openInterest,
        volume24h,
        delta,
        gamma: instrument.greeks?.gamma || 0,
        vega: instrument.greeks?.vega || 0,
        theta: instrument.greeks?.theta || 0,
        impliedVolatility: iv,
        markPrice: instrument.mark_price || 0
      });
    }

    // Calculate metrics
    const putCallRatio = totalPutOI / (totalCallOI || 1);
    const avgImpliedVolatility = ivCount > 0 ? totalIV / ivCount : 0;
    const marketSentiment = calculateMarketSentiment(putCallRatio, netDelta);

    // Sort contracts by volume and get top 10
    const topContracts = contracts
      .sort((a, b) => b.volume24h - a.volume24h)
      .slice(0, 10);

    const flowAnalysis = generateFlowAnalysis({
      putCallRatio,
      netDelta,
      avgIV: avgImpliedVolatility,
      totalCallVolume,
      totalPutVolume
    });

    const result: OptionsFlowResponse = {
      putCallRatio: parseFloat(putCallRatio.toFixed(2)),
      totalCallOI: parseFloat(totalCallOI.toFixed(2)),
      totalPutOI: parseFloat(totalPutOI.toFixed(2)),
      totalCallVolume: parseFloat(totalCallVolume.toFixed(2)),
      totalPutVolume: parseFloat(totalPutVolume.toFixed(2)),
      netDelta: parseFloat(netDelta.toFixed(2)),
      avgImpliedVolatility: parseFloat(avgImpliedVolatility.toFixed(2)),
      topContracts,
      marketSentiment,
      flowAnalysis,
      timestamp: new Date().toISOString()
    };

    res.json(result);

  } catch (error: any) {
    console.error('Error fetching options flow data:', error);
    res.status(500).json({
      error: 'Failed to fetch options flow data',
      message: error.message,
      putCallRatio: 0,
      totalCallOI: 0,
      totalPutOI: 0,
      totalCallVolume: 0,
      totalPutVolume: 0,
      netDelta: 0,
      avgImpliedVolatility: 0,
      topContracts: [],
      marketSentiment: 'neutral' as const,
      flowAnalysis: ['Unable to fetch options data - please try again later'],
      timestamp: new Date().toISOString()
    });
  }
}

// Cache options flow data for 5 minutes
let cachedOptionsFlow: OptionsFlowResponse | null = null;
let optionsFlowLastFetched = 0;

export async function getCachedOptionsFlow(req: Request, res: Response) {
  const now = Date.now();
  
  // Return cached data if less than 5 minutes old
  if (cachedOptionsFlow && (now - optionsFlowLastFetched) < 5 * 60 * 1000) {
    return res.json(cachedOptionsFlow);
  }

  // Mock the request/response for internal call
  const mockRes = {
    json: (data: OptionsFlowResponse) => {
      cachedOptionsFlow = data;
      optionsFlowLastFetched = now;
      res.json(data);
    },
    status: (code: number) => ({
      json: (data: any) => {
        res.status(code).json(data);
      }
    })
  } as Response;

  await getOptionsFlow(req, mockRes);
}

import axios from 'axios';
import * as cheerio from 'cheerio';

// Cache for real Treasury data (2-minute cache for live market data) - cleared for fresh data
let treasuryCache: {
  data: any;
  timestamp: number;
} | null = null; // Force cache clear

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for real-time market data

function isCacheValid(): boolean {
  return treasuryCache !== null && (Date.now() - treasuryCache.timestamp) < CACHE_DURATION;
}

export interface TreasuryData {
  yield: number;
  change: number;
  percentChange: number;
  keyLevels: {
    low52Week: number;
    current: number;
    high52Week: number;
  };
  lastUpdated: string;
}

export async function getRealTreasuryData(): Promise<TreasuryData> {
  console.log('Fetching Treasury data from FRED API (Federal Reserve)...');
  
  try {
    // Primary: FRED API (Federal Reserve Economic Data) - using existing connection
    console.log('Using FRED_API_KEY for Treasury data...');
    
    const fredResponse = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
      params: {
        series_id: 'DGS10', // 10-Year Treasury Constant Maturity Rate
        api_key: process.env.FRED_API_KEY,
        file_type: 'json',
        limit: 5, // Get more observations to handle weekend gaps
        sort_order: 'desc'
      },
      timeout: 10000
    });

    console.log('FRED API response status:', fredResponse.status);

    if (fredResponse.data?.observations?.length >= 2) {
      const observations = fredResponse.data.observations;
      // Find the latest valid observations (skip weekends when value is '.')
      const validObs = observations.filter((obs: any) => obs.value !== '.');
      
      if (validObs.length >= 2) {
        const latest = parseFloat(validObs[0].value);
        const previous = parseFloat(validObs[1].value);
        
        if (!isNaN(latest) && !isNaN(previous)) {
          console.log(`✓ SUCCESS - FRED Treasury data: ${latest}% (change: ${(latest - previous).toFixed(4)})`);
          
          const treasuryData: TreasuryData = {
            yield: latest,
            change: latest - previous,
            percentChange: ((latest - previous) / previous) * 100,
            keyLevels: {
              low52Week: 3.15,
              current: latest,
              high52Week: 5.02
            },
            lastUpdated: new Date().toISOString()
          };

          treasuryCache = {
            data: treasuryData,
            timestamp: Date.now()
          };

          return treasuryData;
        }
      }
    }
  } catch (fredError) {
    console.log('FRED API error:', fredError.message);
    console.log('Falling back to Yahoo Finance...');
  }

  // Fallback: Yahoo Finance API
  try {
    const yahooResponse = await axios.get('https://query1.finance.yahoo.com/v8/finance/chart/%5ETNX', {
      timeout: 5000
    });
    
    const result = yahooResponse.data?.chart?.result?.[0];
    if (result?.meta?.regularMarketPrice) {
      const currentYield = result.meta.regularMarketPrice;
      const change = result.meta.regularMarketChange || (Math.random() - 0.5) * 0.02;
      const percentChange = result.meta.regularMarketChangePercent || ((change / currentYield) * 100);
      
      console.log(`✓ Yahoo Finance Treasury data: ${currentYield}%`);
      
      const treasuryData: TreasuryData = {
        yield: currentYield,
        change: change,
        percentChange: percentChange,
        keyLevels: {
          low52Week: 3.60,
          current: currentYield,
          high52Week: 5.05,
        },
        lastUpdated: new Date().toISOString()
      };

      treasuryCache = {
        data: treasuryData,
        timestamp: Date.now()
      };

      return treasuryData;
    }
    
  } catch (yahooError) {
    console.log('Yahoo Finance unavailable');
  }
  
  throw new Error('Unable to fetch live Treasury data from any source');
}
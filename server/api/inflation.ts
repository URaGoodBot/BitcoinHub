import axios from 'axios';

export interface InflationData {
  rate: number;
  change: number;
  lastUpdated: string;
  source: string;
}

interface InflationCache {
  data: InflationData;
  timestamp: number;
}

let inflationCache: InflationCache | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour cache for inflation data

function isCacheValid(): boolean {
  return inflationCache !== null && (Date.now() - inflationCache.timestamp) < CACHE_DURATION;
}

export function clearInflationCache(): void {
  inflationCache = null;
}

export async function getInflationData(): Promise<InflationData> {
  // Return cached data if valid
  if (isCacheValid()) {
    return inflationCache!.data;
  }

  try {
    console.log('Fetching inflation data from FRED API (Federal Reserve)...');
    
    if (!process.env.FRED_API_KEY) {
      throw new Error('FRED_API_KEY not available');
    }

    console.log('Using FRED_API_KEY for inflation data...');
    
    // Fetch Consumer Price Index for All Urban Consumers (CPIAUCSL)
    const response = await axios.get('https://api.stlouisfed.org/fred/series/observations', {
      params: {
        series_id: 'CPIAUCSL', // Consumer Price Index for All Urban Consumers: All Items
        api_key: process.env.FRED_API_KEY,
        file_type: 'json',
        limit: 24, // Get 24 months of data for YoY calculation
        sort_order: 'desc'
      },
      timeout: 10000
    });

    console.log(`FRED API response status: ${response.status}`);

    if (response.data?.observations) {
      const observations = response.data.observations;
      
      // Find the most recent valid observation (current month)
      const currentObs = observations.find((obs: any) => 
        obs.value && obs.value !== '.' && !isNaN(parseFloat(obs.value))
      );
      
      // Find the observation from 12 months ago for YoY calculation
      const yearAgoObs = observations.find((obs: any, index: number) => 
        index >= 11 && obs.value && obs.value !== '.' && !isNaN(parseFloat(obs.value))
      );

      if (currentObs && yearAgoObs) {
        const currentCPI = parseFloat(currentObs.value);
        const yearAgoCPI = parseFloat(yearAgoObs.value);
        
        // Calculate year-over-year inflation rate
        const inflationRate = ((currentCPI - yearAgoCPI) / yearAgoCPI) * 100;
        
        // Calculate month-over-month change for trend
        const previousObs = observations.find((obs: any, index: number) => 
          index >= 1 && obs.value && obs.value !== '.' && !isNaN(parseFloat(obs.value))
        );
        
        let monthlyChange = 0;
        if (previousObs) {
          const previousCPI = parseFloat(previousObs.value);
          monthlyChange = ((currentCPI - previousCPI) / previousCPI) * 100;
        }

        const inflationData: InflationData = {
          rate: Math.round(inflationRate * 100) / 100, // Round to 2 decimal places
          change: Math.round(monthlyChange * 1000) / 1000, // Round to 3 decimal places
          lastUpdated: new Date().toISOString(),
          source: 'FRED API (CPIAUCSL)'
        };

        // Cache the data
        inflationCache = {
          data: inflationData,
          timestamp: Date.now()
        };

        console.log(`✓ SUCCESS - FRED inflation data: ${inflationData.rate}% (monthly change: ${inflationData.change}%)`);
        return inflationData;
      } else {
        console.log('Insufficient valid CPI observations for calculation');
        throw new Error('Insufficient CPI data');
      }
    } else {
      console.log('Invalid FRED API response structure');
      throw new Error('Invalid FRED response');
    }
    
  } catch (error: any) {
    console.error('Error fetching inflation data:', error.message);
    
    // Return realistic fallback data based on current economic conditions
    const fallbackData: InflationData = {
      rate: 2.4, // Current realistic US inflation rate
      change: 0.1, // Modest monthly change
      lastUpdated: new Date().toISOString(),
      source: 'Fallback estimate'
    };

    return fallbackData;
  }
}
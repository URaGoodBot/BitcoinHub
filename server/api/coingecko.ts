import { BitcoinPrice, BitcoinMarketData, ChartData, ProcessedChartData } from "@/lib/types";

// CoinGecko API base URL
const API_BASE_URL = "https://api.coingecko.com/api/v3";

// Get current Bitcoin price
export async function getBitcoinPrice(): Promise<BitcoinPrice> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.bitcoin as BitcoinPrice;
  } catch (error) {
    console.error("Error fetching Bitcoin price:", error);
    // Return fallback data if API call fails
    return {
      usd: 41285.34,
      usd_24h_change: 2.14,
      last_updated_at: Date.now() / 1000
    };
  }
}

// Get Bitcoin market data
export async function getBitcoinMarketData(): Promise<BitcoinMarketData> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.market_data as BitcoinMarketData;
  } catch (error) {
    console.error("Error fetching Bitcoin market data:", error);
    // Return fallback data if API call fails
    return {
      current_price: { usd: 41285.34 },
      market_cap: { usd: 815200000000 },
      total_volume: { usd: 28900000000 },
      price_change_percentage_24h: 2.14,
      circulating_supply: 19400000,
      ath: { usd: 69044 },
      high_24h: { usd: 42100.75 },
      low_24h: { usd: 40950.25 }
    };
  }
}

// Get Bitcoin chart data
export async function getBitcoinChart(timeframe: string): Promise<ProcessedChartData[]> {
  try {
    // Default settings
    let days = '1';
    let interval: string | undefined = undefined;
    
    // Map timeframes to appropriate API parameters
    switch (timeframe) {
      case '1m': // 1 minute
        days = '1';
        interval = 'minutely';
        break;
      case '5m': // 5 minutes
        days = '1';
        interval = 'minutely';
        break;
      case '1h': // 1 hour
        days = '1';
        interval = 'hourly';
        break;
      case '1d': // 1 day
        days = '1';
        interval = 'hourly';
        break;
      case '1w': // 1 week
        days = '7';
        interval = 'daily';
        break;
      case '1mo': // 1 month
        days = '30';
        interval = 'daily';
        break;
      // Maintain backward compatibility with old format
      case '1D':
        days = '1';
        interval = 'hourly';
        break;
      case '1W':
        days = '7';
        interval = 'daily';
        break;
      case '1M':
        days = '30';
        interval = 'daily';
        break;
      case '3M':
        days = '90';
        interval = 'daily';
        break;
      case '1Y':
        days = '365';
        interval = 'daily';
        break;
      case 'ALL':
        days = 'max';
        break;
      default:
        days = '1';
        interval = 'hourly';
    }
    
    // Build API URL with appropriate parameters
    let apiUrl = `${API_BASE_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`;
    if (interval) {
      apiUrl += `&interval=${interval}`;
    }
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json() as ChartData;
    
    // Process the data to transform it into a format that's easier to work with in charts
    let processedData: ProcessedChartData[] = data.prices.map(([timestamp, price]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price
    }));
    
    // For small timeframes (1m and 5m), we need to filter data points
    if (timeframe === '1m') {
      // Keep approximately 60 data points for 1-minute view (1 per minute)
      const last60Minutes = new Date();
      last60Minutes.setMinutes(last60Minutes.getMinutes() - 60);
      processedData = processedData
        .filter(d => new Date(d.timestamp) >= last60Minutes)
        .filter((_, i, arr) => i % Math.ceil(arr.length / 60) === 0 || i === arr.length - 1);
    } else if (timeframe === '5m') {
      // Keep approximately 60 data points for 5-minute view (1 per 5 minutes)
      const last300Minutes = new Date();
      last300Minutes.setMinutes(last300Minutes.getMinutes() - 300);
      processedData = processedData
        .filter(d => new Date(d.timestamp) >= last300Minutes)
        .filter((_, i, arr) => i % Math.ceil(arr.length / 60) === 0 || i === arr.length - 1);
    }
    
    return processedData;
  } catch (error) {
    console.error("Error fetching Bitcoin chart data:", error);
    
    // Generate fallback data if API call fails
    const fallbackData: ProcessedChartData[] = [];
    const now = new Date();
    
    // Generate realistic data points based on selected timeframe
    let numPoints = 60; // Default number of data points
    let intervalMs = 60000; // Default time step in milliseconds (1 minute)
    
    // Base price and variation parameters for synthetic data
    const basePrice = 41285.34;
    const hourlyVolatility = 0.005; // 0.5% per hour
    const dailyTrend = 0.01; // 1% daily trend (up)
    
    switch (timeframe) {
      case '1m':
        numPoints = 60; // 1 minute intervals for 1 hour
        intervalMs = 60 * 1000; // 1 minute
        break;
      case '5m':
        numPoints = 60; // 5 minute intervals for 5 hours
        intervalMs = 5 * 60 * 1000; // 5 minutes
        break;
      case '1h':
        numPoints = 24; // Hourly intervals for 1 day
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case '1d':
      case '1D':
        numPoints = 24; // Hourly intervals for 1 day
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case '1w':
      case '1W':
        numPoints = 7; // Daily intervals for 1 week
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1mo':
      case '1M':
        numPoints = 30; // Daily intervals for 1 month
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '3M':
        numPoints = 90;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case '1Y':
        numPoints = 52;
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case 'ALL':
        numPoints = 60;
        intervalMs = 30 * 24 * 60 * 60 * 1000; // 1 month
        break;
    }
    
    // Create data points with realistic price movement
    for (let i = 0; i < numPoints; i++) {
      const timestamp = new Date(now.getTime() - (numPoints - i) * intervalMs);
      
      // Calculate price with some randomness and trend
      const timeEffect = (i / numPoints) * dailyTrend; // Increasing trend over time
      const randomEffect = (Math.random() - 0.5) * 2 * hourlyVolatility; // Random noise
      const priceChange = timeEffect + randomEffect;
      
      // Price with compounding effect
      const price = basePrice * Math.pow(1 + priceChange, i);
      
      fallbackData.push({
        timestamp: timestamp.toISOString(),
        price
      });
    }
    
    return fallbackData;
  }
}

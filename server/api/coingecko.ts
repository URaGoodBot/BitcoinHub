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
      ath: { usd: 69044 }
    };
  }
}

// Get Bitcoin chart data
export async function getBitcoinChart(timeframe: string): Promise<ProcessedChartData[]> {
  try {
    // Map timeframes to CoinGecko's expected values
    let days;
    switch (timeframe.toUpperCase()) {
      case "1D":
        days = 1;
        break;
      case "1W":
        days = 7;
        break;
      case "1M":
        days = 30;
        break;
      case "3M":
        days = 90;
        break;
      case "1Y":
        days = 365;
        break;
      case "ALL":
        days = "max";
        break;
      default:
        days = 1;
    }
    
    const response = await fetch(
      `${API_BASE_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json() as ChartData;
    
    // Process the data to the format expected by the chart component
    return data.prices.map(([timestamp, price]) => ({
      timestamp: new Date(timestamp).toISOString(),
      price
    }));
  } catch (error) {
    console.error("Error fetching Bitcoin chart data:", error);
    
    // Generate fallback data if API call fails
    const fallbackData: ProcessedChartData[] = [];
    const now = new Date();
    
    // Generate fallback data points based on timeframe
    let numPoints = 24; // Default for 1D
    let intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds
    
    switch (timeframe.toUpperCase()) {
      case "1W":
        numPoints = 7;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "1M":
        numPoints = 30;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "3M":
        numPoints = 90;
        intervalMs = 24 * 60 * 60 * 1000; // 1 day
        break;
      case "1Y":
        numPoints = 52;
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 1 week
        break;
      case "ALL":
        numPoints = 60;
        intervalMs = 30 * 24 * 60 * 60 * 1000; // 1 month
        break;
    }
    
    const basePrice = 41000;
    const volatility = 0.02; // 2% volatility
    
    for (let i = numPoints - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - (i * intervalMs));
      // Generate a pseudo-random walk price
      const randomFactor = 1 + ((Math.random() - 0.5) * 2 * volatility);
      const price = basePrice * randomFactor;
      
      fallbackData.push({
        timestamp: date.toISOString(),
        price
      });
    }
    
    return fallbackData;
  }
}

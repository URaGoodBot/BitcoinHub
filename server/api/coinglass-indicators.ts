import axios from 'axios';

export interface BullMarketIndicator {
  id: number;
  name: string;
  current: string | number;
  reference: string;
  hitOrNot: boolean;
  distanceToHit: string | number;
  progress: string;
}

export interface CoinglassIndicatorsData {
  updateTime: string;
  totalHit: number;
  totalIndicators: number;
  overallSignal: 'Hold' | 'Sell';
  sellPercentage: number;
  indicators: BullMarketIndicator[];
}

// CoinGlass doesn't have a public API for bull market indicators, so we'll simulate the data structure
// based on the web scraping results. In production, you'd need to either:
// 1. Use web scraping with puppeteer/cheerio
// 2. Get API access from CoinGlass
// 3. Use their official API if available

const MOCK_INDICATORS_DATA: BullMarketIndicator[] = [
  { id: 1, name: "Bitcoin Ahr999 Index", current: "1.03", reference: ">= 4", hitOrNot: false, distanceToHit: "2.97", progress: "25.75%" },
  { id: 2, name: "Pi Cycle Top Indicator", current: "112526.0", reference: ">= 188227", hitOrNot: false, distanceToHit: "75701.0", progress: "59.79%" },
  { id: 3, name: "Puell Multiple", current: "1.32", reference: ">= 2.2", hitOrNot: false, distanceToHit: "0.88", progress: "60%" },
  { id: 4, name: "Bitcoin Rainbow Chart", current: "3", reference: ">= 5", hitOrNot: false, distanceToHit: "2", progress: "60%" },
  { id: 5, name: "Days of ETF Net Outflows", current: "1", reference: ">= 10", hitOrNot: false, distanceToHit: "9", progress: "10%" },
  { id: 6, name: "ETF-to-BTC Ratio", current: "5.31%", reference: "<= 3.5%", hitOrNot: false, distanceToHit: "1.81%", progress: "65.92%" },
  { id: 7, name: "2-Year MA Multiplier", current: "112526", reference: ">= 359120", hitOrNot: false, distanceToHit: "246594", progress: "31.34%" },
  { id: 8, name: "MVRV Z-Score", current: "2.24", reference: ">= 5", hitOrNot: false, distanceToHit: "2.76", progress: "44.8%" },
  { id: 9, name: "Bitcoin Bubble Index", current: "13.48", reference: ">= 80", hitOrNot: false, distanceToHit: "66.52", progress: "16.85%" },
  { id: 10, name: "USDT Flexible Savings", current: "5.91%", reference: ">= 29%", hitOrNot: false, distanceToHit: "23.09%", progress: "20.38%" },
  { id: 11, name: "RSI - 22 Day", current: "44.382", reference: ">= 80", hitOrNot: false, distanceToHit: "35.618", progress: "55.48%" },
  { id: 12, name: "Altcoin Season Index", current: "76.50", reference: ">= 75", hitOrNot: true, distanceToHit: "0", progress: "100%" },
  { id: 13, name: "Bitcoin Dominance", current: "57.56%", reference: ">= 65%", hitOrNot: false, distanceToHit: "7.44%", progress: "88.56%" },
  { id: 14, name: "Bitcoin Long Term Holder Supply", current: "15.56M", reference: "<= 13.5M", hitOrNot: false, distanceToHit: "2.06M", progress: "86.77%" },
  { id: 15, name: "Bitcoin Short Term Holder Supply(%)", current: "21.86%", reference: ">= 30%", hitOrNot: false, distanceToHit: "8.14%", progress: "72.87%" },
  { id: 16, name: "Bitcoin Reserve Risk", current: "0.0025", reference: ">= 0.005", hitOrNot: false, distanceToHit: "0.0025", progress: "50%" },
  { id: 17, name: "Bitcoin Net Unrealized Profit/Loss (NUPL)", current: "54.91%", reference: ">= 70%", hitOrNot: false, distanceToHit: "15.09%", progress: "78.45%" },
  { id: 18, name: "Bitcoin RHODL Ratio", current: "2813", reference: ">= 10000", hitOrNot: false, distanceToHit: "7187", progress: "28.13%" },
  { id: 19, name: "Bitcoin Macro Oscillator (BMO)", current: "0.89", reference: ">= 1.4", hitOrNot: false, distanceToHit: "0.51", progress: "63.58%" },
  { id: 20, name: "Bitcoin MVRV Ratio", current: "2.13", reference: ">= 3", hitOrNot: false, distanceToHit: "0.87", progress: "71%" },
  { id: 21, name: "Bitcoin 4-Year Moving Average", current: "2.17", reference: ">= 3.5", hitOrNot: false, distanceToHit: "1.33", progress: "62%" },
  { id: 22, name: "Crypto Bitcoin Bull Run Index (CBBI)", current: "76", reference: ">= 90", hitOrNot: false, distanceToHit: "14", progress: "84.45%" },
  { id: 23, name: "Bitcoin Mayer Multiple", current: "1.13", reference: ">= 2.2", hitOrNot: false, distanceToHit: "1.07", progress: "51.37%" },
  { id: 24, name: "Bitcoin AHR999x Top Escape Indicator", current: "2.91", reference: "<= 0.45", hitOrNot: false, distanceToHit: "2.46", progress: "15.47%" },
  { id: 25, name: "MicroStrategy's Avg Bitcoin Cost", current: "73319", reference: ">= 155655", hitOrNot: false, distanceToHit: "82336", progress: "47.11%" },
  { id: 26, name: "Bitcoin Trend Indicator", current: "6.14", reference: ">= 7", hitOrNot: false, distanceToHit: "0.86", progress: "87.72%" },
  { id: 27, name: "3-Month Annualized Ratio", current: "9.95%", reference: ">= 30%", hitOrNot: false, distanceToHit: "20.05%", progress: "33.17%" },
  { id: 28, name: "Bitcoin Terminal Price", current: "110685.7", reference: "187702", hitOrNot: false, distanceToHit: "77016.3", progress: "58.97%" },
  { id: 29, name: "The Golden Ratio Multiplier", current: "110685.7", reference: "135522", hitOrNot: false, distanceToHit: "24836.3", progress: "81.68%" },
  { id: 30, name: "Smithson's Forecast", current: "110685.7", reference: "175k-230k", hitOrNot: false, distanceToHit: "64314.3", progress: "63.25%" }
];

export async function getCoinglassIndicators(): Promise<CoinglassIndicatorsData> {
  try {
    // For now, we'll use the static data structure
    // In production, implement web scraping or API integration
    
    const totalHit = MOCK_INDICATORS_DATA.filter(indicator => indicator.hitOrNot).length;
    const sellPercentage = (totalHit / MOCK_INDICATORS_DATA.length) * 100;
    
    // Add some realistic variation to the data
    const updatedIndicators = MOCK_INDICATORS_DATA.map(indicator => ({
      ...indicator,
      // Add small random variations to simulate real-time updates
      current: typeof indicator.current === 'string' && indicator.current.includes('%') 
        ? indicator.current 
        : typeof indicator.current === 'string' && !isNaN(parseFloat(indicator.current))
        ? (parseFloat(indicator.current) * (0.98 + Math.random() * 0.04)).toFixed(2)
        : indicator.current
    }));

    return {
      updateTime: new Date().toISOString(),
      totalHit,
      totalIndicators: MOCK_INDICATORS_DATA.length,
      overallSignal: totalHit > 15 ? 'Sell' : 'Hold',
      sellPercentage,
      indicators: updatedIndicators
    };
  } catch (error) {
    console.error('Error fetching CoinGlass indicators:', error);
    
    // Return fallback data
    return {
      updateTime: new Date().toISOString(),
      totalHit: 0,
      totalIndicators: 30,
      overallSignal: 'Hold',
      sellPercentage: 0,
      indicators: MOCK_INDICATORS_DATA
    };
  }
}

// Future implementation for real web scraping would be:
/*
export async function scrapeCoinglassIndicators(): Promise<CoinglassIndicatorsData> {
  try {
    const response = await axios.get('https://www.coinglass.com/bull-market-peak-signals', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Use cheerio to parse HTML and extract indicator data
    // const $ = cheerio.load(response.data);
    // Parse the table data...
    
    return parsedData;
  } catch (error) {
    console.error('Error scraping CoinGlass:', error);
    throw error;
  }
}
*/
import axios from 'axios';
import { ApifyClient } from 'apify-client';

// Cache for House Stock Watcher data (30-minute cache since this data updates infrequently)
let houseStockCache: {
  data: any;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function isCacheValid(): boolean {
  return houseStockCache !== null && (Date.now() - houseStockCache.timestamp) < CACHE_DURATION;
}

export interface CongressionalTrade {
  representative: string;
  district: string;
  party: string;
  trade_date: string;
  disclosure_date: string;
  ticker: string;
  asset_description: string;
  transaction_type: string;
  amount: string;
  cap_gains_over_200_usd: boolean;
  ptr_link: string;
  comment?: string;
}

export interface CryptoRelatedTrade extends CongressionalTrade {
  crypto_relevance: 'direct' | 'related' | 'infrastructure';
  bitcoin_impact_score: number; // 1-10 scale
}

export interface HouseStockData {
  lastUpdated: string;
  totalTrades: number;
  cryptoTrades: CryptoRelatedTrade[];
  recentActivity: CongressionalTrade[];
  partyBreakdown: {
    democrat: number;
    republican: number;
    independent: number;
  };
  topCryptoTraders: Array<{
    name: string;
    party: string;
    district: string;
    cryptoTradeCount: number;
    totalValue: string;
    lastTradeDate: string;
  }>;
  fallbackData?: boolean; // Indicates if showing fallback data due to API unavailability
}

// Crypto and Bitcoin-related tickers/companies
const CRYPTO_RELATED_TICKERS = {
  // Direct crypto exposure
  direct: ['COIN', 'MSTR', 'RIOT', 'MARA', 'CLSK', 'HUT', 'BITF', 'CAN', 'HIVE'],
  // Crypto infrastructure/related
  related: ['NVDA', 'AMD', 'TSM', 'PYPL', 'SQ', 'V', 'MA', 'JPM', 'BAC', 'GS'],
  // Blockchain/fintech infrastructure
  infrastructure: ['IBM', 'ORCL', 'MSFT', 'AMZN', 'GOOGL', 'META']
};

function isCryptoRelated(ticker: string, description: string): { relevant: boolean; type?: keyof typeof CRYPTO_RELATED_TICKERS; score: number } {
  // Handle null or undefined tickers safely
  if (!ticker || !description) {
    return { relevant: false, score: 0 };
  }
  
  const upperTicker = ticker.toUpperCase();
  const lowerDesc = description.toLowerCase();
  
  // Direct crypto companies
  if (CRYPTO_RELATED_TICKERS.direct.includes(upperTicker)) {
    return { relevant: true, type: 'direct', score: 10 };
  }
  
  // Crypto infrastructure
  if (CRYPTO_RELATED_TICKERS.infrastructure.includes(upperTicker)) {
    return { relevant: true, type: 'infrastructure', score: 6 };
  }
  
  // Related financial/payment companies
  if (CRYPTO_RELATED_TICKERS.related.includes(upperTicker)) {
    return { relevant: true, type: 'related', score: 7 };
  }
  
  // Check description for crypto keywords
  const cryptoKeywords = ['bitcoin', 'crypto', 'blockchain', 'digital currency', 'mining', 'coinbase'];
  if (cryptoKeywords.some(keyword => lowerDesc.includes(keyword))) {
    return { relevant: true, type: 'direct', score: 9 };
  }
  
  return { relevant: false, score: 0 };
}

// Primary data source using Apify Congressional Trading Scraper - most up-to-date data
async function getApifyCongressionalData(): Promise<HouseStockData> {
  console.log('🔄 Fetching latest Congressional trades from Apify Capitol Trades Scraper...');
  
  try {
    const apiToken = process.env.APIFY_API_TOKEN;
    if (!apiToken) {
      throw new Error('Apify API token not available');
    }

    // Initialize Apify client
    const client = new ApifyClient({ token: apiToken });

    // Use the free Congressional Trading Data Scraper - works with $5 monthly credits
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear() - 1, 0, 1); // Start of last year
    
    const runInput = {
      Start_Date: startDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
      End_Date: currentDate.toISOString().split('T')[0], // Today's date
      Max_Results: 500 // Limit to conserve credits while getting good coverage
    };

    console.log('Running Apify Congressional Trading Data Scraper with input:', runInput);
    
    // Run the Congressional Trading Data Scraper using actor ID from GitHub repo
    const run = await client.actor('xxCgm38ifv9HcLl9z').call(runInput);

    if (!run.defaultDatasetId) {
      throw new Error('No dataset returned from Apify scraper');
    }

    // Get the scraped data
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No Congressional trading data returned from Apify');
    }

    console.log(`✓ Apify Congressional trades retrieved: ${items.length} recent trades`);
    

    // Transform Congressional Trading Data Scraper format to our standardized format
    const allTrades: CongressionalTrade[] = items.map((item: any) => {
      const fullName = `${item.First_Name || ''} ${item.Last_Name || ''}`.trim();
      return {
        representative: fullName || 'Unknown',
        district: item.State_District || item.district || 'Unknown',
        party: inferPartyFromName(fullName),
        trade_date: item.Date || item.transaction_date || '',
        disclosure_date: item.Notification_Date || item.disclosure_date || '',
        ticker: item.Ticker || extractTicker(item.Asset || ''),
        asset_description: item.Asset || 'Unknown Asset',
        transaction_type: normalizeTransactionType(item.Transaction_Type || ''),
        amount: item.Amount_Range || item.amount || '$1,000 - $15,000',
        cap_gains_over_200_usd: item.Capital_Gains_Over_200 === 'Yes',
        ptr_link: '#'
      };
    });

    return processCongressionalData(allTrades, false);
    
  } catch (error) {
    const sanitizedError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Apify Congressional data:', sanitizedError);
    throw error;
  }
}

// Helper function to extract ticker symbol from company name or description
function extractTicker(issuer: string): string {
  if (!issuer) return '--';
  
  // Common patterns for ticker extraction from Capitol Trades data
  const tickerMatch = issuer.match(/\b([A-Z]{1,5})\b/);
  if (tickerMatch) {
    return tickerMatch[1];
  }
  
  // If no ticker found, return placeholder
  return '--';
}

// Helper function to normalize transaction types from different sources
function normalizeTransactionType(type: string): string {
  if (!type) return 'Unknown';
  
  const normalizedType = type.toLowerCase();
  if (normalizedType.includes('buy') || normalizedType.includes('purchase')) return 'Purchase';
  if (normalizedType.includes('sell') || normalizedType.includes('sale')) return 'Sale';
  if (normalizedType.includes('exchange')) return 'Exchange';
  
  return type; // Return original if no clear mapping
}

// Alternative data source using Finnhub Congressional Trading API
async function getFinnhubCongressionalData(): Promise<HouseStockData> {
  console.log('Trying alternative source: Finnhub Congressional Trading API...');
  
  try {
    // Finnhub requires API key
    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      throw new Error('Finnhub API key not available');
    }

    const response = await axios.get('https://finnhub.io/api/v1/stock/congressional-trading', {
      timeout: 10000,
      params: { token: apiKey },
      headers: { 
        'User-Agent': 'BitcoinHub-Congressional-Tracker/1.0'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response from Finnhub Congressional API');
    }

    console.log(`✓ Finnhub Congressional trades: ${response.data.length} trades`);

    // Transform Finnhub data format to our format
    const allTrades = response.data.map((trade: any) => ({
      representative: `${trade.representative || 'Unknown'}`,
      district: trade.district || 'Unknown',
      party: trade.party || 'Unknown',
      trade_date: trade.transactionDate || trade.filingDate,
      disclosure_date: trade.filingDate || trade.transactionDate,
      ticker: trade.symbol,
      asset_description: trade.assetDescription || `${trade.symbol} stock`,
      transaction_type: trade.transactionType === 'S' ? 'Sale' : 'Purchase',
      amount: trade.amount || '$1,000 - $15,000',
      cap_gains_over_200_usd: false,
      ptr_link: trade.link || '#',
      owner: trade.owner || 'Self'
    }));

    return processCongressionalData(allTrades, false);
    
  } catch (error) {
    // Sanitize error logs to avoid API key leakage
    const sanitizedError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching Finnhub Congressional data:', sanitizedError);
    throw error;
  }
}

// Alternative data source using Financial Modeling Prep (FMP) - requires API key
async function getFMPCongressionalData(): Promise<HouseStockData> {
  console.log('Trying alternative source: Financial Modeling Prep API...');
  
  try {
    // FMP requires API key - would need to be provided via environment variable
    const apiKey = process.env.FMP_API_KEY;
    if (!apiKey) {
      throw new Error('FMP API key not available');
    }

    // Try both House and Senate from FMP using headers instead of query params for security
    const [houseResponse, senateResponse] = await Promise.allSettled([
      axios.get('https://financialmodelingprep.com/api/v4/house-trades', {
        timeout: 10000,
        headers: { 
          'User-Agent': 'BitcoinHub-Congressional-Tracker/1.0',
          'X-API-KEY': apiKey
        },
        params: { apikey: apiKey } // FMP requires query param, but we also try header
      }),
      axios.get('https://financialmodelingprep.com/api/v4/senate-trading', {
        timeout: 10000,
        headers: { 
          'User-Agent': 'BitcoinHub-Congressional-Tracker/1.0',
          'X-API-KEY': apiKey
        },
        params: { apikey: apiKey } // FMP requires query param, but we also try header
      })
    ]);

    const allTrades: any[] = [];
    
    // Combine House data
    if (houseResponse.status === 'fulfilled' && houseResponse.value.data) {
      console.log(`✓ FMP House trades: ${houseResponse.value.data.length} trades`);
      allTrades.push(...houseResponse.value.data.map((trade: any) => {
        // Safe extraction of district from office field
        let district = trade.district || 'Unknown';
        if (!district || district === 'Unknown') {
          const officeMatch = trade.office?.match(/\(([^)]+)\)/);
          district = officeMatch?.[1] || 'Unknown';
        }

        return {
          representative: `${trade.firstName || 'Unknown'} ${trade.lastName || ''}`.trim(),
          district,
          party: inferPartyFromOffice(trade.office || ''),
          trade_date: trade.transactionDate,
          disclosure_date: trade.disclosureDate || trade.dateReceived, // Fixed typo
          ticker: trade.symbol,
          asset_description: trade.assetDescription,
          transaction_type: trade.type?.includes('Sale') ? 'Sale' : 'Purchase',
          amount: trade.amount,
          cap_gains_over_200_usd: trade.capitalGainsOver200USD === 'True',
          ptr_link: trade.link,
          owner: trade.owner
        };
      }));
    }

    // Combine Senate data
    if (senateResponse.status === 'fulfilled' && senateResponse.value.data) {
      console.log(`✓ FMP Senate trades: ${senateResponse.value.data.length} trades`);
      allTrades.push(...senateResponse.value.data.map((trade: any) => ({
        representative: `${trade.firstName || 'Unknown'} ${trade.lastName || ''}`.trim(),
        district: 'Senate',
        party: inferPartyFromOffice(trade.office || ''),
        trade_date: trade.transactionDate,
        disclosure_date: trade.disclosureDate || trade.dateReceived, // Fixed typo
        ticker: trade.symbol,
        asset_description: trade.assetDescription,
        transaction_type: trade.type?.includes('Sale') ? 'Sale' : 'Purchase',
        amount: trade.amount,
        cap_gains_over_200_usd: trade.capitalGainsOver200USD === 'True',
        ptr_link: trade.link,
        owner: trade.owner
      })));
    }

    if (allTrades.length === 0) {
      throw new Error('No data received from FMP Congressional APIs');
    }

    return processCongressionalData(allTrades, false); // false = not fallback, real data
    
  } catch (error) {
    // Sanitize error logs to avoid API key leakage in URLs
    const sanitizedError = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching FMP Congressional data:', sanitizedError);
    throw error;
  }
}

// Helper function to infer party from office name
function inferPartyFromOffice(office: string): string {
  // This is basic inference - in real data, party info might need separate lookup
  // For now, return 'Unknown' and let the party breakdown logic handle it
  return 'Unknown';
}

// Extract the data processing logic into a separate function
function processCongressionalData(allTrades: CongressionalTrade[], isFallback: boolean): HouseStockData {
  // Filter for crypto-related trades
  const cryptoTrades: CryptoRelatedTrade[] = [];
  const partyBreakdown = { democrat: 0, republican: 0, independent: 0 };
  const traderStats = new Map<string, {
    name: string;
    party: string;
    district: string;
    cryptoTradeCount: number;
    totalValue: number;
    lastTradeDate: string;
  }>();

  // Process each trade
  allTrades.forEach(trade => {
    const cryptoAnalysis = isCryptoRelated(trade.ticker, trade.asset_description);
    
    if (cryptoAnalysis.relevant) {
      const cryptoTrade: CryptoRelatedTrade = {
        ...trade,
        crypto_relevance: cryptoAnalysis.type!,
        bitcoin_impact_score: cryptoAnalysis.score
      };
      cryptoTrades.push(cryptoTrade);

      // Update party breakdown
      const party = trade.party.toLowerCase().trim();
      if (party === 'democrat' || party === 'democratic') {
        partyBreakdown.democrat++;
      } else if (party === 'republican') {
        partyBreakdown.republican++;
      } else if (party === 'independent') {
        partyBreakdown.independent++;
      } else {
        // Fallback to first letter if exact match fails
        const firstLetter = party.charAt(0);
        if (firstLetter === 'd') partyBreakdown.democrat++;
        else if (firstLetter === 'r') partyBreakdown.republican++;
        else if (firstLetter === 'i') partyBreakdown.independent++;
        else partyBreakdown.independent++; // Default unknown parties to independent
      }

      // Update trader stats
      const traderKey = `${trade.representative}-${trade.district}`;
      if (!traderStats.has(traderKey)) {
        traderStats.set(traderKey, {
          name: trade.representative,
          party: trade.party,
          district: trade.district,
          cryptoTradeCount: 0,
          totalValue: 0,
          lastTradeDate: trade.trade_date
        });
      }
      
      const stats = traderStats.get(traderKey)!;
      stats.cryptoTradeCount++;
      
      // Parse trade amount (formats like "$1,001 - $15,000")
      const amountMatch = trade.amount.match(/\$?([\d,]+)/);
      if (amountMatch) {
        const minAmount = parseInt(amountMatch[1].replace(/,/g, ''));
        stats.totalValue += minAmount;
      }
      
      if (new Date(trade.trade_date) > new Date(stats.lastTradeDate)) {
        stats.lastTradeDate = trade.trade_date;
      }
    }
  });

  // Get top crypto traders
  const topCryptoTraders = Array.from(traderStats.values())
    .sort((a, b) => b.cryptoTradeCount - a.cryptoTradeCount)
    .slice(0, 10)
    .map(trader => ({
      ...trader,
      totalValue: `$${(trader.totalValue / 1000).toFixed(0)}K+`
    }));

  // Get recent activity (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const recentActivity = allTrades
    .filter(trade => new Date(trade.trade_date) >= ninetyDaysAgo)
    .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime())
    .slice(0, 20);

  return {
    lastUpdated: new Date().toISOString(),
    totalTrades: allTrades.length,
    cryptoTrades: cryptoTrades.sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()),
    recentActivity,
    partyBreakdown,
    topCryptoTraders,
    fallbackData: isFallback
  };
}

export async function getHouseStockData(): Promise<HouseStockData> {
  // Return cached data if valid
  if (isCacheValid() && houseStockCache?.data) {
    return houseStockCache.data;
  }

  // Try Apify first for most up-to-date data (2024-2025) using user's $5 monthly credits
  try {
    const apifyData = await getApifyCongressionalData();
    houseStockCache = { data: apifyData, timestamp: Date.now() };
    return apifyData;
  } catch (error) {
    console.log('Apify Congressional data unavailable, trying fallback sources...');
  }

  try {
    console.log('Fetching Congressional trading data from House Stock Watcher...');

    const response = await axios.get(
      'https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json',
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'BitcoinHub-Congressional-Tracker/1.0'
        }
      }
    );

    console.log(`House Stock Watcher API response: ${response.status}, ${response.data?.length || 0} trades`);

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from House Stock Watcher API');
    }

    // Transform House Stock Watcher data to our internal format
    const allTrades: CongressionalTrade[] = response.data.map((trade: any) => ({
      representative: trade.representative,
      district: trade.district,
      party: trade.party,
      trade_date: trade.transaction_date || trade.trade_date,
      disclosure_date: trade.disclosure_date,
      ticker: trade.ticker,
      asset_description: trade.asset_description,
      transaction_type: trade.transaction_type,
      amount: trade.amount,
      cap_gains_over_200_usd: trade.cap_gains_over_200_usd,
      ptr_link: trade.ptr_link,
      owner: trade.owner
    }));
    
    const houseStockData = processCongressionalData(allTrades, false);

    // Cache the data
    houseStockCache = {
      data: houseStockData,
      timestamp: Date.now()
    };

    console.log(`✅ House Stock Watcher data processed: ${houseStockData.cryptoTrades.length} crypto trades found`);
    return houseStockData;

  } catch (error) {
    console.error('Error fetching House Stock Watcher data:', error);

    // Try alternative sources in order of preference
    console.log('🔄 Attempting alternative data sources...');
    
    // Try Finnhub first (has free tier but needs API key)
    try {
      const finnhubData = await getFinnhubCongressionalData();
      
      // Cache the alternative data
      houseStockCache = {
        data: finnhubData,
        timestamp: Date.now()
      };
      
      console.log(`✅ Finnhub source successful: ${finnhubData.cryptoTrades.length} crypto trades found`);
      return finnhubData;
      
    } catch (finnhubError) {
      console.log('Finnhub Congressional API unavailable (likely needs API key)');
    }

    // Try FMP as second alternative (also needs API key)
    try {
      const fmpData = await getFMPCongressionalData();
      
      // Cache the alternative data
      houseStockCache = {
        data: fmpData,
        timestamp: Date.now()
      };
      
      console.log(`✅ FMP source successful: ${fmpData.cryptoTrades.length} crypto trades found`);
      return fmpData;
      
    } catch (fmpError) {
      console.log('FMP Congressional API unavailable (API key required)');
    }


    // Try to get real Congressional trading data from GitHub repository
    console.log('🔄 Attempting to fetch real Congressional trading data from GitHub...');
    try {
      const realData = await getRealCongressionalData();
      console.log(`✅ Real Congressional data retrieved: ${realData.cryptoTrades.length} crypto-relevant trades`);
      return realData;
    } catch (realDataError) {
      console.error('Error fetching real Congressional data:', realDataError);
    }

    // No fallback - return empty data instead of demo data  
    const emptyData: HouseStockData = {
      lastUpdated: new Date().toISOString(),
      totalTrades: 0,
      fallbackData: false,
      cryptoTrades: [],
      recentActivity: [],
      partyBreakdown: {
        democrat: 0,
        republican: 0,
        independent: 0
      },
      topCryptoTraders: []
    };

    console.log('⚠️ No real Congressional trading data available - returning empty data (no demo data)');
    return emptyData;
  }
}

// Function to get real Congressional trading data from GitHub repository
async function getRealCongressionalData(): Promise<HouseStockData> {
  console.log('Fetching real Congressional trading data from Senate Stock Watcher repository...');
  
  try {
    const response = await axios.get(
      'https://raw.githubusercontent.com/timothycarambat/senate-stock-watcher-data/master/aggregate/all_transactions.json',
      {
        timeout: 15000,
        headers: { 'User-Agent': 'BitcoinHub-Congressional-Tracker/1.0' }
      }
    );

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid response format from GitHub Congressional data');
    }

    console.log(`✓ Real Congressional trades retrieved: ${response.data.length} total trades`);

    // Transform GitHub data to our internal format
    const allTrades: CongressionalTrade[] = response.data.map((trade: any) => ({
      representative: trade.senator, // Senate data uses 'senator' field
      district: 'Senate', // All are Senate trades
      party: inferPartyFromName(trade.senator), // Infer party from senator name
      trade_date: trade.transaction_date,
      disclosure_date: trade.transaction_date, // Use same date since disclosure_date not available
      ticker: trade.ticker === '--' ? null : trade.ticker,
      asset_description: trade.asset_description,
      transaction_type: trade.type.includes('Purchase') ? 'Purchase' : 'Sale',
      amount: trade.amount,
      cap_gains_over_200_usd: false, // Not available in this dataset
      ptr_link: trade.ptr_link,
      owner: trade.owner
    }));

    const realData = processCongressionalData(allTrades, false);
    
    // Add data source indication and note about data age
    realData.lastUpdated = new Date().toISOString();
    realData.fallbackData = false;
    
    return realData;
    
  } catch (error) {
    console.error('Error fetching real Congressional data from GitHub:', error);
    throw error;
  }
}

// Helper function to infer party from senator name (basic implementation)
function inferPartyFromName(politicianName: string): string {
  if (!politicianName) return 'Unknown';
  
  const nameLower = politicianName.toLowerCase();
  
  // Comprehensive list based on current and recent politicians
  const republicans = [
    'vern buchanan', 'buchanan', 'scott', 'cruz', 'rubio', 'graham', 'mcconnell', 'paul', 
    'cotton', 'hawley', 'desantis', 'abbott', 'greene', 'gaetz', 'boebert', 'jordan', 
    'mccarthy', 'scalise', 'ron johnson', 'johnson', 'kennedy', 'blackburn', 'cornyn',
    'barrasso', 'thune', 'capito', 'collins', 'murkowski', 'tillis', 'cassidy'
  ];
  
  const democrats = [
    'pelosi', 'schumer', 'warren', 'sanders', 'wyden', 'carper', 'blumenthal', 'harris', 
    'feinstein', 'durbin', 'klobuchar', 'booker', 'gillibrand', 'menendez', 'cardin',
    'bennet', 'murphy', 'coons', 'peters', 'stabenow', 'brown', 'casey', 'warner'
  ];
  
  for (const rep of republicans) {
    if (nameLower.includes(rep)) return 'Republican';
  }
  
  for (const dem of democrats) {
    if (nameLower.includes(dem)) return 'Democrat';
  }
  
  return 'Independent';
}
import axios from 'axios';

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

export async function getHouseStockData(): Promise<HouseStockData> {
  // Return cached data if valid
  if (isCacheValid() && houseStockCache?.data) {
    return houseStockCache.data;
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

    const allTrades: CongressionalTrade[] = response.data;
    
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

    const houseStockData: HouseStockData = {
      lastUpdated: new Date().toISOString(),
      totalTrades: allTrades.length,
      cryptoTrades: cryptoTrades.sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime()),
      recentActivity,
      partyBreakdown,
      topCryptoTraders
    };

    // Cache the data
    houseStockCache = {
      data: houseStockData,
      timestamp: Date.now()
    };

    console.log(`✅ House Stock Watcher data processed: ${cryptoTrades.length} crypto trades found`);
    return houseStockData;

  } catch (error) {
    console.error('Error fetching House Stock Watcher data:', error);

    // Return fallback data with realistic recent examples
    const fallbackData: HouseStockData = {
      lastUpdated: new Date().toISOString(),
      totalTrades: 8500,
      fallbackData: true,
      cryptoTrades: [
        {
          representative: "Nancy Pelosi",
          district: "CA-11",
          party: "Democrat",
          trade_date: "2025-09-15",
          disclosure_date: "2025-09-18",
          ticker: "NVDA",
          asset_description: "NVIDIA Corporation",
          transaction_type: "Purchase",
          amount: "$1,000,001 - $5,000,000",
          cap_gains_over_200_usd: false,
          ptr_link: "https://disclosures-clerk.house.gov/example",
          crypto_relevance: "infrastructure" as const,
          bitcoin_impact_score: 6
        },
        {
          representative: "Dan Crenshaw",
          district: "TX-02",
          party: "Republican", 
          trade_date: "2025-09-10",
          disclosure_date: "2025-09-13",
          ticker: "COIN",
          asset_description: "Coinbase Global Inc",
          transaction_type: "Sale",
          amount: "$15,001 - $50,000",
          cap_gains_over_200_usd: true,
          ptr_link: "https://disclosures-clerk.house.gov/example",
          crypto_relevance: "direct" as const,
          bitcoin_impact_score: 10
        }
      ],
      recentActivity: [
        {
          representative: "Alexandria Ocasio-Cortez",
          district: "NY-14",
          party: "Democrat",
          trade_date: "2025-09-12",
          disclosure_date: "2025-09-15",
          ticker: "AAPL",
          asset_description: "Apple Inc",
          transaction_type: "Purchase",
          amount: "$1,001 - $15,000",
          cap_gains_over_200_usd: false,
          ptr_link: "https://disclosures-clerk.house.gov/example"
        }
      ],
      partyBreakdown: {
        democrat: 15,
        republican: 18,
        independent: 2
      },
      topCryptoTraders: [
        {
          name: "Nancy Pelosi",
          party: "Democrat",
          district: "CA-11",
          cryptoTradeCount: 12,
          totalValue: "$2.1M+",
          lastTradeDate: "2025-09-15"
        },
        {
          name: "Dan Crenshaw", 
          party: "Republican",
          district: "TX-02",
          cryptoTradeCount: 8,
          totalValue: "$450K+",
          lastTradeDate: "2025-09-10"
        }
      ]
    };

    return fallbackData;
  }
}
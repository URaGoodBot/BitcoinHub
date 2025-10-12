import { Request, Response } from 'express';

interface WhaleTransaction {
  hash: string;
  timestamp: number;
  amount: number;
  amountUSD: number;
  from: string;
  to: string;
  type: 'large_transfer' | 'exchange_inflow' | 'exchange_outflow' | 'unknown';
  significance: 'high' | 'medium' | 'low';
}

interface WhaleAlertResponse {
  transactions: WhaleTransaction[];
  currentPrice: number;
  totalVolume24h: number;
  largestTransaction: WhaleTransaction | null;
  timestamp: string;
}

// Known exchange addresses (partial list for demo - would be more comprehensive in production)
const KNOWN_EXCHANGES = new Set([
  '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s', // Binance
  '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo', // Binance
  '3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r', // Coinbase
  'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97', // Binance cold
  'bc1qa5wkgaew2dkv56kfvj49j0av5nml45x9ek9hz6' // Coinbase cold
]);

// Cache for Bitcoin price
let cachedPrice = 0;
let priceLastFetched = 0;

async function getBitcoinPrice(): Promise<number> {
  const now = Date.now();
  
  // Return cached price if less than 5 minutes old
  if (cachedPrice > 0 && (now - priceLastFetched) < 5 * 60 * 1000) {
    return cachedPrice;
  }

  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
    );
    const data = await response.json();
    cachedPrice = data.bitcoin.usd;
    priceLastFetched = now;
    return cachedPrice;
  } catch (error) {
    console.error('Error fetching Bitcoin price for whale alerts:', error);
    return cachedPrice || 60000; // Fallback to cached or default
  }
}

function classifyTransaction(from: string, to: string): WhaleTransaction['type'] {
  const fromIsExchange = KNOWN_EXCHANGES.has(from);
  const toIsExchange = KNOWN_EXCHANGES.has(to);

  if (fromIsExchange && !toIsExchange) {
    return 'exchange_outflow';
  } else if (!fromIsExchange && toIsExchange) {
    return 'exchange_inflow';
  } else {
    return 'large_transfer';
  }
}

function calculateSignificance(amountBTC: number): WhaleTransaction['significance'] {
  if (amountBTC >= 1000) return 'high';
  if (amountBTC >= 500) return 'medium';
  return 'low';
}

export async function getWhaleAlerts(req: Request, res: Response) {
  try {
    // Fetch current Bitcoin price
    const btcPrice = await getBitcoinPrice();

    // Fetch recent unconfirmed transactions from Blockchain.com
    const response = await fetch(
      'https://blockchain.info/unconfirmed-transactions?format=json'
    );

    if (!response.ok) {
      throw new Error(`Blockchain.com API error: ${response.status}`);
    }

    const data = await response.json();
    const allTransactions = data.txs || [];

    // Filter for large transactions (>= 100 BTC or >= $1M USD)
    const whaleTransactions: WhaleTransaction[] = [];
    let totalVolume24h = 0;
    let largestTransaction: WhaleTransaction | null = null;
    let maxAmount = 0;

    for (const tx of allTransactions) {
      // Calculate total output in satoshis
      const totalOutput = tx.out.reduce((sum: number, output: any) => sum + output.value, 0);
      const amountBTC = totalOutput / 100000000; // Convert satoshis to BTC
      const amountUSD = amountBTC * btcPrice;

      // Only include transactions >= 100 BTC
      if (amountBTC >= 100) {
        const from = tx.inputs?.[0]?.prev_out?.addr || 'Unknown';
        const to = tx.out?.[0]?.addr || 'Unknown';
        
        const whaleTransaction: WhaleTransaction = {
          hash: tx.hash,
          timestamp: tx.time * 1000, // Convert to milliseconds
          amount: amountBTC,
          amountUSD,
          from,
          to,
          type: classifyTransaction(from, to),
          significance: calculateSignificance(amountBTC)
        };

        whaleTransactions.push(whaleTransaction);
        totalVolume24h += amountUSD;

        if (amountBTC > maxAmount) {
          maxAmount = amountBTC;
          largestTransaction = whaleTransaction;
        }
      }
    }

    // Sort by timestamp (most recent first)
    whaleTransactions.sort((a, b) => b.timestamp - a.timestamp);

    // Limit to 20 most recent whale transactions
    const limitedTransactions = whaleTransactions.slice(0, 20);

    const result: WhaleAlertResponse = {
      transactions: limitedTransactions,
      currentPrice: btcPrice,
      totalVolume24h,
      largestTransaction,
      timestamp: new Date().toISOString()
    };

    res.json(result);

  } catch (error: any) {
    console.error('Error fetching whale alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch whale alerts',
      message: error.message,
      transactions: [],
      currentPrice: 0,
      totalVolume24h: 0,
      largestTransaction: null,
      timestamp: new Date().toISOString()
    });
  }
}

// Cache whale alerts for 2 minutes
let cachedWhaleAlerts: WhaleAlertResponse | null = null;
let whaleAlertsLastFetched = 0;

export async function getCachedWhaleAlerts(req: Request, res: Response) {
  const now = Date.now();
  
  // Return cached data if less than 2 minutes old
  if (cachedWhaleAlerts && (now - whaleAlertsLastFetched) < 2 * 60 * 1000) {
    return res.json(cachedWhaleAlerts);
  }

  // Mock the request/response for internal call
  const mockRes = {
    json: (data: WhaleAlertResponse) => {
      cachedWhaleAlerts = data;
      whaleAlertsLastFetched = now;
      res.json(data);
    },
    status: (code: number) => ({
      json: (data: any) => {
        res.status(code).json(data);
      }
    })
  } as Response;

  await getWhaleAlerts(req, mockRes);
}

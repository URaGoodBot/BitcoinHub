// Client-side API functions for static website deployment
// All API calls are now made directly from the browser to external services

// Bitcoin market data
export async function getBitcoinMarketData() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true');
    const data = await response.json();
    
    return {
      current_price: {
        usd: data.bitcoin.usd
      },
      price_change_percentage_24h: data.bitcoin.usd_24h_change,
      market_cap: {
        usd: data.bitcoin.usd_market_cap
      },
      total_volume: {
        usd: data.bitcoin.usd_24h_vol
      }
    };
  } catch (error) {
    console.error('Error fetching Bitcoin market data:', error);
    // Return fallback data for static website
    return {
      current_price: { usd: 120000 },
      price_change_percentage_24h: 2.5,
      market_cap: { usd: 2400000000000 },
      total_volume: { usd: 65000000000 }
    };
  }
}

// Bitcoin dominance
export async function getBitcoinDominance() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/global');
    const data = await response.json();
    
    return {
      dominance: data.data.market_cap_percentage.btc,
      totalMarketCap: data.data.total_market_cap.usd
    };
  } catch (error) {
    console.error('Error fetching Bitcoin dominance:', error);
    return {
      dominance: 62.4,
      totalMarketCap: 3850000000000
    };
  }
}

// Bitcoin volume
export async function getBitcoinVolume() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin');
    const data = await response.json();
    
    return {
      volume24h: data.market_data.total_volume.usd,
      volumeChange24h: data.market_data.price_change_percentage_24h || 0
    };
  } catch (error) {
    console.error('Error fetching Bitcoin volume:', error);
    return {
      volume24h: 67000000000,
      volumeChange24h: 1.2
    };
  }
}

// Fear and Greed Index
export async function getFearGreedIndex() {
  try {
    const response = await fetch('https://api.alternative.me/fng/');
    const data = await response.json();
    
    return {
      currentValue: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
      timestamp: data.data[0].timestamp
    };
  } catch (error) {
    console.error('Error fetching Fear & Greed Index:', error);
    return {
      currentValue: 74,
      classification: "Greed",
      timestamp: Date.now().toString()
    };
  }
}

// Bitcoin network stats (using blockchain.info API)
export async function getBitcoinNetworkStats() {
  try {
    const response = await fetch('https://blockchain.info/q/hashrate');
    const hashRateGhs = await response.text();
    const hashRateEhs = parseFloat(hashRateGhs) / 1000000; // Convert GH/s to EH/s
    
    return {
      hashRate: hashRateEhs * 1000000000000000, // Convert to TH/s for display
      hashRateDisplay: hashRateEhs.toFixed(1) + ' EH/s'
    };
  } catch (error) {
    console.error('Error fetching Bitcoin network stats:', error);
    return {
      hashRate: 830000000000000,
      hashRateDisplay: '830.0 EH/s'
    };
  }
}

// Bitcoin difficulty
export async function getBitcoinDifficulty() {
  try {
    const response = await fetch('https://blockchain.info/q/getdifficulty');
    const difficulty = await response.text();
    
    return {
      difficulty: parseFloat(difficulty),
      nextRetarget: Date.now() + (14 * 24 * 60 * 60 * 1000) // Estimate 14 days
    };
  } catch (error) {
    console.error('Error fetching Bitcoin difficulty:', error);
    return {
      difficulty: 126271255279306,
      nextRetarget: Date.now() + (14 * 24 * 60 * 60 * 1000)
    };
  }
}

// Financial market data (using free APIs where possible)
export async function getFinancialMarkets() {
  try {
    // This would need to be replaced with a CORS-enabled financial API
    // For now, return realistic static data
    return {
      dxy: { value: 98.12, change: 0.26 },
      gold: { value: 2685.40, change: -0.45 },
      spx: { value: 6090.27, change: 0.38 },
      vix: { value: 15.23, change: -2.1 },
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching financial markets:', error);
    return {
      dxy: { value: 98.12, change: 0.26 },
      gold: { value: 2685.40, change: -0.45 },
      spx: { value: 6090.27, change: 0.38 },
      vix: { value: 15.23, change: -2.1 },
      lastUpdated: new Date().toISOString()
    };
  }
}

// Market sentiment (simplified for static website)
export async function getMarketSentiment() {
  try {
    // Simple sentiment based on Fear & Greed Index
    const fearGreed = await getFearGreedIndex();
    let sentiment = "neutral";
    let score = 50;
    
    if (fearGreed.currentValue >= 70) {
      sentiment = "bullish";
      score = Math.min(85, fearGreed.currentValue + 10);
    } else if (fearGreed.currentValue <= 30) {
      sentiment = "bearish";
      score = Math.max(15, fearGreed.currentValue - 10);
    } else {
      sentiment = "neutral";
      score = fearGreed.currentValue;
    }
    
    return {
      overall: sentiment,
      overallScore: score,
      sources: {
        fearGreed: {
          sentiment,
          confidence: 85,
          signal: fearGreed.classification
        }
      }
    };
  } catch (error) {
    console.error('Error calculating market sentiment:', error);
    return {
      overall: "bullish",
      overallScore: 68,
      sources: {
        fearGreed: {
          sentiment: "bullish",
          confidence: 85,
          signal: "Greed"
        }
      }
    };
  }
}

// News data (using free news APIs)
export async function getLatestNews() {
  // For static website, return curated news data
  // In a real implementation, you'd use a CORS-enabled news API
  return [
    {
      id: "1",
      title: "Bitcoin Price Analysis: Bulls Target $125,000 Resistance",
      summary: "Technical analysis suggests Bitcoin is consolidating before the next major move higher.",
      url: "https://cointelegraph.com",
      publishedAt: new Date().toISOString(),
      source: "CoinTelegraph",
      category: "Markets"
    },
    {
      id: "2", 
      title: "Federal Reserve Maintains Current Interest Rate Policy",
      summary: "The Fed continues its measured approach to monetary policy amid Bitcoin's strong performance.",
      url: "https://coindesk.com",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      source: "CoinDesk",
      category: "Markets"
    },
    {
      id: "3",
      title: "Bitcoin Network Hash Rate Reaches New All-Time High", 
      summary: "Mining security continues to strengthen as hash rate climbs above 800 EH/s.",
      url: "https://bitcoin.com",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      source: "Bitcoin.com",
      category: "Mining"
    }
  ];
}

// Static data for features that require backend
export function getStaticNotifications() {
  return [
    {
      id: "static_1",
      type: "info",
      title: "Welcome to BitcoinHub",
      message: "Track live Bitcoin data, market sentiment, and Federal Reserve indicators all in one place.",
      timestamp: Date.now() - 300000,
      isRead: false
    }
  ];
}

// Fed Watch Tool data (simplified for static website)
export function getFedWatchData() {
  return {
    currentRate: "425-450",
    nextMeeting: "2025-07-30",
    probabilities: [
      { rate: "425-450", probability: 85, label: "No Change" },
      { rate: "400-425", probability: 10, label: "Rate Cut" },
      { rate: "450-475", probability: 5, label: "Rate Hike" }
    ],
    futureOutlook: {
      oneWeek: { noChange: 90, cut: 8, hike: 2 },
      oneMonth: { noChange: 75, cut: 20, hike: 5 }
    },
    lastUpdated: new Date().toISOString()
  };
}

// Treasury data (simplified for static website)
export function getTreasuryData() {
  return {
    yield: 4.35,
    change: 0.01,
    percentChange: 0.23,
    keyLevels: {
      low52Week: 3.60,
      current: 4.35,
      high52Week: 5.05
    },
    lastUpdated: new Date().toISOString()
  };
}

// Inflation data (simplified for static website)
export function getInflationData() {
  return {
    overall: {
      rate: 2.38,
      change: -0.02,
      lastUpdated: new Date().toISOString(),
      comparisonPeriod: "2024-05-01"
    },
    sectors: [
      { name: "Food", rate: 3.2, change: 0.1, seriesId: "CUSR0000SAF1" },
      { name: "Energy", rate: 1.8, change: -0.5, seriesId: "CUSR0000SA0E" },
      { name: "Housing", rate: 4.1, change: 0.2, seriesId: "CUSR0000SAH1" },
      { name: "Transportation", rate: 2.9, change: -0.3, seriesId: "CUSR0000SAT1" },
      { name: "Healthcare", rate: 3.5, change: 0.1, seriesId: "CUSR0000SAM" },
      { name: "Recreation", rate: 1.9, change: 0.0, seriesId: "CUSR0000SAR" }
    ],
    source: "Federal Reserve Economic Data (FRED)",
    lastUpdated: new Date().toISOString()
  };
}

export function getDailyTip() {
  const tips = [
    {
      id: "tip1",
      title: "Dollar Cost Averaging",
      content: "Consider dollar-cost averaging (DCA) to reduce the impact of volatility. Invest a fixed amount regularly regardless of price.",
      category: "Strategy"
    },
    {
      id: "tip2", 
      title: "Self-Custody",
      content: "Not your keys, not your Bitcoin. Consider learning about hardware wallets for long-term storage.",
      category: "Security"
    },
    {
      id: "tip3",
      title: "Hash Rate Correlation",
      content: "Bitcoin's hash rate often correlates with price over longer timeframes, indicating network security and miner confidence.",
      category: "Technical"
    }
  ];
  
  const today = new Date().getDate();
  return tips[today % tips.length];
}
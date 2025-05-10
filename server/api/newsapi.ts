import { NewsItem } from "@/lib/types";

// Sample categories
const CATEGORIES = ["News", "Mining", "ETF", "Markets", "Security", "Wallets"];

// Get latest Bitcoin news
export async function getLatestNews(category?: string): Promise<NewsItem[]> {
  try {
    // This would be replaced with a real API call in production
    // NewsAPI requires an API key and would be called like:
    // const apiKey = process.env.NEWS_API_KEY;
    // const url = `https://newsapi.org/v2/everything?q=bitcoin${category ? `+${category}` : ""}&apiKey=${apiKey}&sortBy=publishedAt&language=en`;
    
    // For demonstration, return well-structured news items
    let items: NewsItem[] = [
      {
        id: "1",
        title: "Bitcoin Miners Receive $35M in Transaction Fees Amid Price Surge",
        description: "Bitcoin miners have earned a significant amount in transaction fees as the price of Bitcoin continues to climb, reaching a new yearly high.",
        url: "https://example.com/bitcoin-miners-fees",
        source: "CoinDesk",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        categories: ["News", "Mining"],
        imageUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
      },
      {
        id: "2",
        title: "Spot Bitcoin ETFs See $172 Million Net Inflows as Institutional Interest Grows",
        description: "Bitcoin ETFs continue to see significant inflows as institutional investors are increasingly allocating funds to Bitcoin exposure through regulated products.",
        url: "https://example.com/bitcoin-etf-inflows",
        source: "Bloomberg",
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        categories: ["ETF", "Markets"],
        imageUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1400&q=80"
      },
      {
        id: "3",
        title: "Security Experts Warn of New Phishing Attacks Targeting Bitcoin Wallet Users",
        description: "A sophisticated phishing campaign is targeting users of popular Bitcoin wallets. Learn how to protect your assets from these threats.",
        url: "https://example.com/bitcoin-wallet-phishing",
        source: "CryptoNews",
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        categories: ["Security", "Wallets"],
        imageUrl: "https://images.unsplash.com/photo-1624996379697-f01d168b1a52?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&h=800"
      },
      {
        id: "4",
        title: "Bitcoin Mining Difficulty Reaches All-Time High After Latest Adjustment",
        description: "The Bitcoin network's mining difficulty has increased by 5.8% to a new record high, reflecting the growing competition among miners.",
        url: "https://example.com/bitcoin-mining-difficulty",
        source: "Bitcoin Magazine",
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        categories: ["Mining", "News"],
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&h=800"
      },
      {
        id: "5",
        title: "New Bitcoin Reserve Requirement Regulations Proposed by Financial Authorities",
        description: "Financial regulators are proposing new guidelines for financial institutions holding Bitcoin, which could impact market liquidity.",
        url: "https://example.com/bitcoin-regulations",
        source: "Financial Times",
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        categories: ["Markets", "News"],
        imageUrl: "https://images.unsplash.com/photo-1621504450181-5d356f61d307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1400&h=800"
      }
    ];
    
    // Filter by category if provided
    if (category) {
      items = items.filter(item => item.categories.includes(category));
    }
    
    return items;
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return empty array if there was an error
    return [];
  }
}

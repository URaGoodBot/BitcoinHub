import { NewsItem } from "@/lib/types";
import axios from "axios";

// Default categories for Bitcoin news
const DEFAULT_CATEGORIES = ["News", "Mining", "ETF", "Markets", "Security", "Wallets"];

// Cache mechanism to avoid hitting rate limits
let newsCache: {
  timestamp: number;
  data: NewsItem[];
} | null = null;

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Check if cache is valid
function isCacheValid(): boolean {
  return !!(newsCache && Date.now() - newsCache.timestamp < CACHE_DURATION);
}

// Extract categories from news item content
function extractCategories(title: string, body: string): string[] {
  const content = (title + " " + body).toLowerCase();
  const categories: string[] = [];
  
  if (content.includes("mining") || content.includes("miner")) categories.push("Mining");
  if (content.includes("etf") || content.includes("exchange traded")) categories.push("ETF");
  if (content.includes("market") || content.includes("price") || content.includes("trading")) categories.push("Markets");
  if (content.includes("security") || content.includes("hack") || content.includes("phishing")) categories.push("Security");
  if (content.includes("wallet") || content.includes("storage") || content.includes("cold storage")) categories.push("Wallets");
  
  // If no specific category was found, mark as general news
  if (categories.length === 0) categories.push("News");
  
  return categories;
}

// Get latest Bitcoin news using CryptoCompare API (public, no API key required)
export async function getLatestNews(category?: string): Promise<NewsItem[]> {
  try {
    // Use cached data if available and valid
    if (isCacheValid()) {
      let items = newsCache!.data;
      
      // Filter by category if provided
      if (category) {
        items = items.filter(item => item.categories.includes(category));
      }
      
      return items;
    }
    
    // Fetch fresh data from CryptoCompare News API (no auth required)
    const url = "https://min-api.cryptocompare.com/data/v2/news/?categories=BTC,Bitcoin&excludeCategories=Sponsored";
    const response = await axios.get(url);
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    
    // Transform API response to match our NewsItem interface
    const items: NewsItem[] = response.data.Data.map((item: any, index: number) => {
      const categories = extractCategories(item.title, item.body);
      
      return {
        id: item.id || String(index + 1),
        title: item.title,
        description: item.body.substring(0, 200) + "...",
        url: item.url,
        source: item.source,
        publishedAt: new Date(item.published_on * 1000).toISOString(),
        categories: categories,
        imageUrl: item.imageurl || "https://images.unsplash.com/photo-1621504450181-5d356f61d307?ixlib=rb-4.0.3"
      };
    });
    
    // Update cache
    newsCache = {
      timestamp: Date.now(),
      data: items
    };
    
    // Filter by category if provided
    let result = items;
    if (category) {
      result = items.filter(item => item.categories.includes(category));
    }
    
    return result;
  } catch (error) {
    console.error("Error fetching news:", error);
    
    // If cache exists but is expired, still use it as fallback during errors
    if (newsCache) {
      console.log("Using expired cache as fallback due to API error");
      let items = newsCache.data;
      
      if (category) {
        items = items.filter(item => item.categories.includes(category));
      }
      
      return items;
    }
    
    // Return empty array if there was an error and no cache
    return [];
  }
}

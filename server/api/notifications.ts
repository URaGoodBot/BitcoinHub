import OpenAI from "openai";
import { getLatestNews } from "./newsapi";
import { NewsItem } from "@/lib/types";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Notification {
  id: string;
  type: 'price_alert' | 'news' | 'market' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

let notificationCache: {
  timestamp: number;
  data: Notification[];
} | null = null;

// Track removed notifications per session
let removedNotifications: Set<string> = new Set();

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function isCacheValid(): boolean {
  return !!(notificationCache && Date.now() - notificationCache.timestamp < CACHE_DURATION);
}

export async function generateNewsNotifications(): Promise<Notification[]> {
  try {
    const news = await getLatestNews();
    const recentNews = news.slice(0, 5); // Get top 5 recent news items

    if (!recentNews.length) {
      return [];
    }

    // Use AI to summarize and prioritize news
    const newsContent = recentNews.map(item => 
      `Title: ${item.title}\nSummary: ${item.description || item.summary}`
    ).join('\n\n');

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Bitcoin news analyst. Analyze the provided Bitcoin news articles and create concise notification summaries. Focus on market impact, price implications, and user relevance. Return JSON with notifications ranked by importance."
        },
        {
          role: "user",
          content: `Analyze these Bitcoin news articles and create 3-5 notification summaries. Each should be under 80 characters for the title and under 150 characters for the message. Focus on the most impactful news for Bitcoin traders and investors:\n\n${newsContent}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000
    });

    const aiResult = JSON.parse(response.choices[0].message.content || '{"notifications": []}');
    const notifications: Notification[] = [];

    if (aiResult.notifications && Array.isArray(aiResult.notifications)) {
      aiResult.notifications.forEach((notif: any, index: number) => {
        if (notif.title && notif.message) {
          notifications.push({
            id: `news_${Date.now()}_${index}`,
            type: 'news',
            title: notif.title,
            message: notif.message,
            timestamp: new Date(Date.now() - (index * 10 * 60 * 1000)), // Stagger timestamps
            read: false,
            priority: notif.priority || 'medium',
            data: { source: 'ai_analysis', originalNews: recentNews[index] }
          });
        }
      });
    }

    return notifications;
  } catch (error) {
    console.error('Error generating news notifications:', error);
    
    // Fallback to recent news headlines
    try {
      const news = await getLatestNews();
      return news.slice(0, 3).map((item, index) => ({
        id: `news_fallback_${Date.now()}_${index}`,
        type: 'news' as const,
        title: 'Bitcoin News Update',
        message: item.title.substring(0, 120) + (item.title.length > 120 ? '...' : ''),
        timestamp: new Date(Date.now() - (index * 15 * 60 * 1000)),
        read: false,
        priority: 'medium' as const,
        data: { source: 'direct_news', url: item.url }
      }));
    } catch (fallbackError) {
      console.error('Fallback news fetch failed:', fallbackError);
      return [];
    }
  }
}

export async function generatePriceAlertNotification(
  alertPrice: number, 
  currentPrice: number, 
  type: 'above' | 'below'
): Promise<Notification> {
  try {
    const priceChange = ((currentPrice - alertPrice) / alertPrice * 100).toFixed(2);
    const direction = type === 'above' ? 'crossed above' : 'dropped below';
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Bitcoin price alert system. Create concise, actionable notifications for price movements. Be precise and professional."
        },
        {
          role: "user",
          content: `Bitcoin has ${direction} $${alertPrice.toLocaleString()}. Current price: $${currentPrice.toLocaleString()}. Change: ${priceChange}%. Create a notification title (max 60 chars) and message (max 120 chars) in JSON format.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 200
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      id: `price_alert_${Date.now()}`,
      type: 'price_alert',
      title: result.title || `Price Alert: $${alertPrice.toLocaleString()}`,
      message: result.message || `Bitcoin ${direction} your alert price of $${alertPrice.toLocaleString()}`,
      timestamp: new Date(),
      read: false,
      priority: Math.abs(parseFloat(priceChange)) > 5 ? 'high' : 'medium',
      data: { 
        alertPrice, 
        currentPrice, 
        type, 
        priceChange: parseFloat(priceChange) 
      }
    };
  } catch (error) {
    console.error('Error generating price alert notification:', error);
    
    // Fallback notification
    const priceChange = ((currentPrice - alertPrice) / alertPrice * 100).toFixed(2);
    const direction = type === 'above' ? 'crossed above' : 'dropped below';
    
    return {
      id: `price_alert_fallback_${Date.now()}`,
      type: 'price_alert',
      title: `Bitcoin Price Alert`,
      message: `Bitcoin ${direction} $${alertPrice.toLocaleString()} (${priceChange}%)`,
      timestamp: new Date(),
      read: false,
      priority: Math.abs(parseFloat(priceChange)) > 5 ? 'high' : 'medium',
      data: { alertPrice, currentPrice, type, priceChange: parseFloat(priceChange) }
    };
  }
}

export async function generateMarketInsightNotification(marketData: any): Promise<Notification | null> {
  try {
    if (!marketData?.current_price?.usd || !marketData?.price_change_percentage_24h) {
      return null;
    }

    const price = marketData.current_price.usd;
    const change24h = marketData.price_change_percentage_24h;
    const volume = marketData.total_volume?.usd;
    const marketCap = marketData.market_cap?.usd;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a Bitcoin market analyst. Generate insightful notifications about significant market movements or conditions. Focus on actionable insights."
        },
        {
          role: "user",
          content: `Bitcoin market data: Price: $${price.toLocaleString()}, 24h change: ${change24h.toFixed(2)}%, Volume: $${volume?.toLocaleString() || 'N/A'}, Market Cap: $${marketCap?.toLocaleString() || 'N/A'}. 

Generate a market insight notification if there's something noteworthy (significant price movement, high volume, etc.). Return JSON with title and message, or null if nothing noteworthy.`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 300
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    if (!result.title || !result.message) {
      return null;
    }

    return {
      id: `market_insight_${Date.now()}`,
      type: 'market',
      title: result.title,
      message: result.message,
      timestamp: new Date(),
      read: false,
      priority: Math.abs(change24h) > 5 ? 'high' : 'medium',
      data: { price, change24h, volume, marketCap }
    };
  } catch (error) {
    console.error('Error generating market insight:', error);
    return null;
  }
}

export async function checkPriceAlerts(currentPrice: number): Promise<Notification[]> {
  try {
    // In a real app, this would query the database for active price alerts
    // For now, simulate checking against common psychological levels
    const notifications: Notification[] = [];
    
    const psychologicalLevels = [100000, 105000, 110000, 115000, 120000];
    const recentPrices = [108000, 109000]; // Simulate recent price history
    
    for (const level of psychologicalLevels) {
      // Check if price crossed above the level
      if (currentPrice >= level && recentPrices.some(price => price < level)) {
        const notification = await generatePriceAlertNotification(level, currentPrice, 'above');
        notifications.push(notification);
      }
      // Check if price dropped below the level
      else if (currentPrice <= level && recentPrices.some(price => price > level)) {
        const notification = await generatePriceAlertNotification(level, currentPrice, 'below');
        notifications.push(notification);
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error checking price alerts:', error);
    return [];
  }
}

export async function getAllNotifications(): Promise<Notification[]> {
  try {
    if (isCacheValid()) {
      return notificationCache!.data;
    }

    const notifications: Notification[] = [];

    // Get news notifications
    const newsNotifications = await generateNewsNotifications();
    notifications.push(...newsNotifications);

    // Get market data for insights and price alerts
    try {
      const { getBitcoinMarketData } = await import("./coingecko");
      const marketData = await getBitcoinMarketData();
      
      // Generate market insight
      const marketInsight = await generateMarketInsightNotification(marketData);
      if (marketInsight) {
        notifications.push(marketInsight);
      }
      
      // Check for triggered price alerts
      if (marketData?.current_price?.usd) {
        const priceAlerts = await checkPriceAlerts(marketData.current_price.usd);
        notifications.push(...priceAlerts);
      }
    } catch (marketError) {
      console.error('Error fetching market data for notifications:', marketError);
    }

    // Sort by priority and timestamp
    notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    // Update cache
    notificationCache = {
      timestamp: Date.now(),
      data: notifications.slice(0, 10) // Limit to 10 notifications
    };

    return notificationCache.data;
  } catch (error) {
    console.error('Error getting all notifications:', error);
    return [];
  }
}

export function removeNotification(notificationId: string): boolean {
  try {
    // Add to removed set
    removedNotifications.add(notificationId);
    
    // Remove from cache if it exists
    if (notificationCache) {
      notificationCache.data = notificationCache.data.filter(n => n.id !== notificationId);
    }
    
    return true;
  } catch (error) {
    console.error('Error removing notification:', error);
    return false;
  }
}

export function clearAllNotifications(): boolean {
  try {
    // Clear cache
    if (notificationCache) {
      // Add all current notifications to removed set
      notificationCache.data.forEach(n => removedNotifications.add(n.id));
      notificationCache.data = [];
    }
    
    return true;
  } catch (error) {
    console.error('Error clearing all notifications:', error);
    return false;
  }
}

export async function getFilteredNotifications(): Promise<Notification[]> {
  try {
    const allNotifications = await getAllNotifications();
    // Filter out removed notifications
    return allNotifications.filter(n => !removedNotifications.has(n.id));
  } catch (error) {
    console.error('Error getting filtered notifications:', error);
    return [];
  }
}
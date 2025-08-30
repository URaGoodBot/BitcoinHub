// API Response Types
export interface BitcoinPrice {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
}

export interface BitcoinMarketData {
  current_price: {
    usd: number;
  };
  market_cap: {
    usd: number;
  };
  total_volume: {
    usd: number;
  };
  price_change_percentage_24h: number;
  circulating_supply: number;
  ath: {
    usd: number;
  };
  high_24h: {
    usd: number;
  };
  low_24h: {
    usd: number;
  };
}

export interface ChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

export interface ProcessedChartData {
  timestamp: string;
  price: number;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  categories: string[];
  imageUrl?: string;
}

export interface DailyTip {
  id: string;
  title: string;
  content: string;
}

export interface ForumPost {
  id: string;
  title?: string;
  content: string;
  imageUrl?: string; // For meme images
  fileName?: string; // Original filename
  fileType?: string; // MIME type (image/jpeg, video/mp4, etc.)
  fileSize?: number; // File size in bytes
  memeCaption?: string; // Caption for memes
  memeTemplate?: string; // Template name (e.g., "Drake pointing", "Distracted boyfriend")
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  commentCount: number;
  upvotes: number;
  downvotes: number;
  categories: string[];
  isReply: boolean;
  parentPostId?: string;
  mentions: string[];
  hashtags: string[];
  reactions?: PostReactionSummary;
  replies?: ForumPost[];
}

export interface PostReactionSummary {
  like: number;
  love: number;
  rocket: number;
  fire: number;
  userReaction?: string;
}

// Alias for compatibility
export type ForumPostType = ForumPost;

export interface BitcoinHolding {
  amount: number;
  value: number;
}

export interface Portfolio {
  totalValue: number;
  dailyChange: number;
  dailyChangePercentage: number;
  holdings: {
    bitcoin: BitcoinHolding;
  };
}

export interface PriceAlert {
  id: string;
  type: 'above' | 'below';
  price: number;
  isTriggered: boolean;
  createdAt: string;
}

export interface LearningProgress {
  courseName: string;
  completed: number;
  total: number;
  lessons: {
    title: string;
    icon: string;
    duration: string;
  }[];
}

export interface User {
  id: string;
  username: string;
  streakDays: number;
}

export type TimeFrame = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL';

export interface TwitterAuthor {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  avatar?: string; // Changed from profileImageUrl to avatar for consistency
}

export interface TwitterMetrics {
  likes?: number;
  retweets?: number;
  comments?: number; // Changed from replies to comments for consistency
}

export interface TwitterPost {
  id: string;
  author: TwitterAuthor;
  text: string;
  createdAt: string;
  metrics?: TwitterMetrics;
  hashtags: string[];
  imageUrl?: string;
  url?: string; // Add URL field for external links
}

import { TwitterPost } from "@/lib/types";

// Sample X/Twitter trending accounts for Bitcoin
const BITCOIN_ACCOUNTS = [
  "BitcoinMagazine",
  "DocumentingBTC",
  "APompliano",
  "saylor",
  "woonomic",
  "CoinDesk",
  "cz_binance"
];

// Sample X/Twitter hashtags for Bitcoin
const BITCOIN_HASHTAGS = [
  "#Bitcoin",
  "#BTC",
  "#Crypto",
  "#Blockchain",
  "#BitcoinETF",
  "#BitcoinHalving"
];

// Get latest tweets about Bitcoin
export async function getLatestTweets(filter?: string): Promise<TwitterPost[]> {
  try {
    // In a real implementation, this would call the Twitter/X API
    // For example, using the Twitter v2 API:
    // const apiKey = process.env.TWITTER_API_KEY;
    // const url = `https://api.twitter.com/2/tweets/search/recent?query=bitcoin${filter ? `+${filter}` : ""}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=profile_image_url,username,verified`;
    
    // Mock data for demonstration
    const tweets: TwitterPost[] = [
      {
        id: "t1",
        author: {
          id: "BitcoinMagazine",
          username: "BitcoinMagazine",
          displayName: "Bitcoin Magazine",
          verified: true,
          profileImageUrl: "https://pbs.twimg.com/profile_images/1444022922377576453/AzvXYXGr_400x400.jpg"
        },
        text: "BREAKING: The total value locked in Bitcoin layer 2 Lightning Network has reached an all-time high of $350 million. Bitcoin scaling is happening. #Bitcoin",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        metrics: {
          likes: 2450,
          retweets: 785,
          replies: 124
        },
        hashtags: ["#Bitcoin", "#LightningNetwork"]
      },
      {
        id: "t2",
        author: {
          id: "saylor",
          username: "saylor",
          displayName: "Michael Saylor⚡️",
          verified: true,
          profileImageUrl: "https://pbs.twimg.com/profile_images/1485611375705870338/r8q0v8gu_400x400.jpg"
        },
        text: "Bitcoin is a swarm of cyber hornets serving the goddess of wisdom, feeding on the fire of truth, exponentially growing ever smarter, faster, and stronger behind a wall of encrypted energy.",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        metrics: {
          likes: 18500,
          retweets: 4230,
          replies: 1850
        },
        hashtags: ["#Bitcoin"]
      },
      {
        id: "t3",
        author: {
          id: "DocumentingBTC",
          username: "DocumentingBTC",
          displayName: "Documenting Bitcoin 📄",
          verified: true,
          profileImageUrl: "https://pbs.twimg.com/profile_images/1418680128939155458/dKg3dgi7_400x400.jpg"
        },
        text: "JUST IN: Bank of America reports that Bitcoin related transactions now exceed the daily value of all credit card transactions in the United States.",
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
        metrics: {
          likes: 12800,
          retweets: 3600,
          replies: 850
        },
        hashtags: ["#Bitcoin", "#Crypto"]
      },
      {
        id: "t4",
        author: {
          id: "APompliano",
          username: "APompliano",
          displayName: "Anthony Pompliano",
          verified: true,
          profileImageUrl: "https://pbs.twimg.com/profile_images/1443576307455381508/uVm3-2_A_400x400.jpg"
        },
        text: "Bitcoin is up more than 150% in the last 12 months, while the S&P 500 is up only 20%. Not everything is an investment, but every investment should be compared to Bitcoin.",
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        metrics: {
          likes: 9700,
          retweets: 2100,
          replies: 710
        },
        hashtags: ["#Bitcoin", "#Investing"]
      },
      {
        id: "t5",
        author: {
          id: "woonomic",
          username: "woonomic",
          displayName: "Willy Woo",
          verified: true,
          profileImageUrl: "https://pbs.twimg.com/profile_images/1339494889353039873/AfBM-GQW_400x400.jpg"
        },
        text: "On-chain data suggests we are seeing unprecedented accumulation of Bitcoin by long term holders. Supply held by these diamond hands is now at an all-time-high.",
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
        metrics: {
          likes: 7800,
          retweets: 1850,
          replies: 420
        },
        hashtags: ["#Bitcoin", "#OnChain"]
      },
      {
        id: "t6",
        author: {
          id: "cz_binance",
          username: "cz_binance",
          displayName: "CZ 🔶 Binance",
          verified: true,
          profileImageUrl: "https://pbs.twimg.com/profile_images/1444664846741921792/J0j5g4v7_400x400.jpg"
        },
        text: "The number of Bitcoin addresses holding at least 1 BTC has reached an all-time high of 1.1 million. Financial inclusion is happening right in front of our eyes.",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
        metrics: {
          likes: 11200,
          retweets: 2400,
          replies: 980
        },
        hashtags: ["#Bitcoin", "#Crypto", "#Adoption"]
      }
    ];
    
    // Filter based on input
    if (filter) {
      const filterLower = filter.toLowerCase();
      return tweets.filter(tweet => 
        tweet.text.toLowerCase().includes(filterLower) || 
        tweet.author.username.toLowerCase().includes(filterLower) ||
        tweet.hashtags.some(hashtag => hashtag.toLowerCase().includes(filterLower))
      );
    }
    
    return tweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    return [];
  }
}

// Get trending hashtags related to Bitcoin
export function getTrendingHashtags(): string[] {
  return BITCOIN_HASHTAGS;
}

// Get popular Bitcoin accounts
export function getPopularAccounts(): string[] {
  return BITCOIN_ACCOUNTS;
}
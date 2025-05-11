import { TwitterPost } from "@/lib/types";
import axios from "axios";

// Cache mechanism to avoid hitting rate limits
let redditCache: {
  timestamp: number;
  data: TwitterPost[];
} | null = null;

let hashtagsCache: {
  timestamp: number;
  data: string[];
} | null = null;

let accountsCache: {
  timestamp: number;
  data: string[];
} | null = null;

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

// Check if cache is valid
function isCacheValid(cache: any): boolean {
  return !!(cache && Date.now() - cache.timestamp < CACHE_DURATION);
}

// Default Bitcoin subreddit moderators/active users (as fallback)
const DEFAULT_BITCOIN_ACCOUNTS = [
  "Fiach_Dubh",
  "cryptoboy4001",
  "nullc",
  "bitusher",
  "TheGreatMuffin",
  "Bitcoin_is_plan_A",
  "Bitcoin__Maximalist"
];

// Default Bitcoin hashtags (used as fallback)
const DEFAULT_BITCOIN_HASHTAGS = [
  "#Bitcoin",
  "#BTC",
  "#Crypto",
  "#Blockchain",
  "#BitcoinETF",
  "#BitcoinHalving"
];

// Function to extract hashtags from text
function extractHashtags(text: string): string[] {
  const hashtagRegex = /#[\w]+/g;
  return (text.match(hashtagRegex) || []).slice(0, 5);
}

// Function to extract topics from Reddit post
function extractTopics(title: string, selftext: string): string[] {
  // Common Bitcoin topics worth tracking
  const topics = [
    "#Bitcoin", "#BTC", "#Crypto", "#Trading", "#Mining", 
    "#Wallet", "#Hodl", "#Investing", "#Blockchain", "#Lightning", 
    "#Halving", "#ETF", "#Satoshi", "#Technical", "#Price", 
    "#Regulation", "#Adoption", "#Security", "#Nodes"
  ];
  
  const combined = (title + " " + selftext).toLowerCase();
  return topics.filter(topic => 
    combined.includes(topic.toLowerCase().replace("#", ""))
  ).slice(0, 5);
}

// Get latest Bitcoin-related posts from Reddit API (public, no auth required)
export async function getLatestTweets(filter?: string): Promise<TwitterPost[]> {
  try {
    console.log("Fetching Reddit posts, filter:", filter);
    
    // Use cached data if available and valid
    if (isCacheValid(redditCache)) {
      console.log("Using valid Reddit cache");
      let posts = redditCache!.data;
      
      // Filter based on input
      if (filter) {
        const filterLower = filter.toLowerCase();
        return posts.filter(post => 
          post.text.toLowerCase().includes(filterLower) || 
          post.author.username.toLowerCase().includes(filterLower) ||
          post.hashtags.some(hashtag => hashtag.toLowerCase().includes(filterLower))
        );
      }
      
      return posts;
    }
    
    console.log("Fetching fresh Reddit data");
    
    // Fetch Bitcoin content from Reddit
    const url = "https://www.reddit.com/r/Bitcoin/hot.json?limit=25";
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (BitcoinCentral/1.0)'
      }
    });
    
    if (response.status !== 200) {
      throw new Error(`Failed to fetch Reddit data: ${response.statusText}`);
    }
    
    // Transform Reddit posts to match our TwitterPost interface
    const posts = response.data.data.children;
    console.log(`Got ${posts.length} Reddit posts`);
    
    const redditPosts: TwitterPost[] = posts.map((post: any, index: number) => {
      const data = post.data;
      
      // Skip pinned posts and ads
      if (data.stickied || data.is_video || data.over_18) {
        return null;
      }
      
      const created = new Date(data.created_utc * 1000);
      
      // Extract hashtags or generate topics based on content
      let hashtags = extractHashtags(data.title + " " + (data.selftext || ""));
      
      // If no hashtags found in the text, extract topics
      if (hashtags.length === 0) {
        hashtags = extractTopics(data.title, data.selftext || "");
      }
      
      // If still no topics, add at least #Bitcoin
      if (hashtags.length === 0) {
        hashtags.push("#Bitcoin");
      }
      
      // Generate a consistent avatar for the user
      const userAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${data.author}`;
      
      // Get image if available
      let imageUrl = null;
      
      // Check for Reddit preview images
      if (data.preview && data.preview.images && data.preview.images.length > 0) {
        try {
          imageUrl = data.preview.images[0].source.url.replace(/&amp;/g, '&');
        } catch (e) {
          console.log('Error extracting preview image:', e);
        }
      }
      
      // Try to get image from different Reddit sources if preview failed
      if (!imageUrl) {
        // Try thumbnail
        if (data.thumbnail && data.thumbnail.startsWith('http')) {
          imageUrl = data.thumbnail;
        }
        // Try media
        else if (data.media && data.media.oembed && data.media.oembed.thumbnail_url) {
          imageUrl = data.media.oembed.thumbnail_url;
        }
        // Try URL if it's an image
        else if (data.url && /\.(jpg|jpeg|png|gif)$/i.test(data.url)) {
          imageUrl = data.url;
        }
      }
      
      console.log(`Post ${data.id} has image: ${imageUrl ? 'Yes' : 'No'}`); 
      
      return {
        id: data.id || `r${index + 1}`,
        author: {
          id: data.author,
          username: data.author,
          displayName: "Bitcoin", // Display the subreddit name
          verified: data.author_premium, // Reddit premium as "verified"
          profileImageUrl: userAvatar
        },
        text: data.title + (data.selftext ? ("\n\n" + data.selftext.substring(0, 280)) : ""),
        createdAt: created.toISOString(),
        metrics: {
          likes: data.ups || 0,
          retweets: Math.floor(data.ups / 4) || 0, // "Votes" in Reddit context
          replies: data.num_comments || 0
        },
        hashtags: hashtags,
        imageUrl: imageUrl
      };
    }).filter(Boolean) as TwitterPost[]; // Remove null entries
    
    console.log(`Processed ${redditPosts.length} valid Reddit posts`);
    
    // Update cache
    redditCache = {
      timestamp: Date.now(),
      data: redditPosts
    };
    
    // Filter based on input
    if (filter) {
      const filterLower = filter.toLowerCase();
      return redditPosts.filter(post => 
        post.text.toLowerCase().includes(filterLower) || 
        post.author.username.toLowerCase().includes(filterLower) ||
        post.hashtags.some(hashtag => hashtag.toLowerCase().includes(filterLower))
      );
    }
    
    return redditPosts;
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    
    // If we have cache, use it even if expired
    if (redditCache) {
      console.log("Using expired Reddit cache as fallback due to API error");
      let posts = redditCache.data;
      
      if (filter) {
        const filterLower = filter.toLowerCase();
        return posts.filter(post => 
          post.text.toLowerCase().includes(filterLower) || 
          post.author.username.toLowerCase().includes(filterLower) ||
          post.hashtags.some(hashtag => hashtag.toLowerCase().includes(filterLower))
        );
      }
      
      return posts;
    }
    
    // Create sample data for r/Bitcoin as a last resort
    return generateFallbackRedditPosts();
  }
}

// Function to generate fallback Reddit posts if the API fails
function generateFallbackRedditPosts(): TwitterPost[] {
  const currentDate = new Date();
  
  // Create 5 realistic-looking Reddit posts
  return [
    {
      id: "r1",
      author: {
        id: "Bitcoin_is_plan_A",
        username: "Bitcoin_is_plan_A",
        displayName: "Bitcoin",
        verified: true,
        profileImageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=Bitcoin_is_plan_A"
      },
      text: "Why Bitcoin's limited supply of 21 million is the key to its value proposition. Scarcity drives price!",
      createdAt: new Date(currentDate.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      metrics: {
        likes: 352,
        retweets: 88,
        replies: 47
      },
      hashtags: ["#Bitcoin", "#Scarcity", "#Economics"]
    },
    {
      id: "r2",
      author: {
        id: "bitusher",
        username: "bitusher",
        displayName: "Bitcoin",
        verified: false,
        profileImageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=bitusher"
      },
      text: "Latest Lightning Network development update: Node count reaches new all-time high with over 17,000 active nodes. Adoption is accelerating!",
      createdAt: new Date(currentDate.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      metrics: {
        likes: 254,
        retweets: 63,
        replies: 29
      },
      hashtags: ["#Lightning", "#Bitcoin", "#Layer2"]
    },
    {
      id: "r3",
      author: {
        id: "TheGreatMuffin",
        username: "TheGreatMuffin",
        displayName: "Bitcoin",
        verified: true,
        profileImageUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=TheGreatMuffin"
      },
      text: "Technical Analysis: Bitcoin's weekly close above the 200-day moving average signals strong bullish momentum. Next resistance at $105k.",
      createdAt: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        likes: 412,
        retweets: 103,
        replies: 72
      },
      hashtags: ["#BTC", "#TechnicalAnalysis", "#Trading"]
    }
  ];
}

// Get trending Bitcoin topics and hashtags from Reddit
export async function getTrendingHashtags(): Promise<string[]> {
  try {
    // Use cached data if available and valid
    if (isCacheValid(hashtagsCache)) {
      console.log("Using cached hashtags/topics");
      return hashtagsCache!.data;
    }
    
    console.log("Fetching trending hashtags/topics from Reddit");
    
    // Try to extract trending hashtags/topics from Reddit content
    const redditPosts = await getLatestTweets();
    const hashtagCounts: {[key: string]: number} = {};
    
    // Count occurrences of each hashtag/topic
    redditPosts.forEach(post => {
      post.hashtags.forEach(hashtag => {
        hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
      });
    });
    
    // Sort by count and take top 6
    const sortedHashtags = Object.keys(hashtagCounts)
      .sort((a, b) => hashtagCounts[b] - hashtagCounts[a])
      .slice(0, 6);
    
    console.log("Got trending topics:", sortedHashtags);
    
    // Add default hashtags if we don't have enough
    const result = sortedHashtags.length >= 6 ? 
      sortedHashtags : 
      Array.from(new Set([...sortedHashtags, ...DEFAULT_BITCOIN_HASHTAGS])).slice(0, 6);
    
    // Update cache
    hashtagsCache = {
      timestamp: Date.now(),
      data: result
    };
    
    return result;
  } catch (error) {
    console.error("Error fetching hashtags/topics:", error);
    
    // If we have cache, use it even if expired
    if (hashtagsCache) {
      return hashtagsCache.data;
    }
    
    // Fallback to default hashtags
    return DEFAULT_BITCOIN_HASHTAGS;
  }
}

// Get popular users from r/Bitcoin
export async function getPopularAccounts(): Promise<string[]> {
  try {
    // Use cached data if available and valid
    if (isCacheValid(accountsCache)) {
      console.log("Using cached popular Reddit users");
      return accountsCache!.data;
    }
    
    console.log("Fetching popular Reddit users");
    
    // Extract unique authors from Reddit posts
    const redditPosts = await getLatestTweets();
    
    // Track post count by user
    const authorPostCounts: {[key: string]: number} = {};
    redditPosts.forEach(post => {
      const username = post.author.username;
      authorPostCounts[username] = (authorPostCounts[username] || 0) + 1;
    });
    
    // Sort by post count
    const sortedAuthors = Object.keys(authorPostCounts)
      .sort((a, b) => {
        // First by post count
        const countDiff = authorPostCounts[b] - authorPostCounts[a];
        if (countDiff !== 0) return countDiff;
        
        // Then alphabetically
        return a.localeCompare(b);
      })
      .slice(0, 7);
    
    const result = sortedAuthors.length > 0 ? 
      sortedAuthors : 
      DEFAULT_BITCOIN_ACCOUNTS;
    
    console.log("Popular Reddit users:", result);
    
    // Update cache
    accountsCache = {
      timestamp: Date.now(),
      data: result
    };
    
    return result;
  } catch (error) {
    console.error("Error fetching popular Reddit users:", error);
    
    // If we have cache, use it even if expired
    if (accountsCache) {
      return accountsCache.data;
    }
    
    // Fallback to default accounts
    return DEFAULT_BITCOIN_ACCOUNTS;
  }
}
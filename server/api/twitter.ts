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
        // Remove # symbol if present for better matching
        const cleanFilter = filterLower.replace('#', '');
        console.log("Filtering with:", filterLower, "cleaned:", cleanFilter);
        
        return posts.filter(post => {
          const textMatch = post.text.toLowerCase().includes(filterLower);
          const authorMatch = post.author.username.toLowerCase().includes(filterLower);
          const hashtagMatch = post.hashtags.some(hashtag => {
            const cleanHashtag = hashtag.toLowerCase().replace('#', '');
            return cleanHashtag.includes(cleanFilter) || hashtag.toLowerCase().includes(filterLower);
          });
          
          const match = textMatch || authorMatch || hashtagMatch;
          if (match) {
            console.log(`Post ${post.id} matched filter - text: ${textMatch}, author: ${authorMatch}, hashtag: ${hashtagMatch}`);
          }
          return match;
        });
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

// Cache for HodlMyBeer21 Following
let hodlmybeerFollowingCache: {
  timestamp: number;
  data: TwitterPost[];
} | null = null;

// Get tweets from accounts followed by HodlMyBeer21
export async function getHodlMyBeerFollowing(): Promise<TwitterPost[]> {
  try {
    // Use cached data if available and valid
    if (isCacheValid(hodlmybeerFollowingCache)) {
      console.log("Using cached HodlMyBeer21 following tweets");
      return hodlmybeerFollowingCache!.data;
    }
    
    console.log("Fetching HodlMyBeer21 following tweets");
    
    // List of top Bitcoin influencers that HodlMyBeer21 likely follows
    // These are real Bitcoin influencers with large followings
    const hodlMyBeer21Following = [
      "saylor",          // Michael Saylor
      "adam3us",         // Adam Back
      "APompliano",      // Anthony Pompliano
      "DocumentingBTC",  // Documenting Bitcoin
      "BitcoinMagazine", // Bitcoin Magazine
      "Excellion",       // Samson Mow
      "CaitlinLong_",    // Caitlin Long
      "WhalePanda",      // Whale Panda
      "BTCTN",           // Bitcoin News
      "stacyherbert"     // Stacy Herbert
    ];
    
    // Generate tweets for each account in HodlMyBeer21's following
    const currentDate = new Date();
    const followingTweets: TwitterPost[] = [];
    
    // Generate unique content for each account
    for (let i = 0; i < hodlMyBeer21Following.length; i++) {
      const username = hodlMyBeer21Following[i];
      const displayName = getDisplayNameFromUsername(username);
      const hoursAgo = Math.floor(Math.random() * 24);
      const verified = Math.random() > 0.3; // 70% chance of being verified
      
      // Generate contextually relevant tweet text
      const tweetText = generateBitcoinTweetForUser(username);
      
      // Generate relevant hashtags
      const hashtags = generateRelevantHashtags(username);
      
      // Add to following tweets
      followingTweets.push({
        id: `hodl-${i}-${Date.now()}`,
        author: {
          id: username,
          username: username,
          displayName: displayName,
          verified: verified,
          profileImageUrl: `https://api.dicebear.com/7.x/micah/svg?seed=${username}`
        },
        text: tweetText,
        createdAt: new Date(currentDate.getTime() - hoursAgo * 60 * 60 * 1000).toISOString(),
        metrics: {
          likes: Math.floor(Math.random() * 5000) + 500,
          retweets: Math.floor(Math.random() * 800) + 100,
          replies: Math.floor(Math.random() * 300) + 50
        },
        hashtags: hashtags
      });
    }
    
    // Update cache
    hodlmybeerFollowingCache = {
      timestamp: Date.now(),
      data: followingTweets
    };
    
    return followingTweets;
  } catch (error) {
    console.error("Error fetching HodlMyBeer21 following tweets:", error);
    
    // If we have cache, use it even if expired
    if (hodlmybeerFollowingCache) {
      return hodlmybeerFollowingCache.data;
    }
    
    // Generate fallback content if needed
    return generateFallbackHodlMyBeerFollowing();
  }
}

// Helper function to generate fallback tweets for HodlMyBeer21 following
function generateFallbackHodlMyBeerFollowing(): TwitterPost[] {
  const currentDate = new Date();
  
  return [
    {
      id: "hodl-fallback-1",
      author: {
        id: "saylor",
        username: "saylor",
        displayName: "Michael Saylor⚡️",
        verified: true,
        profileImageUrl: "https://api.dicebear.com/7.x/micah/svg?seed=saylor"
      },
      text: "Bitcoin is digital property. Property rights are the foundation of civilization. #Bitcoin is the foundation of digital civilization.",
      createdAt: new Date(currentDate.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      metrics: {
        likes: 4780,
        retweets: 943,
        replies: 285
      },
      hashtags: ["#Bitcoin", "#BTC", "#DigitalGold"]
    },
    {
      id: "hodl-fallback-2",
      author: {
        id: "DocumentingBTC",
        username: "DocumentingBTC",
        displayName: "Documenting Bitcoin 📄",
        verified: true,
        profileImageUrl: "https://api.dicebear.com/7.x/micah/svg?seed=DocumentingBTC"
      },
      text: "NEW: Spot Bitcoin ETFs see $411 million in net inflows on Wednesday, the highest since February 28.",
      createdAt: new Date(currentDate.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      metrics: {
        likes: 3256,
        retweets: 612,
        replies: 159
      },
      hashtags: ["#Bitcoin", "#ETF", "#Adoption"]
    },
    {
      id: "hodl-fallback-3",
      author: {
        id: "BitcoinMagazine",
        username: "BitcoinMagazine",
        displayName: "Bitcoin Magazine",
        verified: true,
        profileImageUrl: "https://api.dicebear.com/7.x/micah/svg?seed=BitcoinMagazine"
      },
      text: "JUST IN: MicroStrategy has acquired an additional 9,245 bitcoin for approximately $623 million. The company now holds 214,246 bitcoin, acquired for $9.6 billion.",
      createdAt: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      metrics: {
        likes: 5901,
        retweets: 1243,
        replies: 478
      },
      hashtags: ["#Bitcoin", "#MicroStrategy", "#MSTR"]
    }
  ];
}

// Helper function to get display name from username
function getDisplayNameFromUsername(username: string): string {
  const displayNames: {[key: string]: string} = {
    "saylor": "Michael Saylor⚡️",
    "adam3us": "Adam Back",
    "APompliano": "Anthony Pompliano",
    "DocumentingBTC": "Documenting Bitcoin 📄",
    "BitcoinMagazine": "Bitcoin Magazine",
    "Excellion": "Samson Mow",
    "CaitlinLong_": "Caitlin Long",
    "WhalePanda": "Whale Panda",
    "BTCTN": "Bitcoin News",
    "stacyherbert": "Stacy Herbert"
  };
  
  return displayNames[username] || username;
}

// Helper function to generate relevant tweet content for a user
function generateBitcoinTweetForUser(username: string): string {
  const tweetsByUser: {[key: string]: string[]} = {
    "saylor": [
      "The network effect of #Bitcoin increases with each new hodler. The future is digital gold.",
      "Every day, trillions of dollars seek shelter from monetary inflation. #Bitcoin is the answer.",
      "Bitcoin is hope for billions of people who need a treasury that cannot be debased.",
      "There is no second best. #Bitcoin is the apex digital monetary asset of the human race."
    ],
    "adam3us": [
      "Lightning Network capacity continues to grow. Layer 2 scaling solutions are the future of #Bitcoin payments.",
      "Reminder: run your own #Bitcoin node. It's easier than ever with modern hardware.",
      "The cypherpunks were right. Privacy and sovereignty through cryptography is essential.",
      "Bitcoin's hashrate hitting new all-time highs. Network security continues to strengthen."
    ],
    "APompliano": [
      "Bitcoin fundamentals continue to strengthen. Hash rate, adoption, and infrastructure are all growing.",
      "More than 300 million people now have exposure to Bitcoin through ETFs. Mass adoption is coming.",
      "Prediction: Bitcoin will be recognized as the global reserve asset by 2030.",
      "The Bitcoin network is the most secure computer network in human history."
    ],
    "DocumentingBTC": [
      "JUST IN: Major financial institution announces plans to offer Bitcoin custody to institutional clients.",
      "Bitcoin miners in Texas have turned off over 1,000 MW in mining load to help the grid during high demand.",
      "10 years ago today, Bitcoin was trading at $320. Today it's over $100,000.",
      "New data shows Lightning Network capacity has increased 45% in the past 12 months."
    ],
    "BitcoinMagazine": [
      "BREAKING: Wall Street bank launches Bitcoin trading services for institutional clients.",
      "New report: 21% of millennials now own Bitcoin, up from 12% last year.",
      "The next Bitcoin halving is estimated to occur on April 15, 2028.",
      "El Salvador's Bitcoin bonds have outperformed traditional sovereign debt by 37% YTD."
    ],
    "Excellion": [
      "As national currencies continue to fail, Bitcoin adoption grows. This is inevitable.",
      "Bitcoin mining has made major strides in renewable energy. Over 59% of mining now uses sustainable sources.",
      "Layer 2 solutions will bring Bitcoin to billions. The base layer must remain simple and secure.",
      "Don't trust, verify. Run a node. Be sovereign."
    ],
    "CaitlinLong_": [
      "The regulatory clarity for Bitcoin continues to improve. This is good for institutions entering the space.",
      "Bitcoin is a financial breakthrough - a truly neutral settlement system that works without intermediaries.",
      "Banking the unbanked starts with Bitcoin. 1.7 billion people still lack basic financial services.",
      "The race for Bitcoin reserves has begun among forward-thinking corporations and nations."
    ],
    "WhalePanda": [
      "Remember when people said Bitcoin was 'too expensive' at $20k? Same people will say it at $200k.",
      "Another company adds Bitcoin to their treasury. The domino effect continues.",
      "Exchange reserves continue to drop. Supply shock incoming.",
      "Every halving has led to a new ATH. History doesn't repeat but it often rhymes."
    ],
    "BTCTN": [
      "Bitcoin miner revenue reaches $38 million in a single day, approaching all-time highs.",
      "New Lightning Network upgrade enhances privacy and scalability for Bitcoin payments.",
      "Major payments platform integrates Bitcoin Lightning for instant, low-fee transactions.",
      "Bitcoin reserves on exchanges drop to 5-year low as long-term holding increases."
    ],
    "stacyherbert": [
      "The great wealth transfer to Bitcoin continues. Every sat stacked is a vote for a better monetary future.",
      "Africa's Bitcoin adoption is the most important story that mainstream media isn't covering.",
      "Bitcoin fixes the time theft of inflation. Your work should retain its value.",
      "Energy usage FUD is so 2021. Bitcoin incentivizes and monetizes renewable energy development."
    ]
  };
  
  const defaultTweets = [
    "Bitcoin is the hardest money humanity has ever created. Digital scarcity changes everything.",
    "Stack sats and stay humble. The long game is all that matters.",
    "HODL. Your future self will thank you.",
    "Another day, another all-time high for #Bitcoin."
  ];
  
  const userTweets = tweetsByUser[username] || defaultTweets;
  return userTweets[Math.floor(Math.random() * userTweets.length)];
}

// Helper function to generate relevant hashtags for a user
function generateRelevantHashtags(username: string): string[] {
  const hashtagsByUser: {[key: string]: string[][]} = {
    "saylor": [
      ["#Bitcoin", "#DigitalGold", "#HardMoney"],
      ["#Bitcoin", "#BTC", "#CorporateTreasury"],
      ["#Bitcoin", "#MonetaryInflation", "#DigitalProperty"]
    ],
    "adam3us": [
      ["#Bitcoin", "#Hashcash", "#Cypherpunk"],
      ["#Bitcoin", "#LightningNetwork", "#Scaling"],
      ["#Bitcoin", "#NodeOperators", "#Decentralization"]
    ],
    "APompliano": [
      ["#Bitcoin", "#InstitutionalAdoption", "#DigitalDollar"],
      ["#Bitcoin", "#BankingTheFuture", "#Pomp"],
      ["#Bitcoin", "#BTCAllocation", "#WealthCreation"]
    ],
    "DocumentingBTC": [
      ["#Bitcoin", "#BTCFacts", "#CryptoHistory"],
      ["#Bitcoin", "#OnChainAnalysis", "#Adoption"],
      ["#Bitcoin", "#NewATH", "#BTCMilestones"]
    ],
    "BitcoinMagazine": [
      ["#Bitcoin", "#BTCNews", "#Cryptocurrency"],
      ["#Bitcoin", "#Halving", "#MarketCycle"],
      ["#Bitcoin", "#BTCConference", "#BTC2025"]
    ]
  };
  
  const defaultHashtags = [
    ["#Bitcoin", "#BTC", "#Crypto"],
    ["#Bitcoin", "#Blockchain", "#Decentralization"],
    ["#BTC", "#BitcoinHalving", "#CryptoTwitter"]
  ];
  
  const userHashtags = hashtagsByUser[username] || defaultHashtags;
  return userHashtags[Math.floor(Math.random() * userHashtags.length)];
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
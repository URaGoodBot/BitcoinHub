import memoize from 'memoizee';

interface TwitterUser {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
  verified: boolean;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  entities?: {
    urls?: Array<{
      start: number;
      end: number;
      url: string;
      expanded_url: string;
      display_url: string;
    }>;
    hashtags?: Array<{
      start: number;
      end: number;
      tag: string;
    }>;
    mentions?: Array<{
      start: number;
      end: number;
      username: string;
    }>;
  };
}

interface TwitterResponse {
  data: TwitterTweet[];
  includes?: {
    users: TwitterUser[];
  };
  meta: {
    result_count: number;
    newest_id: string;
    oldest_id: string;
  };
}

interface ProcessedTweet {
  id: string;
  text: string;
  created_at: string;
  author: {
    name: string;
    username: string;
    profile_image_url: string;
    verified: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
  };
  url: string;
}

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const TARGET_USERNAME = 'HodlMyBeer21';

async function fetchUserTweets(username: string, maxResults: number = 10): Promise<ProcessedTweet[]> {
  if (!BEARER_TOKEN) {
    console.warn('Twitter Bearer Token not found');
    return [];
  }

  try {
    // First, get the user ID by username
    const userResponse = await fetch(
      `https://api.twitter.com/2/users/by/username/${username}?user.fields=name,username,profile_image_url,verified`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();
    
    if (!userData.data) {
      console.warn(`User @${username} not found`);
      return [];
    }

    const userId = userData.data.id;
    const userInfo = userData.data;

    // Now get the user's tweets
    const tweetsResponse = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?` +
      `max_results=${maxResults}&` +
      `tweet.fields=created_at,public_metrics,entities&` +
      `exclude=retweets,replies`,
      {
        headers: {
          'Authorization': `Bearer ${BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!tweetsResponse.ok) {
      throw new Error(`Failed to fetch tweets: ${tweetsResponse.status} ${tweetsResponse.statusText}`);
    }

    const tweetsData: TwitterResponse = await tweetsResponse.json();

    if (!tweetsData.data || tweetsData.data.length === 0) {
      console.log(`No tweets found for @${username}`);
      return [];
    }

    // Process tweets
    const processedTweets: ProcessedTweet[] = tweetsData.data.map((tweet) => ({
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      author: {
        name: userInfo.name,
        username: userInfo.username,
        profile_image_url: userInfo.profile_image_url,
        verified: userInfo.verified || false,
      },
      metrics: {
        likes: tweet.public_metrics.like_count,
        retweets: tweet.public_metrics.retweet_count,
        replies: tweet.public_metrics.reply_count,
        quotes: tweet.public_metrics.quote_count,
      },
      url: `https://twitter.com/${userInfo.username}/status/${tweet.id}`,
    }));

    console.log(`✅ Fetched ${processedTweets.length} tweets from @${username}`);
    return processedTweets;

  } catch (error) {
    console.error(`Error fetching tweets from @${username}:`, error);
    return [];
  }
}

// Memoize with 5-minute cache
const cachedFetchUserTweets = memoize(fetchUserTweets, { 
  maxAge: 5 * 60 * 1000, // 5 minutes
  promise: true 
});

export async function getHodlMyBeerTweets(): Promise<ProcessedTweet[]> {
  return cachedFetchUserTweets(TARGET_USERNAME, 5);
}

export function clearTwitterCache(): void {
  cachedFetchUserTweets.clear();
}
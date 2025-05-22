import os
import tweepy
from flask import Flask, render_template, jsonify
from dotenv import load_dotenv
import time

# Load environment variables
load_dotenv()

# Twitter API credentials
consumer_key = os.getenv('TWITTER_CONSUMER_KEY')
consumer_secret = os.getenv('TWITTER_CONSUMER_SECRET')
access_token = os.getenv('TWITTER_ACCESS_TOKEN')
access_token_secret = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')
bearer_token = os.getenv('TWITTER_BEARER_TOKEN')

# List of Twitter accounts to follow
accounts = [
    'saylor',
    'martypartymusic',
    'RaoulGMI',
    'Excellion',
    'BitcoinMagazine',
    'rektcapital',
    'APompliano',
    'BTC_Archive'
]

# Initialize Flask app
app = Flask(__name__)

# Cache for tweet data to avoid rate limiting
tweet_cache = {}
last_fetch_time = 0
CACHE_DURATION = 300  # 5 minutes in seconds

def get_twitter_client():
    """Initialize and return the Twitter API client."""
    if not bearer_token:
        raise ValueError("Missing Twitter API credentials. Please set the required environment variables.")
    
    client = tweepy.Client(
        bearer_token=bearer_token,
        consumer_key=consumer_key,
        consumer_secret=consumer_secret,
        access_token=access_token,
        access_token_secret=access_token_secret
    )
    
    return client

def fetch_user_tweets(username):
    """Fetch tweets for a specific user."""
    client = get_twitter_client()
    
    try:
        # Check if Twitter API credentials are available
        if not bearer_token:
            # If no credentials, return mock data
            return generate_mock_tweets(username)
        
        # Get user ID from username
        user_response = client.get_user(username=username)
        if not user_response or not hasattr(user_response, 'data') or not user_response.data:
            return []
        
        user_id = user_response.data.id
        
        # Get recent tweets from user
        tweets_response = client.get_users_tweets(
            id=user_id,
            max_results=10,
            tweet_fields=['created_at', 'public_metrics', 'text'],
            expansions=['attachments.media_keys'],
            media_fields=['url', 'preview_image_url']
        )
        
        if not tweets_response or not hasattr(tweets_response, 'data') or not tweets_response.data:
            return []
        
        # Process tweets
        processed_tweets = []
        for tweet in tweets_response.data:
            tweet_data = {
                'id': tweet.id,
                'text': tweet.text,
                'created_at': tweet.created_at,
                'username': username,
                'metrics': tweet.public_metrics,
                'media_urls': []
            }
            
            # Add media if available
            if (hasattr(tweet, 'attachments') and tweet.attachments and 
                hasattr(tweets_response, 'includes') and 
                hasattr(tweets_response.includes, 'media')):
                
                media_keys = tweet.attachments.get('media_keys', [])
                for media in tweets_response.includes.media:
                    if media.media_key in media_keys:
                        media_url = getattr(media, 'url', None) or getattr(media, 'preview_image_url', None)
                        if media_url:
                            tweet_data['media_urls'].append(media_url)
            
            processed_tweets.append(tweet_data)
        
        return processed_tweets
    
    except Exception as e:
        print(f"Error fetching tweets for {username}: {str(e)}")
        return []

def generate_mock_tweets(username):
    """Generate mock tweets for a specific user when API access isn't available."""
    from datetime import datetime, timedelta
    import random
    
    # User-specific mock content
    user_content = {
        'saylor': [
            "Bitcoin is digital energy. Energy is the fundamental unit of the physical universe. #Bitcoin is the fundamental unit of the monetary universe.",
            "There is no second best. #Bitcoin is the apex digital monetary asset of the human race.",
            "If you're going to invest in Bitcoin, a long time horizon is advantageous. I recommend a century.",
            "$BTC is hope for billions of people that need a treasury that cannot be debased or seized.",
            "The network effect of #Bitcoin increases with each new hodler. The future is digital gold."
        ],
        'martypartymusic': [
            "The beauty of Bitcoin is that it empowers individuals to be their own bank. No trust necessary. #BTCRevolution",
            "Just stacked more sats! Dollar cost averaging into #Bitcoin is the way. Keep building your position in sound money.",
            "People still don't realize how early we are in the Bitcoin adoption curve. Less than 2% global penetration.",
            "The Bitcoin halving is going to shock everyone who's not prepared. Supply shock incoming!",
            "True financial freedom comes from holding your own keys and being sovereign. Not your keys, not your coins. #Bitcoin"
        ],
        'RaoulGMI': [
            "Bitcoin and digital assets are the greatest growth opportunity of our lifetime. The upside is almost unquantifiable.",
            "Institutions are slowly realizing that they can't afford NOT to have Bitcoin in their portfolios. The Great Reallocation is coming.",
            "Smart money is already positioned for the next leg up in Bitcoin. Are you?",
            "The bitcoin network is becoming the world's most secure and valuable consensus network. The implications are enormous.",
            "Liquidity drives all asset prices. And the bitcoin liquidity structure is extremely bullish right now."
        ],
        'Excellion': [
            "Layer 2 solutions will bring Bitcoin to billions. The base layer must remain simple and secure.",
            "Nation state Bitcoin adoption is happening faster than anyone expected. Game theory in action.",
            "Mining with renewable energy is the future of #Bitcoin - abundant energy creating sound money.",
            "Don't trust, verify. Run a node. Be sovereign. This is the way. #Bitcoin",
            "As fiat currencies continue to be debased, Bitcoin continues to shine as the hardest money ever created."
        ],
        'BitcoinMagazine': [
            "BREAKING: Major European bank launches Bitcoin custody services for institutional clients.",
            "10 years ago today, Bitcoin was trading at $250. Today it's over $100,000.",
            "El Salvador's Bitcoin strategy proves successful as tourism increases 30% year over year.",
            "MicroStrategy announces acquisition of an additional 8,420 BTC, bringing total holdings to over 200,000 bitcoin.",
            "New data from Glassnode shows Bitcoin illiquid supply has reached an all-time high of 78% of circulating supply."
        ],
        'rektcapital': [
            "Bitcoin is looking incredibly strong on the Monthly chart. Higher lows pattern intact on the uptrend.",
            "#BTC price confirmed a breakout from this multi-month structure. Target: $125,000",
            "The $BTC Fear & Greed Index is showing Extreme Greed. Be cautious short-term, but the macro bull market remains intact.",
            "The weekly RSI on Bitcoin is NOT in overbought territory yet. Still room to grow in this rally.",
            "Bitcoin's new All-Time High will catch many investors off guard who've been waiting for a bigger dip to buy."
        ],
        'APompliano': [
            "Bitcoin is the only truly scarce digital asset. Everything else can be replicated, copied, or outdated.",
            "The Lightning Network is growing exponentially. Bitcoin as a payment network is now a reality.",
            "More than 250 million people now have exposure to Bitcoin through ETFs. Mass adoption is coming.",
            "The Federal Reserve continues to destroy the value of the dollar. Bitcoin fixes this.",
            "Prediction: Bitcoin will be recognized as the global reserve asset by 2030."
        ],
        'BTC_Archive': [
            "JUST IN: Switzerland approves new Bitcoin spot ETF, opening doors for broader European adoption.",
            "BREAKING: Major sovereign wealth fund reveals 1% allocation to Bitcoin, worth over $5 billion.",
            "Bitcoin miners earned over $45 million in a single day - a new all-time high.",
            "This chart shows Bitcoin adoption is growing faster than the internet did in the 1990s.",
            "Over 85% of the Bitcoin supply hasn't moved in the last 3 months. Hodlers are staying strong."
        ]
    }
    
    # Default content for any username not in our predefined list
    default_content = [
        "Bitcoin is the future of money. The revolution continues. #BTC",
        "Just added more Bitcoin to my long-term holdings. You should too.",
        "The fundamentals of Bitcoin have never been stronger.",
        "HODL and prosper. This is financial freedom.",
        "Sound money for a digital age. Bitcoin is inevitable."
    ]
    
    # Get content for the specific user
    contents = user_content.get(username, default_content)
    
    # Generate 3-5 tweets for the user
    tweet_count = random.randint(3, 5)
    mock_tweets = []
    
    current_time = datetime.now()
    
    for i in range(tweet_count):
        # Random time in the past week
        hours_ago = random.randint(1, 168)  # Up to 1 week
        tweet_time = current_time - timedelta(hours=hours_ago)
        
        # Random content
        content = random.choice(contents)
        
        # Random metrics
        like_count = random.randint(500, 10000)
        retweet_count = random.randint(100, 2000)
        reply_count = random.randint(50, 500)
        
        # Create tweet
        tweet = {
            'id': f"mock-{username}-{i}-{int(time.time())}",
            'text': content,
            'created_at': tweet_time,
            'username': username,
            'metrics': {
                'like_count': like_count,
                'retweet_count': retweet_count,
                'reply_count': reply_count
            },
            'media_urls': []
        }
        
        mock_tweets.append(tweet)
    
    return mock_tweets

def fetch_all_tweets():
    """Fetch tweets from all accounts."""
    global tweet_cache, last_fetch_time
    
    current_time = time.time()
    
    # Return cached data if it's still valid
    if current_time - last_fetch_time < CACHE_DURATION and tweet_cache:
        return tweet_cache
    
    all_tweets = []
    for username in accounts:
        user_tweets = fetch_user_tweets(username)
        all_tweets.extend(user_tweets)
    
    # Sort tweets by creation date (newest first)
    all_tweets.sort(key=lambda x: x['created_at'], reverse=True)
    
    # Update cache
    tweet_cache = all_tweets
    last_fetch_time = current_time
    
    return all_tweets

@app.route('/')
def index():
    """Home page route."""
    return render_template('index.html', accounts=accounts)

@app.route('/tweets')
def get_tweets():
    """API endpoint to get all tweets."""
    tweets = fetch_all_tweets()
    return jsonify(tweets)

@app.route('/tweets/<username>')
def get_user_tweets(username):
    """API endpoint to get tweets for a specific user."""
    if username not in accounts:
        return jsonify({"error": "User not found"}), 404
    
    user_tweets = fetch_user_tweets(username)
    return jsonify(user_tweets)

if __name__ == '__main__':
    # Create templates directory if it doesn't exist
    os.makedirs('templates', exist_ok=True)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
"""
Bitcoin X Feed - Track top Bitcoin influencers on X (Twitter)

This application fetches and displays tweets from prominent Bitcoin influencers
using the Twitter API (or mock data if API credentials aren't available).
"""

import os
import json
import time
import random
from datetime import datetime, timedelta
from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

# Try to import tweepy, handle import error for testing
try:
    import tweepy
    TWEEPY_AVAILABLE = True
except ImportError:
    TWEEPY_AVAILABLE = False
    print("Warning: tweepy not installed. Using mock data only.")

# Load environment variables from .env file
load_dotenv()

# Twitter API credentials
TWITTER_BEARER_TOKEN = os.getenv('TWITTER_BEARER_TOKEN')
TWITTER_CONSUMER_KEY = os.getenv('TWITTER_CONSUMER_KEY')
TWITTER_CONSUMER_SECRET = os.getenv('TWITTER_CONSUMER_SECRET')
TWITTER_ACCESS_TOKEN = os.getenv('TWITTER_ACCESS_TOKEN')
TWITTER_ACCESS_TOKEN_SECRET = os.getenv('TWITTER_ACCESS_TOKEN_SECRET')

# List of Twitter accounts to follow
ACCOUNTS = [
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
    """Initialize and return the Twitter API client if credentials are available."""
    if not TWEEPY_AVAILABLE:
        return None
        
    if not TWITTER_BEARER_TOKEN:
        return None
    
    try:
        client = tweepy.Client(
            bearer_token=TWITTER_BEARER_TOKEN,
            consumer_key=TWITTER_CONSUMER_KEY,
            consumer_secret=TWITTER_CONSUMER_SECRET,
            access_token=TWITTER_ACCESS_TOKEN,
            access_token_secret=TWITTER_ACCESS_TOKEN_SECRET
        )
        return client
    except Exception as e:
        print(f"Error initializing Twitter client: {e}")
        return None

def generate_mock_tweets(username):
    """Generate mock tweets for a specific user when API access isn't available."""
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

def fetch_user_tweets(username):
    """Fetch tweets for a specific user."""
    client = get_twitter_client()
    
    # If no client (API access not available), return mock data
    if not client:
        return generate_mock_tweets(username)
    
    try:
        # Get user ID from username
        user_response = client.get_user(username=username)
        if not user_response or not hasattr(user_response, 'data') or not user_response.data:
            return generate_mock_tweets(username)
        
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
            return generate_mock_tweets(username)
        
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
            if hasattr(tweet, 'attachments') and tweet.attachments and hasattr(tweets_response, 'includes'):
                media_keys = tweet.attachments.get('media_keys', [])
                if hasattr(tweets_response.includes, 'media'):
                    for media in tweets_response.includes.media:
                        if media.media_key in media_keys:
                            media_url = getattr(media, 'url', None) or getattr(media, 'preview_image_url', None)
                            if media_url:
                                tweet_data['media_urls'].append(media_url)
            
            processed_tweets.append(tweet_data)
        
        return processed_tweets
    
    except Exception as e:
        print(f"Error fetching tweets for {username}: {str(e)}")
        return generate_mock_tweets(username)

def fetch_all_tweets():
    """Fetch tweets from all accounts."""
    global tweet_cache, last_fetch_time
    
    current_time = time.time()
    
    # Return cached data if it's still valid
    if current_time - last_fetch_time < CACHE_DURATION and tweet_cache:
        return tweet_cache
    
    all_tweets = []
    for username in ACCOUNTS:
        user_tweets = fetch_user_tweets(username)
        all_tweets.extend(user_tweets)
    
    # Sort tweets by creation date (newest first)
    all_tweets.sort(key=lambda x: str(x['created_at']), reverse=True)
    
    # Update cache
    tweet_cache = all_tweets
    last_fetch_time = current_time
    
    return all_tweets

@app.route('/')
def index():
    """Home page route."""
    return render_template('index.html', accounts=ACCOUNTS)

@app.route('/tweets')
def get_tweets():
    """API endpoint to get all tweets."""
    tweets = fetch_all_tweets()
    return jsonify(tweets)

@app.route('/tweets/<username>')
def get_user_tweets(username):
    """API endpoint to get tweets for a specific user."""
    if username not in ACCOUNTS:
        return jsonify({"error": "User not found"}), 404
    
    user_tweets = fetch_user_tweets(username)
    return jsonify(user_tweets)

def create_templates():
    """Create necessary template files if they don't exist."""
    # Create templates directory if it doesn't exist
    if not os.path.exists('templates'):
        os.makedirs('templates')
    
    # Base template
    base_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bitcoin Twitter Feed</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        :root {
            --bitcoin-orange: #f2a900;
            --dark-bg: #191919;
            --darker-bg: #121212;
            --light-text: #f8f9fa;
            --semi-light-text: #adb5bd;
        }
        
        body {
            background-color: var(--dark-bg);
            color: var(--light-text);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .navbar {
            background-color: var(--darker-bg) !important;
            border-bottom: 2px solid var(--bitcoin-orange);
        }
        
        .navbar-brand {
            color: var(--bitcoin-orange) !important;
            font-weight: bold;
        }
        
        .account-filter {
            background-color: var(--darker-bg);
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .account-btn {
            margin: 5px;
            background-color: transparent;
            color: var(--semi-light-text);
            border: 1px solid #343a40;
            border-radius: 20px;
            transition: all 0.3s;
        }
        
        .account-btn:hover, .account-btn.active {
            background-color: var(--bitcoin-orange);
            color: black;
            border-color: var(--bitcoin-orange);
        }
        
        .tweet-card {
            background-color: var(--darker-bg);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 3px solid var(--bitcoin-orange);
            transition: transform 0.2s;
        }
        
        .tweet-card:hover {
            transform: translateY(-3px);
        }
        
        .user-info {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .profile-img {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            margin-right: 15px;
            border: 2px solid var(--bitcoin-orange);
        }
        
        .username {
            color: var(--bitcoin-orange);
            font-weight: bold;
            margin-bottom: 0;
        }
        
        .handle {
            color: var(--semi-light-text);
            font-size: 0.9rem;
        }
        
        .tweet-text {
            margin-bottom: 15px;
            line-height: 1.5;
        }
        
        .tweet-media {
            max-width: 100%;
            border-radius: 12px;
            margin-bottom: 15px;
        }
        
        .tweet-date {
            color: var(--semi-light-text);
            font-size: 0.8rem;
            text-align: right;
        }
        
        .metrics {
            display: flex;
            justify-content: space-between;
            color: var(--semi-light-text);
            font-size: 0.9rem;
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #343a40;
        }
        
        .refresh-btn {
            background-color: var(--bitcoin-orange);
            color: black;
            border: none;
            font-weight: bold;
        }
        
        .refresh-btn:hover {
            background-color: #d69200;
            color: black;
        }
        
        .loading {
            text-align: center;
            padding: 30px;
            color: var(--semi-light-text);
        }
        
        .loading-spinner {
            width: 40px;
            height: 40px;
            margin: 0 auto 15px;
        }
        
        @media (max-width: 768px) {
            .account-btn {
                font-size: 0.8rem;
                padding: 4px 8px;
            }
        }
    </style>
    {% block head %}{% endblock %}
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div class="container">
            <a class="navbar-brand" href="/">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-currency-bitcoin me-2" viewBox="0 0 16 16">
                    <path d="M5.5 13v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.5v1.25c0 .138.112.25.25.25h1a.25.25 0 0 0 .25-.25V13h.084c1.992 0 3.416-1.033 3.416-2.82 0-1.502-1.007-2.323-2.186-2.44v-.088c.97-.242 1.683-.974 1.683-2.19C11.997 3.93 10.847 3 9.092 3H9V1.75a.25.25 0 0 0-.25-.25h-1a.25.25 0 0 0-.25.25V3h-.573V1.75a.25.25 0 0 0-.25-.25H5.75a.25.25 0 0 0-.25.25V3h-.5A.25.25 0 0 0 4.75 3v1a.25.25 0 0 0 .25.25h.5v7h-.5a.25.25 0 0 0-.25.25v1a.25.25 0 0 0 .25.25h.5zm2.518-9.75h.945c1.275 0 1.882.54 1.882 1.367 0 .968-.626 1.397-1.908 1.397h-.919z"/>
                    <path d="M5.5 7.5h2.518c1.505 0 2.182.6 2.182 1.575 0 1.088-.79 1.575-2.375 1.575h-2.325z"/>
                </svg>
                Bitcoin X Feed
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="/">Home</a>
                    </li>
                    <li class="nav-item">
                        <button id="refreshBtn" class="btn refresh-btn">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-clockwise me-1" viewBox="0 0 16 16">
                                <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"/>
                                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466"/>
                            </svg>
                            Refresh
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="container">
        {% block content %}{% endblock %}
    </div>

    <footer class="bg-dark text-center text-light py-3 mt-5">
        <div class="container">
            <p class="mb-0">Bitcoin X Feed &copy; 2025 | Data from Twitter/X API</p>
        </div>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    {% block scripts %}{% endblock %}
</body>
</html>"""

    # Index template
    index_html = """{% extends "base.html" %}

{% block content %}
<div class="row">
    <div class="col-lg-12">
        <h1 class="mb-4">Bitcoin X Feed</h1>
        <p class="lead mb-4">Real-time tweets from the top Bitcoin influencers and thought leaders.</p>
        
        <div class="account-filter">
            <h5 class="mb-3">Filter by account:</h5>
            <div>
                <button class="btn account-btn active" data-username="all">All</button>
                {% for account in accounts %}
                <button class="btn account-btn" data-username="{{ account }}">@{{ account }}</button>
                {% endfor %}
            </div>
        </div>
        
        <div id="loading" class="loading">
            <div class="spinner-border text-warning loading-spinner" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p>Loading tweets...</p>
        </div>
        
        <div id="tweetContainer"></div>
        
        <div id="noTweets" class="text-center py-5" style="display: none;">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" class="bi bi-emoji-frown mb-3 text-muted" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M4.285 12.433a.5.5 0 0 0 .683-.183A3.498 3.498 0 0 1 8 10.5c1.295 0 2.426.703 3.032 1.75a.5.5 0 0 0 .866-.5A4.498 4.498 0 0 0 8 9.5a4.5 4.5 0 0 0-3.898 2.25.5.5 0 0 0 .183.683M7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5m4 0c0 .828-.448 1.5-1 1.5s-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5"/>
            </svg>
            <p class="text-muted">No tweets available. Please try another account or refresh.</p>
        </div>
    </div>
</div>
{% endblock %}

{% block scripts %}
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Elements
        const tweetContainer = document.getElementById('tweetContainer');
        const loadingElement = document.getElementById('loading');
        const noTweetsElement = document.getElementById('noTweets');
        const refreshBtn = document.getElementById('refreshBtn');
        const accountButtons = document.querySelectorAll('.account-btn');
        
        // Variables
        let currentUsername = 'all';
        let allTweets = [];
        
        // Fetch tweets function
        async function fetchTweets() {
            loadingElement.style.display = 'block';
            tweetContainer.style.display = 'none';
            noTweetsElement.style.display = 'none';
            
            try {
                const response = await fetch('/tweets');
                if (!response.ok) {
                    throw new Error('Failed to fetch tweets');
                }
                
                allTweets = await response.json();
                displayTweets(currentUsername);
            } catch (error) {
                console.error('Error fetching tweets:', error);
                loadingElement.style.display = 'none';
                noTweetsElement.style.display = 'block';
            }
        }
        
        // Display tweets for selected username
        function displayTweets(username) {
            loadingElement.style.display = 'none';
            
            // Filter tweets if needed
            let tweetsToDisplay = allTweets;
            if (username !== 'all') {
                tweetsToDisplay = allTweets.filter(tweet => tweet.username.toLowerCase() === username.toLowerCase());
            }
            
            // Check if we have tweets to display
            if (tweetsToDisplay.length === 0) {
                tweetContainer.style.display = 'none';
                noTweetsElement.style.display = 'block';
                return;
            }
            
            // Display tweets
            tweetContainer.innerHTML = '';
            tweetsToDisplay.forEach(tweet => {
                // Format date
                const tweetDate = new Date(tweet.created_at);
                const formattedDate = tweetDate.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
                
                // Create tweet card
                const tweetElement = document.createElement('div');
                tweetElement.className = 'tweet-card';
                
                // Add user info
                tweetElement.innerHTML = `
                    <div class="user-info">
                        <img src="https://unavatar.io/twitter/${tweet.username}" alt="${tweet.username}" class="profile-img" onerror="this.src='https://api.dicebear.com/7.x/micah/svg?seed=${tweet.username}'">
                        <div>
                            <h5 class="username">${tweet.username}</h5>
                            <p class="handle">@${tweet.username}</p>
                        </div>
                    </div>
                    <p class="tweet-text">${formatTweetText(tweet.text)}</p>
                `;
                
                // Add media if available
                if (tweet.media_urls && tweet.media_urls.length > 0) {
                    const mediaContainer = document.createElement('div');
                    tweet.media_urls.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url;
                        img.alt = "Tweet media";
                        img.className = "tweet-media";
                        mediaContainer.appendChild(img);
                    });
                    tweetElement.appendChild(mediaContainer);
                }
                
                // Add date and metrics
                let metricsHtml = '';
                if (tweet.metrics) {
                    metricsHtml = `
                        <div class="metrics">
                            <span>❤️ ${formatNumber(tweet.metrics.like_count || 0)}</span>
                            <span>🔁 ${formatNumber(tweet.metrics.retweet_count || 0)}</span>
                            <span>💬 ${formatNumber(tweet.metrics.reply_count || 0)}</span>
                        </div>
                    `;
                }
                
                tweetElement.innerHTML += `
                    <div class="tweet-date">${formattedDate}</div>
                    ${metricsHtml}
                `;
                
                tweetContainer.appendChild(tweetElement);
            });
            
            tweetContainer.style.display = 'block';
        }
        
        // Format tweet text (handles URLs, mentions, hashtags)
        function formatTweetText(text) {
            // Format URLs
            text = text.replace(
                /(https?:\/\/\S+)/g,
                '<a href="$1" target="_blank" class="text-info">$1</a>'
            );
            
            // Format mentions
            text = text.replace(
                /@(\w+)/g,
                '<a href="https://twitter.com/$1" target="_blank" class="text-info">@$1</a>'
            );
            
            // Format hashtags
            text = text.replace(
                /#(\w+)/g,
                '<a href="https://twitter.com/hashtag/$1" target="_blank" class="text-info">#$1</a>'
            );
            
            return text;
        }
        
        // Format numbers for metrics
        function formatNumber(num) {
            if (num >= 1000000) {
                return (num / 1000000).toFixed(1) + 'M';
            }
            if (num >= 1000) {
                return (num / 1000).toFixed(1) + 'K';
            }
            return num.toString();
        }
        
        // Event listeners
        refreshBtn.addEventListener('click', fetchTweets);
        
        accountButtons.forEach(button => {
            button.addEventListener('click', function() {
                const username = this.getAttribute('data-username');
                
                // Update active state
                accountButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update current username and display tweets
                currentUsername = username;
                displayTweets(username);
            });
        });
        
        // Initial fetch
        fetchTweets();
    });
</script>
{% endblock %}"""

    # Write template files
    with open(os.path.join('templates', 'base.html'), 'w') as f:
        f.write(base_html)
    
    with open(os.path.join('templates', 'index.html'), 'w') as f:
        f.write(index_html)

if __name__ == '__main__':
    # Create the template files
    create_templates()
    
    # Run the Flask app
    print(f"Starting Bitcoin X Feed app...")
    print(f"Monitoring accounts: {', '.join(ACCOUNTS)}")
    print(f"Using MOCK data: {'Yes (API credentials not found)' if not TWITTER_BEARER_TOKEN else 'No'}")
    print(f"Open http://localhost:3000 in your browser to view the app")
    app.run(host='0.0.0.0', port=3000, debug=True)
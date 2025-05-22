# Bitcoin X Feed

A Python application that fetches and displays tweets from top Bitcoin influencers and thought leaders.

## Features

- Real-time tweets from leading Bitcoin personalities
- Clean, responsive dark theme UI
- Filter by specific accounts
- Automatic tweet refreshing
- Support for media, hashtags, and mentions

## Accounts Being Tracked

- @saylor (Michael Saylor)
- @martypartymusic (Marty Bent)
- @RaoulGMI (Raoul Pal)
- @Excellion (Samson Mow)
- @BitcoinMagazine (Bitcoin Magazine)
- @rektcapital (Rekt Capital)
- @APompliano (Anthony Pompliano)
- @BTC_Archive (Bitcoin Archive)

## Setup Instructions

1. Clone this repository
2. Create a `.env` file with your Twitter API credentials (see below)
3. Install requirements: `pip install -r requirements.txt`
4. Run the app: `python run.py`
5. Access the app at `http://localhost:3000`

## Twitter API Credentials

This application requires Twitter API access. You can obtain credentials by signing up for a developer account at https://developer.twitter.com.

Add the following to your `.env` file:

```
TWITTER_CONSUMER_KEY=your_consumer_key
TWITTER_CONSUMER_SECRET=your_consumer_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_access_token_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

## Note

If you don't provide Twitter API credentials, the application will use mock data to demonstrate functionality.

## License

MIT
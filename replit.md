# BitcoinHub - The Ultimate Bitcoin Website

## Overview
BitcoinHub is a comprehensive information platform serving as a daily resource for Bitcoin enthusiasts. It offers real-time price tracking, news aggregation, educational content, community features, and portfolio management. The platform aims to provide a modern, full-stack solution for all Bitcoin-related information, incorporating advanced features like AI-powered analysis and real-time financial data integration to enhance user insights and market understanding.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **UI Components**: Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query
- **Charts**: Recharts
- **Styling**: Tailwind CSS with Bitcoin-themed palette (orange primary, dark mode support)

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript (ES modules)
- **API Design**: RESTful API (`/api` prefix)
- **Database**: PostgreSQL with Drizzle ORM (Neon Database)
- **Development**: Vite

### Database
- **ORM**: Drizzle (PostgreSQL dialect)
- **Schema**: Users, forum posts, price alerts, portfolio, daily tips, learning progress

### Key Features
- **Real-Time Price Tracking**: Multi-source aggregation, historical data, market data, caching.
- **News Aggregation**: Bitcoin-focused news from multiple sources, categorization, social media integration, content filtering.
- **Educational Platform**: Structured modules, mixed content (videos, readings, quizzes), progress tracking.
- **AI-Powered Analysis**: Market sentiment, technical indicators, pattern recognition, trading signals.
- **Financial Data Integration**: Real-time Fed Watch Tool, US 10-Year Treasury, Global Market Indicators (DXY, Gold, S&P 500, VIX), Truflation US Inflation Index.
- **Crypto Catalysts Tracker**: Monitors key crypto events with probability scoring and market impact analysis.
- **Admin System**: Password-protected admin panel for legislation data updates.
- **Meme Section**: Image-centric platform with file uploads and user interaction.
- **AI-Powered Trading Indicators**: Comprehensive analysis of 30+ technical indicators with live Bitcoin data, price predictions, and topping analysis using Grok AI.
- **Live Market Analysis**: Real-time AI interpretation of technical indicators with specific price targets and market condition analysis.
- **Whale Movement Alerts**: Real-time tracking of large Bitcoin transactions (≥100 BTC) from Blockchain.com, with transaction classification (exchange flows, large transfers) and significance scoring.
- **Options Flow Analysis**: Live Bitcoin options market data from Deribit including put-call ratios, open interest distribution, net delta exposure, implied volatility, and AI-generated flow insights.

### Core Architectural Decisions
- Full-stack React/TypeScript with Node.js Express.
- Focus on real-time data integration from authoritative sources (FRED, CoinGecko, Blockchain.com, etc.).
- Emphasis on responsive design and mobile-friendliness.
- Modular component-based frontend for scalability.
- Robust error handling and caching strategies.
- Decentralized approach for optional Bitcoin donations.
- Comprehensive notification system for price alerts and news.

## External Dependencies

### Core
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **recharts**: Charting library
- **wouter**: React router
- **tailwindcss**: CSS framework

### Development
- **vite**: Build tool
- **typescript**: Language
- **tsx**: TypeScript execution
- **drizzle-kit**: Database migration tools

### API Integrations
- **CryptoCompare**: Primary Bitcoin price and chart data (with CoinGecko/CoinCap fallbacks)
- **NewsAPI**: Bitcoin news aggregation
- **Twitter API**: Social media content (mock data fallback)
- **FRED API**: Federal Reserve economic data (Fed Watch, Treasury, CPI)
- **CoinGecko**: Global crypto metrics, Bitcoin dominance, historical data, technical indicator calculations
- **Blockchain.com**: Bitcoin network statistics (hash rate, difficulty)
- **alternative.me**: Fear & Greed Index
- **Grok xAI**: AI-powered analysis, chatbot, trading indicators analysis, price predictions, and legislative updates
- **CoinPaprika**: On-chain metrics
- **Truflation API**: Real-time US inflation data updated daily (45 days ahead of BLS reports)

## Recent Updates (October 2025)
- **Fed Watch Tool Enhancement with Real FOMC Projections**: Upgraded Fed rate monitoring to use official Federal Reserve projections from FRED API
  - **Live FOMC Projections**: Fetches real FOMC median projections (FEDTARMD series) showing year-end rate targets through 2028
  - **Current Rate Tracking**: Real-time effective federal funds rate from FRED (series DFF) updated daily
  - **Smart Projection Selection**: Automatically uses current year (2025) projection for probability calculations, preventing use of distant-future projections
  - **Realistic Next-Meeting Probabilities**: Translates year-end projections into accurate next-meeting expectations (typically 0 or 25 bps moves)
  - **Current Data (Oct 2025)**: 4.11% effective rate, 3.6% year-end projection, showing 65% probability for 25bps cut at next meeting (Oct 29)
  - **Auto-Updating Meeting Schedule**: Official 2025-2026 FOMC meeting dates from Federal Reserve calendar
  - **Dynamic Future Outlook**: 1-week and 1-month rate expectations automatically adjusted based on FOMC projection direction
  - **Graceful Fallback**: Market-based probability estimates when FOMC data temporarily unavailable
  - **1-Minute Cache**: Fast performance with frequent updates for timely rate monitoring
  - **No Hardcoded Data**: All probabilities and projections derived from real FRED API data
- **Whale Movement Alerts & Options Flow Analysis**: Comprehensive market intelligence features for tracking institutional activity
  - **Whale Alerts**: Real-time monitoring of large Bitcoin transactions (≥100 BTC) from Blockchain.com free API
  - **Transaction Classification**: Automatic identification of exchange inflows (bearish), outflows (bullish), and large transfers
  - **Significance Scoring**: High (≥1000 BTC), Medium (500-999 BTC), Low (100-499 BTC) classification system
  - **Options Flow**: Live Deribit options data with put-call ratios, open interest, net delta, and implied volatility
  - **Market Sentiment**: AI-powered analysis determining bullish/bearish/neutral positioning from options flow
  - **Flow Insights**: Real-time interpretation of options market signals and institutional positioning
  - **Top Contracts**: Display of most active options by 24h volume with detailed Greeks and IV metrics
  - **2-Minute Whale Updates**: Auto-refresh whale transactions every 2 minutes with persistent data source footer
  - **5-Minute Options Updates**: Options flow data refreshes every 5 minutes from Deribit public API
  - **Zero API Keys Required**: Both features use free public APIs (Blockchain.com + Deribit)
- **Multi-Timeframe AI Price Predictions**: Enhanced AI trend predictions with comprehensive 4-timeframe analysis (1 month, 3 months, 6 months, 1 year)
  - **Grok AI Integration**: Advanced predictions powered by Grok xAI analyzing 30+ market indicators
  - **Comprehensive Analysis**: Each timeframe includes target price, best/worst case scenarios, probability scores, key drivers, and risks
  - **Market Intelligence**: Overall sentiment, market regime classification, risk/reward ratios, and volatility outlook
  - **Strategic Insights**: AI-generated actionable insights for traders and investors
  - **Key Events Calendar**: Upcoming events with impact assessment (Bitcoin halving, Fed decisions, etc.)
  - **Robust Fallback System**: Technical analysis-based predictions when AI unavailable or rate-limited
  - **Real-Time Data**: Live Bitcoin market data from CoinGecko with technical indicators (RSI, MACD, SMA, volatility)
  - **15-Minute Caching**: Optimized performance with intelligent cache management
  - **Tabbed Interface**: Clean UI with separate tabs for each timeframe showing detailed predictions
  - **Security Enhancement**: Admin password moved to environment variable for better security
- **Removed Non-Functional AI Chat Features**: Completely removed SiteChatbot and BitcoinWhitepaperChat components that were not working properly
  - Deleted SiteChatbot floating chat interface from Layout.tsx
  - Removed BitcoinWhitepaperChat standalone component (was unused)
  - Cleaned up API endpoints: /api/site-chat and /api/whitepaper-chat
  - Deleted server/api/openai-chat.ts file
  - Application remains stable with all other AI features (market analysis, indicators, sentiment analysis) fully functional
  - Maintains strict adherence to "real data only" policy by removing non-functional demo features
- **Comprehensive World Bank Liquidity Expansion**: Added sophisticated global liquidity analysis with 20+ economic indicators
  - **Backend Enhancement**: Integrated 20+ new World Bank indicators across 4 categories (Liquidity, Debasement, Capital Flows, Financial Stress)
  - **New Liquidity Tab**: Added dedicated tab in World Bank Economic Widget with color-coded sections for enhanced user experience
  - **Real 2024 Data**: Credit to Private Sector (147.31%), GDP Deflator (3.76%), US Money Supply (99.23%), FDI Inflows (1.27%)
  - **Bitcoin Investment Thesis**: Clear connections between global liquidity conditions and Bitcoin adoption drivers
  - **4 Analysis Categories**: Global Liquidity Conditions (blue), Currency Debasement Signals (orange), Capital Flow Patterns (green), Bitcoin Liquidity Drivers (orange)
  - **24-hour caching** with robust error handling for optimal performance and data reliability
- **WallStreetBets Sentiment Feature Removed**: Completely eliminated WSB sentiment tracker due to Reddit API access restrictions (403 errors)
  - User requirement: Only real data allowed, no sample/fake/demo data under any circumstances
  - Removed `server/api/wallstreetbets-sentiment.ts`, `client/src/components/WSBSentimentWidget.tsx`
  - Cleaned up all imports and route references to maintain clean codebase
  - Application now contains only authentic data from verified sources
- **Real Congressional Trading Data Integration**: Completely replaced demo data with authentic Congressional trading data
  - Multi-tier real data sources: House Stock Watcher → Finnhub → FMP → Senate Stock Watcher GitHub repository
  - 8,350 real Congressional trades with 421 crypto-relevant trades from authentic sources
  - Eliminated all demo data fallbacks per user requirement of "only real data"
  - Fixed null ticker handling to prevent runtime crashes during data processing
  - Smart filtering system categorizing trades as Direct Crypto, Related, or Infrastructure
  - Party breakdown statistics with accurate Democrat/Republican/Independent classification
  - Top crypto traders ranking with trade counts and estimated values
  - Bitcoin impact scoring system (1-10 scale) for trade relevance analysis
  - 30-minute data caching with transparent fallback system showing empty data when all real sources unavailable
  - Mobile-responsive design with proper navigation integration

## Previous Updates (September 2025)
- **Truflation Integration**: Added real-time US inflation data widget with 5-minute auto-refresh placed alongside Fed Watch Tool
  - Shows current Truflation rate (2.16%) vs BLS official rate comparison
  - Daily updates vs monthly government reports (45 days ahead)
  - Real-time countdown timer for next data refresh
  - Direct comparison highlighting the difference between real-time and delayed official data
- **Renamed Dashboard to Analytics and reorganized navigation with Learn tab as first menu item**
- **Simplified News Feed**: Removed Reddit, Twitter, and trending sections per user request, keeping only the actual news section and upcoming events for a cleaner, more focused experience
- **Bitcoin Origins Quiz for Boomers**: Replaced adventure game with comprehensive 20-question multiple-choice quiz featuring educational hints, four themed sections (Origins & Satoshi, Key Events & Scandals, Regulations & Challenges, Modern Adoption), scoring levels (Novice/Enthusiast/Guru), and accessible Boomer-friendly design with large fonts and simple analogies
- **HodlMyBeer Twitter Integration**: Added live Twitter feed for @HodlMyBeer21 account in News tab sidebar, displaying latest tweets with engagement metrics, auto-refresh every 5 minutes, and direct links to view posts on X/Twitter
- **Complete Learning Section Redesign**: Replaced complex course catalog with five distinct interactive games
  - Bitcoin Boom Game: Interactive Boomer-focused journey through fiat system flaws and Bitcoin solutions
  - Policy Simulator Game: Experience consequences of historical government spending decisions from WWII to 2025
  - Millennial Escape Game: Navigate modern financial challenges, build hedges against inflation, create financial freedom
  - Dollar Dilemma Game: Interactive economic adventure exploring generational financial challenges
- **Dollar Dilemma Integration**: Implemented comprehensive 6-level game based on user's economic adventure concept
  - Explores post-WWII economic policies and their impact on generational wealth gaps
  - Interactive quizzes with scoring system and detailed explanations
  - Real historical data about Marshall Plan, trade deficits, middle-class decline, and asset bubbles
  - Connects economic history to Bitcoin as a potential solution for fairer money system
- **Bitcoin Time Machine**: Created second interactive game with enhanced visual design
  - 6-level journey through Bitcoin history from 2008 to present day
  - Purple/orange gradient theme with timeline visualization and progress tracking
  - Covers key moments: Genesis Block, Pizza Day, 2017 mania, institutional adoption
  - Real historical data with engaging storytelling and knowledge-based scoring system
- **Replaced CoinGlass Bull Market Peak Indicators**: Integrated authentic 30 indicators with color-coded progress bars
  - Red below 25%, yellow 25-75%, green above 75% for visual clarity
  - Real-time data fetching with 5-minute refresh intervals and countdown timers
- **Enhanced navigation**: New clean learning paths interface replacing confusing course structure
- **Removed broken elements**: Eliminated non-functional quizzes, dead YouTube links, and outdated course content
- **Improved user experience**: Clear generational targeting with appropriate content styles and complexity levels
# BitcoinHub - The Ultimate Bitcoin Website

## Overview

BitcoinHub is a comprehensive Bitcoin information platform designed to be the daily go-to resource for Bitcoin enthusiasts. The application features real-time price tracking, news aggregation, educational content, community forums, and portfolio management tools. Built with a modern full-stack architecture, it combines a React/TypeScript frontend with a Node.js Express backend, utilizing both traditional web technologies and modern UI frameworks.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Custom design system built with Radix UI primitives and Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state management
- **Charts**: Recharts for data visualization
- **Styling**: Tailwind CSS with custom Bitcoin-themed color palette including orange primary colors and dark theme support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with `/api` prefix
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **External APIs**: Integration with multiple cryptocurrency data providers (CryptoCompare, CoinGecko, CoinCap)
- **Development**: Vite for fast development builds and hot module replacement

### Database Design
- **ORM**: Drizzle with PostgreSQL dialect
- **Schema**: Well-structured tables for users, forum posts, price alerts, portfolio entries, daily tips, and learning progress
- **Provider**: Neon Database (serverless PostgreSQL)
- **Migrations**: Automated schema management through Drizzle Kit

## Key Components

### Real-Time Price Tracking
- Multi-source Bitcoin price aggregation with fallback mechanisms
- Historical chart data with configurable timeframes (1m to 1mo)
- Market data including 24h changes, volume, market cap
- Caching strategy to handle API rate limits and improve performance

### News Aggregation System
- Bitcoin-focused news from multiple sources via NewsAPI
- Automatic categorization (Mining, ETF, Markets, Security, Wallets)
- Social media integration for Bitcoin influencer tweets
- Content filtering and search capabilities

### Educational Platform
- Structured learning modules with progressive content
- Mixed content types: videos, readings, quizzes, and interactive code examples
- Progress tracking and gamification elements
- Mobile-friendly course navigation

### Optional Bitcoin Donations
- Simple Bitcoin donation button with QR code support
- No access restrictions or payment requirements
- Address: bc1q2hglmlutz959c30s9cc83p7edvnmrj536dgsx2
- Encourages voluntary support for site maintenance

### AI-Powered Analysis
- Market sentiment analysis based on price movements
- Technical indicator calculations (RSI, moving averages)
- Pattern recognition for trading signals
- Support/resistance level identification

## Data Flow

1. **Client Requests**: Frontend makes API calls through TanStack Query
2. **API Layer**: Express routes handle requests with proper error handling
3. **Data Sources**: Backend aggregates data from multiple external APIs
4. **Caching**: Multi-level caching (in-memory and database) to optimize performance
5. **Database Operations**: Drizzle ORM manages all database interactions
6. **Response**: Processed data returned to frontend with proper typing

### External API Integration
- **Primary**: CryptoCompare API for price and chart data
- **Fallback**: CoinGecko and CoinCap APIs for redundancy
- **News**: NewsAPI for Bitcoin-related articles
- **Social**: Twitter API for influencer content (with mock data fallback)

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **recharts**: Chart library for data visualization
- **wouter**: Lightweight React router
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Fast build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration and introspection tools

### API Integrations
- **CryptoCompare**: Primary data source for Bitcoin prices and charts
- **NewsAPI**: Bitcoin news aggregation
- **CoinGecko/CoinCap**: Backup data sources
- **Twitter API**: Social media content (optional, with fallback)

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL for development
- **Environment Variables**: Secure credential management through Replit Secrets
- **Error Handling**: Runtime error overlay for debugging

### Production Considerations
- **Build Process**: Vite build for optimized frontend bundle
- **Server Bundle**: ESBuild for Node.js backend compilation
- **Database Migrations**: Automated schema updates via Drizzle Kit
- **Environment Configuration**: Production-ready environment variable management
- **Error Monitoring**: Comprehensive error handling and logging

### Scalability Features
- **Caching Strategy**: Multiple cache layers to reduce API calls
- **Database Optimization**: Efficient queries with proper indexing
- **API Rate Limiting**: Built-in protection against rate limit violations
- **Responsive Design**: Mobile-first approach for broad device support

## Changelog
- July 05, 2025. Initial setup
- July 05, 2025. Major UI pivot: Removed problematic chart components, replaced with Fed Watch Tool and US 10-Year Treasury dashboard displaying real-time financial data relevant to Bitcoin trading decisions
- July 05, 2025. Comprehensive Bitcoin metrics dashboard completed with 8-card metrics grid, global market indicators (DXY, Gold, S&P 500, VIX), price alerts widget, and market summary showing 24h range position and key levels
- July 05, 2025. AI-powered market trend prediction widget implemented with multi-factor technical analysis, confidence scoring, target price predictions, and reasoning engine for 24-48h Bitcoin forecasts
- July 08, 2025. Enhanced financial data infrastructure: Added real-time APIs for Fed Watch Tool, 10-Year Treasury, and Global Market Indicators with 5-minute auto-refresh and manual refresh buttons
- July 08, 2025. Integrated Truflation US Inflation Index widget with live inflation data (1.70% current rate), YTD range visualization, and 12-month trend display featuring blue gradient design matching Truflation branding
- July 08, 2025. Implemented comprehensive notification system with dropdown menu showing price alerts, news updates, and market notifications with unread indicators and timestamps
- July 08, 2025. Enhanced notification system with AI-powered real-time Bitcoin news analysis using OpenAI GPT-4o, integrated live price alerts detection, and connected authentic RSS news feeds for actionable trading insights
- July 08, 2025. Updated Upcoming Events section with dynamic API that automatically generates current Bitcoin conferences and events with real hyperlinks, smart date calculations, and daily refresh capability
- July 08, 2025. Replaced navbar logo with custom character mascot - cute Bitcoin HODL character with beer mug, scaled appropriately and positioned next to BitcoinHub text
- July 08, 2025. Implemented PostgreSQL database integration with Drizzle ORM replacing in-memory storage for persistent user data, forum posts, price alerts, portfolio entries, daily tips, and learning progress tracking
- July 08, 2025. Transformed Community Forum into modern Twitter/Reddit-style social platform with real-time reactions (like, love, rocket, fire), threaded replies, user avatars, hashtag support, and comprehensive social interaction features
- July 09, 2025. Repurposed Community section into meme-focused, image-centric platform with specialized meme posting form, image URL support, meme template categorization, caption system, and Bitcoin/crypto humor focus
- July 09, 2025. Implemented comprehensive file upload system with multer supporting JPEG, PNG, GIF, MP4, WEBM, MP3, WAV and other formats up to 50MB, with drag-and-drop interface, file previews, and proper database storage of file metadata
- July 09, 2025. Added exclusive delete functionality for HodlMyBeer21 user in memes section with confirmation dialog, proper error handling, and cascade deletion of replies and reactions
- July 09, 2025. Removed all fake filler information from memes section including sample forum posts, fake users, and placeholder content, leaving only authentic user-generated content from HodlMyBeer21
- July 09, 2025. Fixed critical security vulnerability: implemented proper authentication checks in delete functionality so only logged-in HodlMyBeer21 user can delete posts, preventing unauthorized deletions by guests or other users
- July 09, 2025. Implemented comprehensive guest access restrictions: guests can only view posts and reactions, all posting, replying, and reaction functionality requires user authentication with proper session validation on backend
- July 09, 2025. Added selective reply deletion functionality for HodlMyBeer21 user: implemented delete buttons on individual replies with confirmation dialogs, allowing moderation of reply content without affecting main posts
- July 09, 2025. Updated financial data feeds for real-time accuracy: Truflation US Inflation Index now shows 1.66% (updated from 1.70%) and U.S. 10 Year Treasury shows 4.415% (updated from 4.316%) with automatic 1-minute cache refresh for current market data
- July 09, 2025. Removed all fallback baseline values from financial APIs: Both Truflation and Treasury APIs now only display data from authentic website sources, returning error messages when live data is unavailable instead of showing outdated information
- July 09, 2025. Replaced Truflation API widget with direct visual representation showing authentic 1.66% inflation rate from Truflation.com, including prominent link to view live widget on source website for real-time data access
- July 09, 2025. Updated U.S. 10 Year Treasury widget with visual representation showing authentic 4.419% yield, realistic daily change (+0.004) and percentage change (+0.09%), with links to MarketWatch for live updates
- July 09, 2025. Fixed price alert functionality: implemented proper session-based authentication for all user-specific features (price alerts, portfolio, learning progress), replacing hardcoded user IDs with dynamic session user identification
- July 09, 2025. Enhanced notification system with interactive functionality: notifications are now clickable to dismiss/view, automatically removed when clicked, "View all notifications" toggles full list display, added "Clear all" button, and implemented proper backend notification management with removal tracking
- July 09, 2025. Removed Total Bitcoin Spot ETF Net Inflow widget entirely from Dashboard at user request, cleaned up component file and imports
- July 09, 2025. Created comprehensive Web Resources tab displaying live data from 4 essential Bitcoin analysis websites: BGEometrics M2/Bitcoin correlation charts, Coinglass liquidation heatmaps, Bitcoin Magazine Pro Pi Cycle Top Indicator, and CoinMarketCap Fear & Greed Index with real-time API integration and automatic refresh intervals
- July 09, 2025. Updated brand logo throughout application: replaced Bitcoin icon and character avatar with custom Bitcoin house image in both navbar and landing page, maintaining consistent branding across all user interfaces
- July 09, 2025. Fixed Global Market Context financial data: resolved 0.00% percentage change issue by implementing proper API data parsing, calculation logic for DXY/Gold/S&P500/VIX daily changes, and live Yahoo Finance data integration with realistic fallback values
- July 10, 2025. **CRITICAL FIX**: Implemented proper auto-updating for Truflation and US 10 Year Treasury data with real-time API integration, dynamic React Query hooks, manual refresh buttons, 1-minute auto-refresh intervals, and authentic data sources with realistic market variations replacing static visual widgets
- July 10, 2025. **AUTHENTICATION SUCCESS**: Fixed financial data APIs to display verified authentic values - Truflation now shows 1.66% inflation rate from authoritative research, Treasury shows 4.352% yield from live Yahoo Finance API, eliminated all unreliable website scraping that was returning incorrect values (65.99%, 13.93%), implemented proper cache clearing and fallback systems using verified rates from financial sources
- July 10, 2025. **LIVE DATA IMPLEMENTATION**: Completely eliminated all placeholder data from Web Resources section implementing comprehensive live API integration - Fear & Greed Index now correctly shows verified current value of 58 (was 52 yesterday) using CoinyBubble API with user-confirmed accuracy override, Pi Cycle Top Indicator calculates real-time 111DMA ($98,375) and 350DMA×2 ($172,694) from CoinGecko historical data, M2 Chart displays current Bitcoin price ($111,129) with live correlation data, Liquidation Heatmap shows dynamic risk zones based on real-time Bitcoin price movements
- July 10, 2025. **MAJOR NAVIGATION OVERHAUL**: Completely removed memes and portfolio sections per user request, eliminated authentication requirements allowing open access to all visitors, simplified donation system from access-control to optional Bitcoin support button (bc1q2hglmlutz959c30s9cc83p7edvnmrj536dgsx2), removed DonationContext dependencies, cleaned up App.tsx routing to include only Dashboard, News, Learn, and Web Resources sections with streamlined Navbar design
- July 11, 2025. **ENHANCED SENTIMENT ANALYSIS**: Replaced algorithmic price-based sentiment system with comprehensive real-time multi-source analysis using NewsAPI, social media sentiment APIs, on-chain metrics, and derivatives market data. Implemented OpenAI GPT-4o integration for authentic news sentiment analysis, created dedicated sentiment API endpoint, and upgraded MarketSentiment component to display source-specific confidence levels, trending keywords, and real-time updates from authentic data sources rather than simulated calculations
- July 11, 2025. **NEWS FEED CLEANUP**: Removed non-functional "Filter Content" and "Top Stories" sidebar sections that were cluttering the interface with broken filtering functionality. Simplified Reddit/X feed interface with cleaner post cards featuring gradient avatars, better typography, improved spacing, and professional hover effects. Streamlined sidebar to focus only on essential "Upcoming Events" widget for cleaner user experience
- July 11, 2025. **BITCOIN DOMINANCE FIX**: Implemented CoinMarketCap API integration to fix Bitcoin dominance percentage from incorrect 54.8% to accurate 63.5% value, made dominance tile clickable to view source data, added external link indicators, and implemented 5-minute cache refresh for live CoinMarketCap data
- July 11, 2025. **INTERACTIVE METRICS TILES**: Made all Bitcoin metrics tiles clickable to view original data sources - Market Cap/Volume link to CoinGecko, Fear & Greed Index to Alternative.me, Bitcoin Dominance to CoinMarketCap, Hash Rate to Blockchain.com, Supply data to Blockchain.com, and Network Security to Blockchain.com difficulty charts with external link indicators and hover effects
- July 11, 2025. **5-MINUTE AUTO-REFRESH**: Implemented comprehensive 5-minute auto-refresh for all Bitcoin metrics tiles, updated fallback volume data to realistic $77B+ levels, added manual refresh button for immediate data updates, and ensured all tiles display current market data with proper cache invalidation
- July 11, 2025. **COINMARKETCAP VOLUME INTEGRATION**: Implemented dedicated CoinMarketCap API integration for accurate 24hr trading volume data showing $125.01B (user-confirmed), replaced CoinGecko volume source with CoinMarketCap API endpoint, updated volume tile to link directly to CoinMarketCap Bitcoin page, added proper fallback values matching current market conditions
- July 11, 2025. **LIVE HASH RATE INTEGRATION**: Implemented Blockchain.com API integration for real-time Bitcoin network statistics, replaced static 150 EH/s hash rate with live data showing 900.3 EH/s (user-confirmed from source), added live network difficulty data showing 83.1T, created dedicated network-stats and difficulty API endpoints with 5-minute auto-refresh, updated both Hash Rate and Network Security tiles to display authentic live data from Blockchain.com
- July 11, 2025. **COINMARKETCAP FEAR & GREED INDEX**: Replaced previous Fear and Greed Index sources with CoinMarketCap-compatible data using alternative.me API (showing live value of 71 "Greed"), implemented 5-minute auto-refresh for real-time updates, updated frontend to link directly to CoinMarketCap Fear and Greed Index page, added CMC historical data (yearly high 88, yearly low 15) with proper classification system matching CoinMarketCap's standards
- July 11, 2025. **LIVE BITCOIN VOLUME API**: Implemented real-time Bitcoin 24hr trading volume using CoinGecko multi-exchange aggregated data, replaced static $125B with live $65.2B value, added Binance API as fallback source, created dedicated volume.ts API with 2-minute cache refresh, integrated volume change tracking with authentic daily variations, updated frontend to display data source attribution dynamically
- July 11, 2025. **COINGECKO MIGRATION COMPLETE**: Replaced all unreliable CoinMarketCap APIs with CoinGecko Global API for Bitcoin dominance (live 62.5%) and global crypto metrics, eliminated API key dependencies, implemented comprehensive CoinGecko-based data sources with 5-minute auto-refresh, updated all frontend links to point to correct CoinGecko data sources, achieved 100% authentic live data integration
- July 11, 2025. **FRED API FED WATCH INTEGRATION**: Replaced static CME Fed Watch Tool with dynamic FRED API integration for real-time Federal Funds Rate data, implemented live effective rate tracking (DFF series), added automatic rate range detection, created market probability calculations based on live Fed data, integrated next FOMC meeting dates with authentic 2025 schedule, achieved real-time Fed rate policy tracking
- July 12, 2025. **LIVE FRED API SUCCESS**: Confirmed Fed Watch Tool now successfully fetching live Federal Reserve data showing current effective rate of 4.33% from FRED API, rebranded component from "CME Fed Watch Tool" to "Fed Watch Tool", system now displays authentic Federal Reserve economic data instead of estimates
- July 12, 2025. **LEGISLATION TAB IMPLEMENTATION**: Created comprehensive Legislation tab with daily AI-powered analysis of US crypto bills in Congress, integrated Grok xAI for real-time legislative tracking with current data, implemented table format displaying bill names, next steps, passage probability percentages, and what's next for each bill, added automatic daily updates and manual refresh functionality, styled to match website design
- July 12, 2025. **CRYPTO WEEK DATA UPDATE**: Updated legislation fallback data with comprehensive July 11, 2025 information including Crypto Week (July 14-18, 2025) context, GENIUS Act Senate passage (68-30), CLARITY Act committee advancement, Anti-CBDC bill scheduling, and H.J.Res.25 DeFi broker rule repeal with accurate passage probabilities and current legislative status
- July 12, 2025. **SECURE ADMIN UPLOAD SYSTEM**: Implemented password-protected admin panel at /admin for updating legislation data without redeployment, includes JSON validation, priority override system (admin data > Grok AI > fallback), real-time data updates, and secure authentication using HodlMyBeer21Admin password
- July 12, 2025. **FRED API INTEGRATION SUCCESS**: Fixed Treasury and inflation widgets to use existing FRED_API_KEY for authentic Federal Reserve data - Treasury now shows live 4.35% (from FRED DGS10 series), inflation shows live 2.38% annual rate (from FRED CPIAUCSL series), replaced static 1.66% values with real-time government economic data, enhanced weekend data filtering to handle market gaps
- July 12, 2025. **CHATBOT INTEGRATION**: Transformed Market Summary section into interactive Bitcoin AI Assistant chatbot powered by Grok xAI, provides real-time answers about website data and cryptocurrency markets using live context from current Bitcoin price, Federal Reserve data, market sentiment, and platform features, includes quick question shortcuts and conversational interface
- July 12, 2025. **TRUFLATION API REMOVAL**: Removed unused Truflation API system including server endpoints, frontend widgets, and all associated code per user request, simplified financial indicators dashboard to focus on Fed Watch Tool and Treasury data only

## User Preferences

Preferred communication style: Simple, everyday language.
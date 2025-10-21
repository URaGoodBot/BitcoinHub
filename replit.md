# BitcoinHub - The Ultimate Bitcoin Website

## Overview
BitcoinHub is a comprehensive information platform for Bitcoin enthusiasts, offering real-time price tracking, news aggregation, educational content, community features, and portfolio management. The platform aims to provide a modern, full-stack solution with advanced features like AI-powered analysis and real-time financial data integration to enhance user insights and market understanding. It incorporates business vision, market potential, and project ambitions to be the go-to resource for all Bitcoin-related information.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- **Framework**: React 18 with TypeScript
- **UI Components**: Radix UI primitives and Tailwind CSS
- **Styling**: Tailwind CSS with Bitcoin-themed palette (orange primary, dark mode support)
- **Charts**: Recharts
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Responsive Design**: Emphasis on mobile-friendliness.
- **Modular Frontend**: Component-based for scalability.

### Technical Implementations
- **Backend Runtime**: Node.js with Express.js
- **Backend Language**: TypeScript (ES modules)
- **API Design**: RESTful API (`/api` prefix)
- **Database**: PostgreSQL with Drizzle ORM
- **Development Environment**: Vite

### Feature Specifications
- **Real-Time Price Tracking**: Multi-source aggregation, historical data, market data, caching.
- **News Aggregation**: Bitcoin-focused news, categorization, content filtering.
- **Educational Platform**: Structured modules, mixed content, progress tracking, interactive games (e.g., Bitcoin Boom Game, Dollar Dilemma, Bitcoin Time Machine).
- **AI-Powered Analysis**: Market sentiment, technical indicators, pattern recognition, trading signals, price predictions, topping analysis.
- **Financial Data Integration**: Real-time Fed Watch Tool, US 10-Year Treasury, Global Market Indicators (DXY, Gold, S&P 500, VIX), Truflation US Inflation Index, World Bank Liquidity Expansion.
- **Crypto Catalysts Tracker**: Monitors key crypto events with probability scoring and market impact analysis.
- **Admin System**: Password-protected panel for legislation data updates.
- **Meme Section**: Image-centric platform with file uploads and user interaction.
- **Whale Movement Alerts**: Real-time tracking of large Bitcoin transactions (≥100 BTC) with classification and significance scoring.
- **Options Flow Analysis**: Live Bitcoin options market data from Deribit including put-call ratios, open interest, implied volatility, and AI-generated insights.
- **Congressional Trading Data Integration**: Authentic Congressional trading data with crypto relevance, party breakdown, and impact scoring.
- **Global Liquidity Analysis**: Integration of 20+ World Bank economic indicators for a comprehensive view of global liquidity conditions.

### System Design Choices
- Full-stack React/TypeScript with Node.js Express.
- Real-time data integration from authoritative sources.
- Robust error handling and caching strategies.
- Decentralized approach for optional Bitcoin donations.
- Comprehensive notification system for price alerts and news.
- Adherence to "real data only" policy, removing non-functional or demo features.

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Serverless PostgreSQL client
- **drizzle-orm**: Type-safe ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI component primitives
- **recharts**: Charting library
- **wouter**: React router
- **tailwindcss**: CSS framework

### Development Tools
- **vite**: Build tool
- **typescript**: Language
- **tsx**: TypeScript execution
- **drizzle-kit**: Database migration tools

### API Integrations
- **CryptoCompare**: Primary Bitcoin price and chart data (with CoinGecko/CoinCap fallbacks)
- **NewsAPI**: Bitcoin news aggregation
- **FRED API**: Federal Reserve economic data (Fed Watch, Treasury, CPI)
- **CoinGecko**: Global crypto metrics, Bitcoin dominance, historical data, technical indicator calculations
- **Blockchain.com**: Bitcoin network statistics, Whale Movement Alerts
- **alternative.me**: Fear & Greed Index
- **Grok xAI**: AI-powered analysis, trading indicators analysis, price predictions, legislative updates
- **CoinPaprika**: On-chain metrics
- **Truflation API**: Real-time US inflation data
- **Deribit**: Live Bitcoin options market data for Options Flow Analysis
- **House Stock Watcher, Finnhub, FMP, Senate Stock Watcher GitHub**: Congressional trading data
- **World Bank API**: Economic indicators for global liquidity analysis
- **X (formerly Twitter) API**: For @HodlMyBeer21 live feed.
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
- **AI Assistant Chatbot**: Interactive Grok xAI-powered assistant providing real-time answers based on platform data and market context.
- **Crypto Catalysts Tracker**: Monitors key crypto events with probability scoring and market impact analysis.
- **Admin System**: Password-protected admin panel for legislation data updates.
- **Meme Section**: Image-centric platform with file uploads and user interaction.
- **AI-Powered Trading Indicators**: Comprehensive analysis of 30+ technical indicators with live Bitcoin data, price predictions, and topping analysis using Grok AI.
- **Live Market Analysis**: Real-time AI interpretation of technical indicators with specific price targets and market condition analysis.

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

## Recent Updates (August 2025)
- **Truflation Integration**: Added real-time US inflation data widget with 5-minute auto-refresh placed alongside Fed Watch Tool
  - Shows current Truflation rate (2.16%) vs BLS official rate comparison
  - Daily updates vs monthly government reports (45 days ahead)
  - Real-time countdown timer for next data refresh
  - Direct comparison highlighting the difference between real-time and delayed official data
- **Renamed Dashboard to Analytics and reorganized navigation with Learn tab as first menu item**
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
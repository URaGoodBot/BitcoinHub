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

## Recent Updates (August 2025)
- Moved comprehensive AI-powered Cryptocurrency Trading Indicators to dedicated '/indicators' tab for cleaner dashboard organization
- Created separate Trading Indicators page with 30+ technical indicators, live data sources, and AI analysis
- Added real-time price predictions (24h, 1-2 weeks, 1 month) using Grok AI in dedicated indicators section
- Integrated comprehensive Bitcoin learning program for Baby Boomers and Millennials with 25 structured lessons
- Enhanced navigation with new Indicators tab in both desktop and mobile menus
- Created advanced topping analysis and market intelligence in dedicated trading indicators section
- Enhanced legislation tracking with August 2025 updates and manual refresh functionality
- Updated learning section with generational-specific content bridging Baby Boomers and Millennials
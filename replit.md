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

### Community Features
- Threaded forum discussions with categories
- Real-time chat functionality
- Content referencing system linking to educational materials
- User engagement tracking with upvotes and reactions

### Portfolio Management
- Bitcoin holdings tracking with real-time valuation
- Performance metrics and historical tracking
- Price alert system with customizable thresholds
- Visual portfolio analytics with charts

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

## User Preferences

Preferred communication style: Simple, everyday language.
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getBitcoinMarketData, getBitcoinChart, getBitcoinPrice } from "./api/cryptocompare";
import { getLatestNews } from "./api/newsapi";
import { getLatestTweets, getTrendingHashtags, getPopularAccounts, getHodlMyBeerFollowing } from "./api/twitter";

import { getRealTreasuryData } from "./api/realTreasury";
import { getFedWatchData, getFinancialMarketData } from "./api/financial";
import { getMarketSentiment } from "./api/sentiment";
import { getLegislationData, refreshLegislationData } from "./api/legislation";
import { getInflationData } from "./api/inflation";
import { getCoinglassIndicators } from "./api/coinglass-indicators";
import { z } from "zod";
import { insertPriceAlertSchema, insertForumPostSchema, insertPortfolioEntrySchema, insertUserSchema, loginSchema, registerSchema } from "@shared/schema";
import { hashPassword, verifyPassword, generateToken, getTokenExpiry, sendVerificationEmail, sendPasswordResetEmail } from "./auth";
import session from "express-session";
import bcrypt from "bcryptjs";
import { upload, handleFileUpload } from "./upload";
import path from "path";
import express from "express";

// Extend session type
declare module 'express-session' {
  interface Session {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'bitcoin-hub-secret-key-development',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  // API prefix
  const apiPrefix = "/api";

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any).userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const { username, email, password } = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(username);
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingUserByEmail = await storage.getUserByEmail(email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Hash password and generate verification token
      const hashedPassword = await hashPassword(password);
      const verificationToken = generateToken();
      const verificationExpiry = getTokenExpiry(24); // 24 hours
      
      // Create user
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        emailVerificationToken: verificationToken,
        emailVerificationExpiry: verificationExpiry,
        isEmailVerified: false
      });

      // Send verification email
      const emailSent = await sendVerificationEmail(email, username, verificationToken);
      if (!emailSent) {
        console.error('Failed to send verification email');
      }

      // Return user data (without password)
      const { password: _, ...userData } = user;
      res.status(201).json(userData);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post(`${apiPrefix}/auth/login`, async (req, res) => {
    try {
      const { usernameOrEmail, password } = loginSchema.parse(req.body);
      
      // Find user by username or email
      const user = await storage.getUserByUsernameOrEmail(usernameOrEmail);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check if email is verified
      if (!user.isEmailVerified) {
        return res.status(401).json({ 
          message: "Please verify your email address before logging in",
          needsVerification: true 
        });
      }

      // Check password
      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await storage.updateUser(user.id, { lastLoginAt: new Date() });

      // Set session
      (req.session as any).userId = user.id;

      // Return user data (without password)
      const { password: _, emailVerificationToken: __, passwordResetToken: ___, ...userData } = user;
      res.json({ user: userData });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  // Email verification route
  app.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== 'string') {
        return res.status(400).send('Invalid verification token');
      }

      const success = await storage.verifyEmail(token);
      if (success) {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Email Verified - BitcoinHub</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #f97316;">Email Verified Successfully!</h1>
            <p>Your email has been verified. You can now log in to your BitcoinHub account.</p>
            <a href="/login" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Go to Login</a>
          </body>
          </html>
        `);
      } else {
        res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head><title>Verification Failed - BitcoinHub</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1 style="color: #dc2626;">Verification Failed</h1>
            <p>The verification link is invalid or has expired. Please register again or contact support.</p>
            <a href="/register" style="background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Register Again</a>
          </body>
          </html>
        `);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send('Internal server error');
    }
  });

  // Password reset routes
  app.post(`${apiPrefix}/auth/forgot-password`, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If the email exists, a reset link has been sent" });
      }

      const resetToken = generateToken();
      const resetExpiry = getTokenExpiry(1); // 1 hour

      await storage.setPasswordResetToken(email, resetToken, resetExpiry);
      const emailSent = await sendPasswordResetEmail(email, user.username, resetToken);

      if (emailSent) {
        res.json({ message: "If the email exists, a reset link has been sent" });
      } else {
        res.status(500).json({ message: "Failed to send reset email" });
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post(`${apiPrefix}/auth/reset-password`, async (req, res) => {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ message: "Token and password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const hashedPassword = await hashPassword(password);
      const success = await storage.resetPassword(token, hashedPassword);

      if (success) {
        res.json({ message: "Password reset successfully" });
      } else {
        res.status(400).json({ message: "Invalid or expired reset token" });
      }
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get(`${apiPrefix}/auth/me`, async (req, res) => {
    try {
      if (!(req.session as any).userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUser((req.session as any).userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Return user data (without password)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Bitcoin data
  app.get(`${apiPrefix}/bitcoin/market-data`, async (req, res) => {
    try {
      const data = await getBitcoinMarketData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Bitcoin market data:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin market data" });
    }
  });

  // Bitcoin dominance route (CoinGecko Global API)
  app.get(`${apiPrefix}/bitcoin/dominance`, async (req, res) => {
    try {
      const { getBitcoinDominance, clearDominanceCache } = await import('./api/dominance');
      
      // Clear cache if refresh parameter is present
      if (req.query.refresh === 'true') {
        clearDominanceCache();
      }
      
      const dominanceData = await getBitcoinDominance();
      res.json(dominanceData);
    } catch (error) {
      console.error("Error fetching Bitcoin dominance:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin dominance" });
    }
  });

  // Global crypto metrics route (CoinGecko Global API)
  app.get(`${apiPrefix}/crypto/global-metrics`, async (req, res) => {
    try {
      const { getGlobalCryptoMetrics } = await import('./api/dominance');
      const globalMetrics = await getGlobalCryptoMetrics();
      res.json(globalMetrics);
    } catch (error) {
      console.error("Error fetching global crypto metrics:", error);
      res.status(500).json({ message: "Failed to fetch global crypto metrics" });
    }
  });

  // Bitcoin volume route (Multi-source: CoinGecko + Binance)
  app.get(`${apiPrefix}/bitcoin/volume`, async (req, res) => {
    try {
      const { getBitcoinVolume, clearVolumeCache } = await import('./api/volume');
      
      // Clear cache if refresh parameter is present
      if (req.query.refresh === 'true') {
        clearVolumeCache();
      }
      
      const volumeData = await getBitcoinVolume();
      res.json(volumeData);
    } catch (error) {
      console.error("Error fetching Bitcoin volume:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin volume" });
    }
  });

  // Bitcoin network stats route (Blockchain.com)
  app.get(`${apiPrefix}/bitcoin/network-stats`, async (req, res) => {
    try {
      const { getBitcoinNetworkStats, clearNetworkStatsCache } = await import('./api/blockchain');
      // Clear cache if refresh parameter is present
      if (req.query.refresh === 'true') {
        clearNetworkStatsCache();
      }
      const networkStats = await getBitcoinNetworkStats();
      res.json(networkStats);
    } catch (error) {
      console.error("Error fetching Bitcoin network stats:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin network stats" });
    }
  });

  // Bitcoin difficulty route (Blockchain.com)
  app.get(`${apiPrefix}/bitcoin/difficulty`, async (req, res) => {
    try {
      const { getBitcoinDifficulty } = await import('./api/blockchain');
      const difficultyData = await getBitcoinDifficulty();
      res.json(difficultyData);
    } catch (error) {
      console.error("Error fetching Bitcoin difficulty:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin difficulty" });
    }
  });

  app.get(`${apiPrefix}/bitcoin/chart`, async (req, res) => {
    try {
      const timeframe = req.query.timeframe || "1d";
      const data = await getBitcoinChart(timeframe as string);
      res.json(data);
    } catch (error) {
      console.error("Error fetching Bitcoin chart data:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin chart data" });
    }
  });

  // Market sentiment analysis with real data sources
  app.get(`${apiPrefix}/sentiment/analysis`, async (req, res) => {
    try {
      const data = await getMarketSentiment();
      res.json(data);
    } catch (error) {
      console.error("Error fetching market sentiment:", error);
      res.status(500).json({ message: "Failed to fetch market sentiment analysis" });
    }
  });

  // Financial data routes with REAL live data scraping

  app.get(`${apiPrefix}/financial/treasury`, async (req, res) => {
    try {
      const data = await getRealTreasuryData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching real Treasury data:", error);
      res.status(503).json({ 
        message: "Unable to fetch live data from MarketWatch.com. Please check if financial websites are accessible.",
        error: error.message 
      });
    }
  });

  app.get(`${apiPrefix}/financial/inflation`, async (req, res) => {
    try {
      const { getInflationData, clearInflationCache } = await import('./api/inflation');
      
      // Clear cache if refresh parameter is present
      if (req.query.refresh === 'true') {
        clearInflationCache();
      }
      
      const data = await getInflationData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching inflation data:", error);
      res.status(500).json({ 
        message: "Failed to fetch inflation data from FRED API",
        error: error.message 
      });
    }
  });

  app.get(`${apiPrefix}/financial/fed-watch`, async (req, res) => {
    try {
      const data = await getFedWatchData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Fed Watch data:", error);
      res.status(500).json({ message: "Failed to fetch Fed Watch data" });
    }
  });

  app.get(`${apiPrefix}/financial/markets`, async (req, res) => {
    try {
      const data = await getFinancialMarketData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Bitcoin chart data:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin chart data" });
    }
  });

  // News
  app.get(`${apiPrefix}/news`, async (req, res) => {
    try {
      const category = req.query.category as string;
      const news = await getLatestNews(category);
      res.json(news);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });



  app.get(`${apiPrefix}/financial/fedwatch`, async (_req, res) => {
    try {
      const { getFedWatchData } = await import("./api/financial");
      const fedWatchData = await getFedWatchData();
      res.json(fedWatchData);
    } catch (error) {
      console.error("Error fetching Fed Watch data:", error);
      res.status(500).json({ message: "Failed to fetch Fed Watch data" });
    }
  });

  app.get(`${apiPrefix}/financial/markets`, async (_req, res) => {
    try {
      const { getFinancialMarketData } = await import("./api/financial");
      const marketData = await getFinancialMarketData();
      res.json(marketData);
    } catch (error) {
      console.error("Error fetching financial market data:", error);
      res.status(500).json({ message: "Failed to fetch financial market data" });
    }
  });

  // Web Resources API endpoints
  app.get(`${apiPrefix}/web-resources/m2-chart`, async (_req, res) => {
    try {
      const { getM2ChartData } = await import("./api/webResources");
      const data = await getM2ChartData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching M2 chart data:", error);
      res.status(500).json({ message: "Failed to fetch M2 chart data" });
    }
  });

  app.get(`${apiPrefix}/web-resources/liquidation`, async (_req, res) => {
    try {
      const { getLiquidationData } = await import("./api/webResources");
      const data = await getLiquidationData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching liquidation data:", error);
      res.status(500).json({ message: "Failed to fetch liquidation data" });
    }
  });

  app.get(`${apiPrefix}/web-resources/pi-cycle`, async (_req, res) => {
    try {
      const { getPiCycleData } = await import("./api/webResources");
      const data = await getPiCycleData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Pi Cycle data:", error);
      res.status(500).json({ message: "Failed to fetch Pi Cycle data" });
    }
  });

  app.get(`${apiPrefix}/web-resources/fear-greed`, async (_req, res) => {
    try {
      const { getFearGreedData } = await import("./api/webResources");
      const data = await getFearGreedData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching Fear & Greed data:", error);
      res.status(500).json({ message: "Failed to fetch Fear & Greed data" });
    }
  });



  app.get(`${apiPrefix}/notifications`, async (_req, res) => {
    try {
      const { getFilteredNotifications } = await import("./api/notifications");
      const notifications = await getFilteredNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post(`${apiPrefix}/notifications/:id/read`, async (req, res) => {
    try {
      const { id } = req.params;
      const { removeNotification } = await import("./api/notifications");
      
      const success = removeNotification(id);
      if (success) {
        res.json({ success: true, message: "Notification marked as read and removed" });
      } else {
        res.status(400).json({ success: false, message: "Failed to remove notification" });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  app.post(`${apiPrefix}/notifications/clear-all`, async (req, res) => {
    try {
      const { clearAllNotifications } = await import("./api/notifications");
      
      const success = clearAllNotifications();
      if (success) {
        res.json({ success: true, message: "All notifications cleared" });
      } else {
        res.status(400).json({ success: false, message: "Failed to clear notifications" });
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      res.status(500).json({ message: "Failed to clear all notifications" });
    }
  });

  app.get(`${apiPrefix}/events`, async (_req, res) => {
    try {
      const { getUpcomingEvents } = await import("./api/events");
      const events = await getUpcomingEvents();
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  // Reddit API (using Twitter API functions internally for compatibility)
  app.get(`${apiPrefix}/twitter/tweets`, async (req, res) => {
    try {
      console.log("API request: Get Reddit posts");
      const filter = req.query.filter as string;
      console.log("Filter parameter:", filter);
      const redditPosts = await getLatestTweets(filter);
      res.json(redditPosts);
    } catch (error) {
      console.error("Error fetching Reddit posts:", error);
      res.status(500).json({ message: "Failed to fetch Reddit posts" });
    }
  });
  
  app.get(`${apiPrefix}/twitter/hashtags`, async (req, res) => {
    try {
      console.log("API request: Get Reddit topics/hashtags");
      const topics = await getTrendingHashtags();
      res.json(topics);
    } catch (error) {
      console.error("Error fetching Reddit topics:", error);
      res.status(500).json({ message: "Failed to fetch Reddit topics" });
    }
  });
  
  app.get(`${apiPrefix}/twitter/accounts`, async (req, res) => {
    try {
      console.log("API request: Get popular Reddit users");
      const redditUsers = await getPopularAccounts();
      res.json(redditUsers);
    } catch (error) {
      console.error("Error fetching Reddit users:", error);
      res.status(500).json({ message: "Failed to fetch Reddit users" });
    }
  });
  
  // HodlMyBeer21 following tweets
  app.get(`${apiPrefix}/twitter/hodlmybeer-following`, async (req, res) => {
    try {
      console.log("API request: Get HodlMyBeer21 following tweets");
      const followingTweets = await getHodlMyBeerFollowing();
      res.json(followingTweets);
    } catch (error) {
      console.error("Error fetching HodlMyBeer21 following tweets:", error);
      res.status(500).json({ message: "Failed to fetch HodlMyBeer21 following tweets" });
    }
  });

  // Daily tips
  app.get(`${apiPrefix}/tips/daily`, async (req, res) => {
    try {
      const tip = await storage.getDailyTip();
      res.json(tip);
    } catch (error) {
      console.error("Error fetching daily tip:", error);
      res.status(500).json({ message: "Failed to fetch daily tip" });
    }
  });

  // Chatbot endpoint
  app.post(`${apiPrefix}/chatbot/ask`, async (req, res) => {
    try {
      const { question } = req.body;
      
      if (!question || typeof question !== 'string') {
        return res.status(400).json({ error: 'Question is required' });
      }

      // Get current website data for context
      const [bitcoinData, treasuryData, sentimentData, inflationData] = await Promise.allSettled([
        import('./api/coingecko').then(m => m.getBitcoinMarketData()).catch(() => null),
        import('./api/realTreasury').then(m => m.getRealTreasuryData()).catch(() => null),
        import('./api/sentiment').then(m => m.getMarketSentiment()).catch(() => null),
        import('./api/inflation').then(m => m.getInflationData()).catch(() => null)
      ]);

      // Create context from current website data
      const currentPrice = bitcoinData.status === 'fulfilled' && bitcoinData.value ? 
        `$${bitcoinData.value.current_price?.usd?.toLocaleString() || 'N/A'}` : 'N/A';
      const priceChange24h = bitcoinData.status === 'fulfilled' && bitcoinData.value ?
        `${bitcoinData.value.price_change_percentage_24h?.toFixed(2) || 'N/A'}%` : 'N/A';
      const treasuryYield = treasuryData.status === 'fulfilled' && treasuryData.value ?
        `${treasuryData.value.yield?.toFixed(2) || 'N/A'}%` : 'N/A';
      const inflationRate = inflationData.status === 'fulfilled' && inflationData.value ?
        `${inflationData.value.overall?.rate?.toFixed(2) || 'N/A'}%` : 'N/A';

      const sentiment = sentimentData.status === 'fulfilled' && sentimentData.value ?
        `${sentimentData.value.overall || 'N/A'} (${sentimentData.value.overallScore || 'N/A'}/100)` : 'N/A';

      const contextPrompt = `You are a helpful Bitcoin and cryptocurrency assistant on BitcoinHub, a comprehensive Bitcoin information platform. 

Current live data from our website:
- Bitcoin Price: ${currentPrice} (24h change: ${priceChange24h})
- US 10-Year Treasury: ${treasuryYield} (from Federal Reserve FRED API)
- US Inflation Rate: ${inflationRate} (from Federal Reserve FRED API)
- Market Sentiment: ${sentiment}

Website features include:
- Real-time Bitcoin price tracking and charts
- Federal Reserve economic data (Treasury yields from FRED API)
- Bitcoin network stats (hash rate, difficulty from Blockchain.com)
- Fear & Greed Index and market dominance
- Crypto legislation tracking with AI analysis
- News feed and social sentiment analysis
- Web resources section with trading tools

Answer the user's question about Bitcoin markets, the data on our website, or general cryptocurrency topics. Be helpful, accurate, and reference the current data when relevant. Keep responses concise but informative.

User question: ${question}`;

      // Create intelligent responses using current data or AI when available
      let answer = "";
      
      // Try to provide data-driven responses for common questions
      const questionLower = question.toLowerCase();
      if (questionLower.includes('price') || questionLower.includes('bitcoin')) {
        answer = `Based on the live data from our dashboard:

📊 **Current Bitcoin Price**: ${currentPrice} (24h change: ${priceChange24h})
📈 **Market Sentiment**: ${sentiment}
🏦 **Federal Reserve Data**: 
  • US 10-Year Treasury: ${treasuryYield}
  • US Inflation Rate: ${inflationRate}

The data is updated in real-time from CoinGecko, Federal Reserve FRED API, and other authoritative sources. You can see detailed charts and metrics in the dashboard above.`;
      } else if (questionLower.includes('fed') || questionLower.includes('treasury')) {
        answer = `Here's the current Federal Reserve economic data:

🏛️ **US 10-Year Treasury**: ${treasuryYield} (from FRED API)
📊 **US Inflation Rate**: ${inflationRate} (from FRED API)
💰 **Bitcoin Price**: ${currentPrice} (24h change: ${priceChange24h})

This data comes directly from the Federal Reserve Economic Data (FRED) API and is updated regularly. Treasury yields and inflation significantly impact Bitcoin's price movements as they affect investor risk appetite.`;
      } else if (questionLower.includes('sentiment') || questionLower.includes('market')) {
        answer = `Current market analysis:

📈 **Market Sentiment**: ${sentiment}
💰 **Bitcoin Price**: ${currentPrice} (24h change: ${priceChange24h})
🏦 **Fed Context**: Treasury at ${treasuryYield}, Inflation at ${inflationRate}

Our sentiment analysis combines price action, social media data, derivatives markets, and news sentiment. The dashboard shows detailed breakdowns including Fear & Greed Index, Bitcoin dominance, and technical indicators.`;
      } else {
        // Try AI response if available
        if (process.env.XAI_API_KEY) {
          try {
            const OpenAI = await import('openai').then(m => m.default);
            const openai = new OpenAI({ 
              baseURL: "https://api.x.ai/v1", 
              apiKey: process.env.XAI_API_KEY 
            });

            const response = await openai.chat.completions.create({
              model: "grok-2-1212",
              messages: [
                {
                  role: "system",
                  content: "You are a helpful Bitcoin and cryptocurrency assistant. Provide accurate, helpful responses about Bitcoin markets, trading, and the data available on this website. Keep responses conversational but informative."
                },
                {
                  role: "user",
                  content: contextPrompt
                }
              ],
              max_tokens: 500,
              temperature: 0.7
            });

            answer = response.choices[0]?.message?.content || "";
          } catch (aiError) {
            console.log('AI service temporarily unavailable, using data-driven response');
          }
        }
        
        // Fallback to data-driven response
        if (!answer) {
          answer = `I can help you understand the Bitcoin data on this website! Here's what's currently available:

💰 **Live Bitcoin Price**: ${currentPrice} (24h change: ${priceChange24h})
📊 **Market Sentiment**: ${sentiment}
🏛️ **Federal Reserve Data**: Treasury ${treasuryYield}, Inflation ${inflationRate}

**Available on the dashboard:**
• Real-time price charts and technical indicators
• Federal Reserve economic data (FRED API)
• Bitcoin network statistics (hash rate, difficulty)
• Fear & Greed Index and market dominance
• Crypto legislation tracking
• News feed with sentiment analysis

Feel free to ask about any specific metrics you see in the dashboard!`;
        }
      }

      res.json({ answer });

    } catch (error) {
      console.error('Chatbot error:', error);
      res.json({
        answer: `I can still help with the live data! Here's what's currently available:

💰 **Bitcoin Price**: ${currentPrice} (24h change: ${priceChange24h})
📈 **Market Sentiment**: ${sentiment}
🏦 **Fed Data**: Treasury ${treasuryYield}, Inflation ${inflationRate}

All this data is updated live in the dashboard above. Try asking about specific metrics or explore the charts and widgets for detailed analysis.`
      });
    }
  });

  // Forum
  app.get(`${apiPrefix}/forum/posts`, async (req, res) => {
    try {
      const posts = await storage.getForumPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching forum posts:", error);
      res.status(500).json({ message: "Failed to fetch forum posts" });
    }
  });

  app.get(`${apiPrefix}/forum/posts/latest`, async (req, res) => {
    try {
      const posts = await storage.getLatestForumPosts();
      res.json(posts);
    } catch (error) {
      console.error("Error fetching latest forum posts:", error);
      res.status(500).json({ message: "Failed to fetch latest forum posts" });
    }
  });

  app.post(`${apiPrefix}/forum/posts`, async (req, res) => {
    try {
      // Check if user is authenticated
      const sessionUserId = (req.session as any).userId;
      if (!sessionUserId) {
        return res.status(401).json({ message: "Authentication required to post" });
      }

      // Verify the user exists
      const user = await storage.getUser(sessionUserId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Parse the request body but replace userId with session userId
      const { userId, ...postDataWithoutUserId } = req.body;
      const postData = insertForumPostSchema.parse({
        ...postDataWithoutUserId,
        userId: sessionUserId // Use session user ID instead of request body
      });
      
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(400).json({ message: "Invalid forum post data" });
    }
  });

  // Get replies for a post
  app.get(`${apiPrefix}/forum/posts/:id/replies`, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      const replies = await storage.getPostReplies(postId);
      res.json(replies);
    } catch (error) {
      console.error("Error fetching post replies:", error);
      res.status(500).json({ message: "Failed to fetch post replies" });
    }
  });

  // Toggle reaction on a post
  app.post(`${apiPrefix}/forum/posts/:id/reactions`, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if user is authenticated
      const sessionUserId = (req.session as any).userId;
      if (!sessionUserId) {
        return res.status(401).json({ message: "Authentication required to react" });
      }

      // Verify the user exists
      const user = await storage.getUser(sessionUserId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      
      const { type } = req.body;
      if (!['like', 'love', 'rocket', 'fire'].includes(type)) {
        return res.status(400).json({ message: "Invalid reaction type" });
      }
      
      await storage.toggleReaction(postId, sessionUserId, type);
      
      // Return updated reaction counts
      const reactions = await storage.getPostReactions(postId);
      res.json(reactions);
    } catch (error) {
      console.error("Error toggling reaction:", error);
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });

  // Delete a forum post (only HodlMyBeer21 can delete)
  app.delete(`${apiPrefix}/forum/posts/:id`, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      
      // Check if user is authenticated
      const sessionUserId = (req.session as any).userId;
      if (!sessionUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Get the current user
      const currentUser = await storage.getUser(sessionUserId);
      if (!currentUser) {
        return res.status(401).json({ message: "User not found" });
      }
      
      // Only HodlMyBeer21 can delete posts
      if (currentUser.username !== "HodlMyBeer21") {
        return res.status(403).json({ message: "Only HodlMyBeer21 can delete posts" });
      }
      
      const success = await storage.deleteForumPost(postId, sessionUserId);
      if (!success) {
        return res.status(403).json({ message: "Not authorized to delete this post" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting post:", error);
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // File upload endpoint
  app.post(`${apiPrefix}/upload`, upload.single('file'), handleFileUpload);

  // Static file serving for uploads
  app.use('/static', express.static(path.join(process.cwd(), 'static')));

  // Portfolio - require authentication
  app.get(`${apiPrefix}/portfolio`, requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const portfolio = await storage.getPortfolio(userId);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post(`${apiPrefix}/portfolio/bitcoin`, requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().positive()
      });
      
      const { amount } = schema.parse(req.body);
      const userId = (req.session as any).userId;
      
      const portfolio = await storage.updatePortfolio(userId, "bitcoin", amount);
      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(400).json({ message: "Invalid portfolio data" });
    }
  });

  // Price alerts - require authentication
  app.get(`${apiPrefix}/alerts`, requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const alerts = await storage.getPriceAlerts(userId);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  app.post(`${apiPrefix}/alerts`, requireAuth, async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(["above", "below"]),
        price: z.number().positive()
      });
      
      const { type, price } = schema.parse(req.body);
      const userId = (req.session as any).userId;
      
      const alert = await storage.createPriceAlert({
        userId,
        type,
        price
      });
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(400).json({ message: "Invalid price alert data" });
    }
  });

  app.delete(`${apiPrefix}/alerts/:id`, requireAuth, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      const userId = (req.session as any).userId;
      
      if (isNaN(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      // Verify the alert belongs to the current user before deleting
      const userAlerts = await storage.getPriceAlerts(userId);
      const alertToDelete = userAlerts.find(alert => alert.id === alertId.toString());
      
      if (!alertToDelete) {
        return res.status(404).json({ message: "Alert not found or not owned by user" });
      }
      
      await storage.deletePriceAlert(alertId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting price alert:", error);
      res.status(500).json({ message: "Failed to delete price alert" });
    }
  });

  // Learning progress - require authentication
  app.get(`${apiPrefix}/learning/progress`, requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const progress = await storage.getLearningProgress(userId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching learning progress:", error);
      res.status(500).json({ message: "Failed to fetch learning progress" });
    }
  });

  // Learning paths endpoint
  app.get(`${apiPrefix}/learning/paths`, async (req, res) => {
    try {
      const learningPaths = {
        boomer: {
          id: "boomer-path",
          title: "Bitcoin for Baby Boomers",
          subtitle: "Clear, step-by-step guidance with familiar analogies",
          description: "A comprehensive Bitcoin education program designed specifically for Baby Boomers. Features clear explanations, familiar analogies (Bitcoin as digital gold), and practical guidance without technical jargon.",
          color: "bg-blue-500",
          icon: "👤",
          estimatedTime: "4-5 hours",
          lessons: [
            {
              id: "boomer-1",
              title: "What is Bitcoin? (Simple Introduction)",
              type: "reading",
              duration: "15 min",
              description: "Bitcoin explained using familiar concepts like gold, banking, and traditional investments."
            },
            {
              id: "boomer-2", 
              title: "Why Bitcoin Matters for Your Generation",
              type: "reading",
              duration: "20 min",
              description: "How Bitcoin addresses concerns about inflation, savings protection, and wealth preservation."
            },
            {
              id: "boomer-3",
              title: "Setting Up Your First Bitcoin Wallet",
              type: "video",
              duration: "12 min",
              description: "Step-by-step wallet setup with security best practices."
            },
            {
              id: "boomer-4",
              title: "Buying Bitcoin Safely",
              type: "reading", 
              duration: "18 min",
              description: "How to purchase Bitcoin through trusted platforms with security tips."
            },
            {
              id: "boomer-5",
              title: "Knowledge Check: Bitcoin Basics",
              type: "quiz",
              duration: "10 min",
              description: "Test your understanding of key Bitcoin concepts."
            }
          ]
        },
        millennial: {
          id: "millennial-path",
          title: "Bitcoin for Millennials", 
          subtitle: "Interactive, engaging content with modern presentation",
          description: "A dynamic Bitcoin education designed for Millennials. Features interactive content, modern analogies, and engaging presentations that connect Bitcoin to current financial challenges.",
          color: "bg-orange-500",
          icon: "🚀",
          estimatedTime: "3-4 hours",
          lessons: [
            {
              id: "millennial-1",
              title: "Bitcoin: Your Financial Game Changer",
              type: "video",
              duration: "8 min", 
              description: "Why Bitcoin matters for Millennials facing housing costs and inflation."
            },
            {
              id: "millennial-2",
              title: "Blockchain Tech Explained (No BS)",
              type: "interactive",
              duration: "15 min",
              description: "Interactive blockchain demo showing how transactions work."
            },
            {
              id: "millennial-3", 
              title: "Setting Up Your Stack",
              type: "video",
              duration: "10 min",
              description: "Modern wallet setup and security for the digital generation."
            },
            {
              id: "millennial-4",
              title: "DCA Strategy and HODLing",
              type: "reading",
              duration: "12 min", 
              description: "Dollar-cost averaging and long-term investment strategies."
            },
            {
              id: "millennial-5",
              title: "Level Up Quiz: Bitcoin Mastery",
              type: "quiz",
              duration: "8 min",
              description: "Test your Bitcoin knowledge with modern, relevant questions."
            }
          ]
        },
        dollarDilemma: {
          id: "dollar-dilemma-game",
          title: "The Dollar Dilemma: Economic Adventure",
          subtitle: "Interactive game exploring generational economic challenges",
          description: "An engaging text-based game where Baby Boomers guide Millennials through economic history, exploring how post-WWII policies created today's affordability crisis and how Bitcoin offers solutions.",
          color: "bg-green-500", 
          icon: "🎮",
          estimatedTime: "45-60 min",
          isGame: true,
          gameData: {
            levels: [
              {
                id: 1,
                title: "Post-WWII Boom – The U.S. Becomes the World's Banker",
                story: "After World War II ends in 1945, you're a young Boomer growing up in a prosperous America. The U.S. emerged as the only major power with its economy intact—factories humming, GDP soaring. Europe and Japan are in ruins, so the U.S. steps up as the global financier to rebuild allies and prevent communism's spread.",
                data: {
                  title: "Marshall Plan Impact (1948-1952)",
                  stats: [
                    { label: "U.S. Aid Provided", value: "$13.3 billion", note: "~$140 billion today" },
                    { label: "Countries Aided", value: "16 European nations", note: "Rebuilt industries & trade" },
                    { label: "Trade Balance (1945-1970)", value: "+0.5% to +1.5% GDP", note: "Consistent surpluses" }
                  ]
                },
                quiz: {
                  question: "Why did the U.S. fund Europe's recovery?",
                  options: [
                    "A) For charity alone",
                    "B) To create trading partners and secure influence", 
                    "C) To compete with Soviet aid",
                    "D) All of the above"
                  ],
                  correct: 3,
                  explanation: "It was strategic! The U.S. aimed to create markets, secure influence, and counter Soviet expansion.",
                  points: 10
                }
              },
              {
                id: 2,
                title: "The Shift to Importer – Buying the World's Goods",
                story: "By the 1970s, as a young adult Boomer, you see the U.S. dollar become the world's reserve currency. Rebuilt countries like Japan and Germany start exporting cheap, high-quality goods. The U.S., to support global stability, runs trade deficits—importing more to prop up allies' economies.",
                data: {
                  title: "Trade Deficit Timeline",
                  stats: [
                    { label: "First Deficit (1971)", value: "$2.26 billion", note: "First since 1888" },
                    { label: "2022 Deficit", value: "$958 billion", note: "Massive increase" },
                    { label: "Manufacturing Peak", value: "19.5M jobs (1979)", note: "Down to ~13M by 2023" }
                  ]
                },
                quiz: {
                  question: "What started the persistent U.S. trade deficits?", 
                  options: [
                    "A) Over-importing to support global allies",
                    "B) Ending the gold standard in 1971",
                    "C) Rising foreign competition",
                    "D) All of the above"
                  ],
                  correct: 3,
                  explanation: "All factors combined: supporting allies, abandoning gold standard, and increased competition.",
                  points: 10
                }
              },
              {
                id: 3,
                title: "Hollowing the Middle – Your Generation's Peak vs. Decline",
                story: "As a mid-career Boomer in the 1980s-90s, you benefit from stable jobs and affordable homes. But the system erodes the middle class: Wages stagnate while productivity rises, due to offshoring and imports. Your kids enter a world where 'good jobs' are scarcer.",
                data: {
                  title: "Middle Class Decline (Post-1971)",
                  stats: [
                    { label: "Middle Class (1971)", value: "61% of adults", note: "Down to 51% by 2023" },
                    { label: "Wage vs Productivity Gap", value: "Productivity +61%", note: "Wages only +17% (1979-2021)" },
                    { label: "Inequality Index", value: "0.35 (1970)", note: "Rose to 0.41 by 2022" }
                  ]
                },
                quiz: {
                  question: "How did trade deficits contribute to middle-class decline?",
                  options: [
                    "A) By increasing inflation",
                    "B) Through job losses in manufacturing", 
                    "C) No impact",
                    "D) By boosting wages"
                  ],
                  correct: 1,
                  explanation: "Deindustrialization hit hard! Manufacturing job losses decimated middle-class employment.",
                  points: 10
                }
              },
              {
                id: 4,
                title: "Foreign Profits Loop Back – Inflating U.S. Assets",
                story: "Now retired, you watch foreign countries (holding U.S. dollars from trade surpluses) reinvest in America. They buy stocks and real estate, driving up prices. This boosts your retirement portfolio but prices out your kids.",
                data: {
                  title: "Foreign Investment & Wealth Gap",
                  stats: [
                    { label: "Foreign U.S. Holdings (2023)", value: "$26.9 trillion", note: "Up $2T from 2022" },
                    { label: "Foreign Real Estate Investment", value: ">$1.2 trillion", note: "Last 15 years" },
                    { label: "Top 1% Wealth Share", value: "30%+ (2023)", note: "Was 10% in 1980" }
                  ]
                },
                quiz: {
                  question: "Why does foreign reinvestment widen U.S. inequality?",
                  options: [
                    "A) It inflates asset prices, benefiting owners",
                    "B) It lowers taxes",
                    "C) It creates jobs evenly",
                    "D) No effect"
                  ],
                  correct: 0,
                  explanation: "Assets boom for the wealthy! Foreign money inflates stocks and real estate, benefiting those who already own assets.",
                  points: 10
                }
              },
              {
                id: 5,
                title: "Generational Crunch – Why Your Kids Need Help",
                story: "Your Millennial child can't buy a home like you did at their age. Boomers bought houses for ~$115K median in 1995 (~$230K adjusted); now $445K. They rely on you for down payments amid high costs.",
                data: {
                  title: "Generational Housing Crisis",
                  stats: [
                    { label: "Boomer Homeownership (Age 30)", value: "55%", note: "vs 42% for Millennials" },
                    { label: "Median Home Price (Boomers)", value: "$150K (adjusted)", note: "vs $400K+ for Gen Z" },
                    { label: "Parental Help Required", value: "80% of Millennials", note: "Say housing unaffordable" }
                  ]
                },
                quiz: {
                  question: "Why do Millennials depend more on parental help?",
                  options: [
                    "A) Laziness",
                    "B) Stagnant wages + inflated housing from asset bubbles",
                    "C) Too much avocado toast", 
                    "D) Better jobs now"
                  ],
                  correct: 1,
                  explanation: "Systemic issues! Wages stagnated while asset bubbles inflated housing costs beyond reach.",
                  points: 10
                }
              },
              {
                id: 6,
                title: "Bitcoin as a Fix – Breaking the Fiat Cycle",
                story: "You've seen how fiat money (unlimited printing post-1971) fuels inflation, deficits, and inequality. Bitcoin offers an alternative: decentralized, fixed supply (21 million coins max), no central bank manipulation. It acts as 'sound money' like gold, protecting savings from erosion and reducing wealth transfers to the elite.",
                data: {
                  title: "Bitcoin vs Fiat Money",
                  stats: [
                    { label: "Bitcoin Supply", value: "21 million max", note: "Fixed, unchangeable limit" },
                    { label: "Fiat Inflation Average", value: "2-3% yearly", note: "Erodes purchasing power" },
                    { label: "Potential Impact", value: "Lower inequality", note: "No money printing benefits" }
                  ]
                },
                quiz: {
                  question: "How could Bitcoin help solve these issues?",
                  options: [
                    "A) By allowing unlimited printing",
                    "B) As a fixed-supply asset that fights inflation and asset bubbles",
                    "C) By increasing trade deficits",
                    "D) No way"
                  ],
                  correct: 1,
                  explanation: "Sound money for all! Bitcoin's fixed supply prevents the money printing that creates asset bubbles and inequality.",
                  points: 10
                }
              }
            ]
          }
        }
      };
      
      res.json(learningPaths);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ message: "Failed to fetch learning paths" });
    }
  });

  // Legislation API endpoints
  app.get(`${apiPrefix}/legislation`, async (_req, res) => {
    try {
      const legislationData = await getLegislationData();
      res.json(legislationData);
    } catch (error) {
      console.error("Error fetching legislation data:", error);
      res.status(500).json({ message: "Failed to fetch legislation data" });
    }
  });

  app.post(`${apiPrefix}/legislation/refresh`, async (_req, res) => {
    try {
      const freshData = await refreshLegislationData();
      res.json(freshData);
    } catch (error) {
      console.error("Error refreshing legislation data:", error);
      res.status(500).json({ message: "Failed to refresh legislation data" });
    }
  });

  // Crypto catalysts endpoint
  app.get(`${apiPrefix}/legislation/catalysts`, async (_req, res) => {
    try {
      const { getCryptoCatalysts } = await import('./api/legislation.js');
      const catalystsData = getCryptoCatalysts();
      res.json(catalystsData);
    } catch (error) {
      console.error("Error fetching crypto catalysts:", error);
      res.status(500).json({ message: "Failed to fetch crypto catalysts" });
    }
  });

  // Live indicators analysis endpoint
  app.get(`${apiPrefix}/indicators/live-analysis`, async (req, res) => {
    try {
      const { getLiveIndicatorsAnalysis, clearAnalysisCache } = await import('./api/indicators-analysis.js');
      
      // Force refresh if requested
      if (req.query.refresh === 'true') {
        console.log('🔄 Force refreshing indicators analysis...');
        clearAnalysisCache();
      }
      
      const analysis = await getLiveIndicatorsAnalysis();
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching live indicators analysis:", error);
      res.status(500).json({ 
        message: "Failed to fetch live indicators analysis",
        error: error.message 
      });
    }
  });

  // Admin route for uploading legislation data
  app.post(`${apiPrefix}/legislation/admin-upload`, async (req, res) => {
    try {
      const { password, data } = req.body;
      
      // Simple password protection - in production, use proper authentication
      if (password !== 'HodlMyBeer21Admin') {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate required fields
      if (!data || !data.bills || !Array.isArray(data.bills)) {
        return res.status(400).json({ error: "Invalid data format: bills array required" });
      }

      // Validate each bill has required fields
      const requiredFields = ['billName', 'billNumber', 'description', 'currentStatus', 'nextSteps', 'passageChance', 'whatsNext'];
      for (const bill of data.bills) {
        for (const field of requiredFields) {
          if (!bill[field]) {
            return res.status(400).json({ error: `Missing required field: ${field}` });
          }
        }
      }

      // Add timestamp and store data
      const legislationData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      // Store in cache to override Grok/fallback data
      const { setLegislationCache } = await import('./api/legislation');
      setLegislationCache(legislationData);

      console.log(`Admin uploaded legislation data with ${data.bills.length} bills`);
      res.json({ 
        success: true, 
        message: `Successfully uploaded ${data.bills.length} bills`,
        data: legislationData 
      });
    } catch (error) {
      console.error("Error uploading legislation data:", error);
      res.status(500).json({ error: "Failed to upload legislation data" });
    }
  });

  // Bull Market Peak Indicators from CoinGlass
  app.get(`${apiPrefix}/indicators/bull-market-signals`, async (req, res) => {
    try {
      const indicators = await getCoinglassIndicators();
      res.json(indicators);
    } catch (error) {
      console.error('Error fetching CoinGlass bull market indicators:', error);
      res.status(500).json({ 
        message: "Failed to fetch bull market indicators",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Last updated timestamp
  app.get(`${apiPrefix}/last-updated`, (req, res) => {
    res.json(new Date().toISOString());
  });

  const httpServer = createServer(app);

  return httpServer;
}

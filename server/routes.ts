import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getBitcoinMarketData, getBitcoinChart, getBitcoinPrice } from "./api/cryptocompare";
import { getLatestNews } from "./api/newsapi";
import { getLatestTweets, getTrendingHashtags, getPopularAccounts, getHodlMyBeerFollowing } from "./api/twitter";
import { getRealTruflationData } from "./api/realTruflation";
import { getRealTreasuryData } from "./api/realTreasury";
import { getFedWatchData, getFinancialMarketData } from "./api/financial";
import { getMarketSentiment } from "./api/sentiment";
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

  // Bitcoin dominance route
  app.get(`${apiPrefix}/bitcoin/dominance`, async (req, res) => {
    try {
      const { getBitcoinDominance } = await import('./api/coinmarketcap');
      const dominanceData = await getBitcoinDominance();
      res.json(dominanceData);
    } catch (error) {
      console.error("Error fetching Bitcoin dominance:", error);
      res.status(500).json({ message: "Failed to fetch Bitcoin dominance" });
    }
  });

  // Global crypto metrics route
  app.get(`${apiPrefix}/crypto/global-metrics`, async (req, res) => {
    try {
      const { getGlobalCryptoMetrics } = await import('./api/coinmarketcap');
      const globalMetrics = await getGlobalCryptoMetrics();
      res.json(globalMetrics);
    } catch (error) {
      console.error("Error fetching global crypto metrics:", error);
      res.status(500).json({ message: "Failed to fetch global crypto metrics" });
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
  app.get(`${apiPrefix}/truflation`, async (req, res) => {
    try {
      const data = await getRealTruflationData();
      res.json(data);
    } catch (error) {
      console.error("Error fetching real Truflation data:", error);
      res.status(503).json({ 
        message: "Unable to fetch live data from Truflation.com. Please check if the website is accessible.",
        error: error.message 
      });
    }
  });

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

  app.get(`${apiPrefix}/financial/truflation`, async (_req, res) => {
    try {
      const { getTruflationData } = await import("./api/truflation");
      const truflationData = await getTruflationData();
      res.json(truflationData);
    } catch (error) {
      console.error("Error fetching Truflation data:", error);
      res.status(503).json({ 
        message: "Live Truflation data temporarily unavailable",
        error: "Only authentic data sources are used - no fallback data provided"
      });
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

  // Last updated timestamp
  app.get(`${apiPrefix}/last-updated`, (req, res) => {
    res.json(new Date().toISOString());
  });

  const httpServer = createServer(app);

  return httpServer;
}

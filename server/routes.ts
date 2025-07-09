import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getBitcoinMarketData, getBitcoinChart, getBitcoinPrice } from "./api/cryptocompare";
import { getLatestNews } from "./api/newsapi";
import { getLatestTweets, getTrendingHashtags, getPopularAccounts, getHodlMyBeerFollowing } from "./api/twitter";
import { z } from "zod";
import { insertPriceAlertSchema, insertForumPostSchema, insertPortfolioEntrySchema, insertUserSchema } from "@shared/schema";
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
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword
      });

      // Set session
      (req.session as any).userId = user.id;

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
      const { username, password } = insertUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set session
      (req.session as any).userId = user.id;

      // Return user data (without password)
      const { password: _, ...userData } = user;
      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
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

  // Financial data routes
  app.get(`${apiPrefix}/financial/treasury`, async (_req, res) => {
    try {
      const { getTreasuryData } = await import("./api/financial");
      const treasuryData = await getTreasuryData();
      res.json(treasuryData);
    } catch (error) {
      console.error("Error fetching Treasury data:", error);
      res.status(503).json({ 
        message: "Live Treasury data temporarily unavailable",
        error: "Only authentic data sources are used - no fallback data provided"
      });
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
      const { getAllNotifications } = await import("./api/notifications");
      const notifications = await getAllNotifications();
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post(`${apiPrefix}/notifications/:id/read`, async (req, res) => {
    try {
      const { id } = req.params;
      // In a real app, this would update the database
      // For now, just return success
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
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

  // Portfolio
  app.get(`${apiPrefix}/portfolio`, async (req, res) => {
    try {
      // For demo purposes, we'll use a guest user (id: 1)
      const portfolio = await storage.getPortfolio(1);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post(`${apiPrefix}/portfolio/bitcoin`, async (req, res) => {
    try {
      const schema = z.object({
        amount: z.number().positive()
      });
      
      const { amount } = schema.parse(req.body);
      
      // For demo purposes, we'll use a guest user (id: 1)
      const portfolio = await storage.updatePortfolio(1, "bitcoin", amount);
      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(400).json({ message: "Invalid portfolio data" });
    }
  });

  // Price alerts
  app.get(`${apiPrefix}/alerts`, async (req, res) => {
    try {
      // For demo purposes, we'll use a guest user (id: 1)
      const alerts = await storage.getPriceAlerts(1);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  // Get user's price alerts
  app.get(`${apiPrefix}/alerts`, async (req, res) => {
    try {
      // For demo purposes, we'll use a guest user (id: 1)
      const alerts = await storage.getPriceAlerts(1);
      res.json(alerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  app.post(`${apiPrefix}/alerts`, async (req, res) => {
    try {
      const schema = z.object({
        type: z.enum(["above", "below"]),
        price: z.number().positive()
      });
      
      const { type, price } = schema.parse(req.body);
      
      // For demo purposes, we'll use a guest user (id: 1)
      const alert = await storage.createPriceAlert({
        userId: 1,
        type,
        price
      });
      
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(400).json({ message: "Invalid price alert data" });
    }
  });

  app.delete(`${apiPrefix}/alerts/:id`, async (req, res) => {
    try {
      const alertId = parseInt(req.params.id);
      
      if (isNaN(alertId)) {
        return res.status(400).json({ message: "Invalid alert ID" });
      }
      
      await storage.deletePriceAlert(alertId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting price alert:", error);
      res.status(500).json({ message: "Failed to delete price alert" });
    }
  });

  // Learning progress
  app.get(`${apiPrefix}/learning/progress`, async (req, res) => {
    try {
      // For demo purposes, we'll use a guest user (id: 1)
      const progress = await storage.getLearningProgress(1);
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

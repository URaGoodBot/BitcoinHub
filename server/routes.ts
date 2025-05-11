import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getBitcoinMarketData, getBitcoinChart, getBitcoinPrice } from "./api/cryptocompare";
import { getLatestNews } from "./api/newsapi";
import { getLatestTweets, getTrendingHashtags, getPopularAccounts } from "./api/twitter";
import { z } from "zod";
import { insertPriceAlertSchema, insertForumPostSchema, insertPortfolioEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

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
      const postData = insertForumPostSchema.parse(req.body);
      const post = await storage.createForumPost(postData);
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating forum post:", error);
      res.status(400).json({ message: "Invalid forum post data" });
    }
  });

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

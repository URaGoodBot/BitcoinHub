import { 
  users, type User, type InsertUser,
  priceAlerts, type PriceAlert, type InsertPriceAlert,
  forumPosts, type ForumPost, type InsertForumPost,
  forumComments, type ForumComment, type InsertForumComment,
  portfolioEntries, type PortfolioEntry, type InsertPortfolioEntry,
  dailyTips, type DailyTip, type InsertDailyTip,
  learningProgress, type LearningProgress, type InsertLearningProgress
} from "@shared/schema";
import { getBitcoinPrice } from "./api/coincap";
import { ForumPost as ForumPostType, DailyTip as DailyTipType, LearningProgress as LearningProgressType, PriceAlert as PriceAlertType, Portfolio } from "@/lib/types";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Forum operations
  getForumPosts(): Promise<ForumPostType[]>;
  getLatestForumPosts(limit?: number): Promise<ForumPostType[]>;
  getForumPost(id: number): Promise<ForumPostType | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPostType>;
  
  // Portfolio operations
  getPortfolio(userId: number): Promise<Portfolio>;
  updatePortfolio(userId: number, asset: string, amount: number): Promise<Portfolio>;
  
  // Price alert operations
  getPriceAlerts(userId: number): Promise<PriceAlertType[]>;
  createPriceAlert(alert: InsertPriceAlert): Promise<PriceAlertType>;
  deletePriceAlert(id: number): Promise<void>;
  
  // Daily tip operations
  getDailyTip(): Promise<DailyTipType>;
  
  // Learning progress operations
  getLearningProgress(userId: number): Promise<LearningProgressType>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private alerts: Map<number, PriceAlert>;
  private posts: Map<number, ForumPost>;
  private comments: Map<number, ForumComment>;
  private portfolios: Map<number, PortfolioEntry>;
  private tips: DailyTip[];
  private progress: Map<number, LearningProgress>;
  
  private userIdCounter: number;
  private alertIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;
  private portfolioIdCounter: number;
  private tipIdCounter: number;
  private progressIdCounter: number;

  constructor() {
    this.users = new Map();
    this.alerts = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.portfolios = new Map();
    this.tips = [];
    this.progress = new Map();
    
    this.userIdCounter = 1;
    this.alertIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.portfolioIdCounter = 1;
    this.tipIdCounter = 1;
    this.progressIdCounter = 1;
    
    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData() {
    // Create a guest user
    this.users.set(1, {
      id: 1,
      username: "Guest",
      password: "",
      streakDays: 5,
      createdAt: new Date()
    });
    
    // Create sample forum posts
    this.createForumPost({
      userId: 1,
      title: "What's the safest hardware wallet for small holdings?",
      content: "I'm new to Bitcoin and looking for recommendations on a beginner-friendly hardware wallet that doesn't break the bank. I've heard about Ledger and Trezor but I'm not sure which one is better for a beginner with a small amount of Bitcoin.",
      categories: ["Wallets"]
    });
    
    this.createForumPost({
      userId: 1,
      title: "Discussion: What's your Bitcoin price prediction for EOY?",
      content: "With the recent pump and macro environment changing, I'm curious what everyone thinks about BTC's price by the end of the year. I'm personally thinking we might see $60k again if the market sentiment continues to improve.",
      categories: ["Price Discussion"]
    });
    
    // Add daily tips
    this.tips.push({
      id: this.tipIdCounter++,
      title: "Back Up Your Recovery Phrase",
      content: "Always store your wallet recovery phrase in multiple secure locations. Consider using a metal backup solution to protect against fire and water damage.",
      category: "Security",
      createdAt: new Date()
    });
    
    this.tips.push({
      id: this.tipIdCounter++,
      title: "Use Hardware Wallets",
      content: "For significant Bitcoin holdings, always use a hardware wallet. They provide an extra layer of security by keeping your private keys offline.",
      category: "Security",
      createdAt: new Date()
    });
    
    this.tips.push({
      id: this.tipIdCounter++,
      title: "Verify Receiving Addresses",
      content: "Always double-check Bitcoin addresses before sending funds. Consider sending a small test amount first for large transactions.",
      category: "Security",
      createdAt: new Date()
    });
    
    // Add learning progress
    this.progress.set(1, {
      id: this.progressIdCounter++,
      userId: 1,
      courseId: "bitcoin-basics",
      completedLessons: 2,
      updatedAt: new Date()
    });
    
    // Add sample price alerts
    this.createPriceAlert({
      userId: 1,
      type: "above",
      price: 42000
    });
    
    this.createPriceAlert({
      userId: 1,
      type: "below",
      price: 38000
    });
    
    // Add portfolio entry
    this.updatePortfolio(1, "bitcoin", 0.2912);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { 
      ...insertUser, 
      id, 
      streakDays: 0,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }
  
  // Forum operations
  async getForumPosts(): Promise<ForumPostType[]> {
    return Array.from(this.posts.values()).map(post => this.formatForumPost(post));
  }
  
  async getLatestForumPosts(limit: number = 2): Promise<ForumPostType[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map(post => this.formatForumPost(post));
  }
  
  async getForumPost(id: number): Promise<ForumPostType | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    return this.formatForumPost(post);
  }
  
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPostType> {
    const id = this.postIdCounter++;
    const post: ForumPost = {
      ...insertPost,
      id,
      upvotes: 0,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return this.formatForumPost(post);
  }
  
  private formatForumPost(post: ForumPost): ForumPostType {
    const user = this.users.get(post.userId);
    const comments = Array.from(this.comments.values())
      .filter(comment => comment.postId === post.id);
      
    return {
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      author: {
        id: post.userId.toString(),
        username: user?.username || "Unknown",
      },
      createdAt: post.createdAt.toISOString(),
      commentCount: comments.length,
      upvotes: post.upvotes,
      categories: post.categories
    };
  }
  
  // Portfolio operations
  async getPortfolio(userId: number): Promise<Portfolio> {
    const portfolioEntries = Array.from(this.portfolios.values())
      .filter(entry => entry.userId === userId);
      
    const bitcoinEntry = portfolioEntries.find(entry => entry.asset === "bitcoin");
    const bitcoinAmount = bitcoinEntry?.amount || 0;
    
    // Get current Bitcoin price for portfolio valuation
    const bitcoinPrice = await getBitcoinPrice();
    const bitcoinValue = bitcoinAmount * bitcoinPrice.usd;
    
    // Calculate 24h change
    const dailyChange = bitcoinValue * (bitcoinPrice.usd_24h_change / 100);
    const dailyChangePercentage = bitcoinPrice.usd_24h_change;
    
    return {
      totalValue: bitcoinValue,
      dailyChange,
      dailyChangePercentage,
      holdings: {
        bitcoin: {
          amount: bitcoinAmount,
          value: bitcoinValue
        }
      }
    };
  }
  
  async updatePortfolio(userId: number, asset: string, amount: number): Promise<Portfolio> {
    const existingEntries = Array.from(this.portfolios.values())
      .filter(entry => entry.userId === userId && entry.asset === asset);
      
    if (existingEntries.length > 0) {
      // Update existing entry
      const entry = existingEntries[0];
      entry.amount = amount;
      entry.updatedAt = new Date();
      this.portfolios.set(entry.id, entry);
    } else {
      // Create new entry
      const id = this.portfolioIdCounter++;
      const entry: PortfolioEntry = {
        id,
        userId,
        asset,
        amount,
        updatedAt: new Date()
      };
      this.portfolios.set(id, entry);
    }
    
    // Return updated portfolio
    return this.getPortfolio(userId);
  }
  
  // Price alert operations
  async getPriceAlerts(userId: number): Promise<PriceAlertType[]> {
    return Array.from(this.alerts.values())
      .filter(alert => alert.userId === userId)
      .map(alert => ({
        id: alert.id.toString(),
        type: alert.type as 'above' | 'below',
        price: alert.price,
        created: alert.createdAt.toISOString()
      }));
  }
  
  async createPriceAlert(insertAlert: InsertPriceAlert): Promise<PriceAlertType> {
    const id = this.alertIdCounter++;
    const alert: PriceAlert = {
      ...insertAlert,
      id,
      isTriggered: false,
      createdAt: new Date(),
      notifiedAt: null
    };
    this.alerts.set(id, alert);
    
    return {
      id: alert.id.toString(),
      type: alert.type as 'above' | 'below',
      price: alert.price,
      created: alert.createdAt.toISOString()
    };
  }
  
  async deletePriceAlert(id: number): Promise<void> {
    this.alerts.delete(id);
  }
  
  // Daily tip operations
  async getDailyTip(): Promise<DailyTipType> {
    // Return a random tip from the collection
    // In a real app, this would be selected based on the current date
    const randomIndex = Math.floor(Math.random() * this.tips.length);
    const tip = this.tips[randomIndex];
    
    return {
      id: tip.id.toString(),
      title: tip.title,
      content: tip.content
    };
  }
  
  // Learning progress operations
  async getLearningProgress(userId: number): Promise<LearningProgressType> {
    const userProgress = Array.from(this.progress.values())
      .find(progress => progress.userId === userId);
      
    if (!userProgress) {
      // Return default progress if none exists
      return {
        courseName: "Bitcoin Basics",
        completed: 0,
        total: 5,
        lessons: [
          {
            title: "How to Choose a Wallet",
            icon: "wallet",
            duration: "10 min"
          },
          {
            title: "Private Keys Explained",
            icon: "key",
            duration: "8 min"
          }
        ]
      };
    }
    
    return {
      courseName: "Bitcoin Basics",
      completed: userProgress.completedLessons,
      total: 5,
      lessons: [
        {
          title: "How to Choose a Wallet",
          icon: "wallet",
          duration: "10 min"
        },
        {
          title: "Private Keys Explained",
          icon: "key",
          duration: "8 min"
        }
      ]
    };
  }
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async getForumPosts(): Promise<ForumPostType[]> {
    const posts = await db.select().from(forumPosts);
    return Promise.all(posts.map(post => this.formatForumPost(post)));
  }
  
  async getLatestForumPosts(limit: number = 2): Promise<ForumPostType[]> {
    const posts = await db.select()
      .from(forumPosts)
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit);
      
    return Promise.all(posts.map(post => this.formatForumPost(post)));
  }
  
  async getForumPost(id: number): Promise<ForumPostType | undefined> {
    const [post] = await db.select().from(forumPosts).where(eq(forumPosts.id, id));
    if (!post) return undefined;
    return this.formatForumPost(post);
  }
  
  async createForumPost(insertPost: InsertForumPost): Promise<ForumPostType> {
    const [post] = await db
      .insert(forumPosts)
      .values(insertPost)
      .returning();
      
    return this.formatForumPost(post);
  }
  
  private async formatForumPost(post: ForumPost): Promise<ForumPostType> {
    const [user] = post.userId 
      ? await db.select().from(users).where(eq(users.id, post.userId))
      : [undefined];
      
    const comments = await db.select().from(forumComments)
      .where(eq(forumComments.postId, post.id));
      
    return {
      id: post.id.toString(),
      title: post.title,
      content: post.content,
      author: {
        id: post.userId ? post.userId.toString() : "0",
        username: user?.username || "Unknown",
      },
      createdAt: post.createdAt.toISOString(),
      commentCount: comments.length,
      upvotes: post.upvotes,
      categories: post.categories
    };
  }
  
  async getPortfolio(userId: number): Promise<Portfolio> {
    const entries = await db.select()
      .from(portfolioEntries)
      .where(eq(portfolioEntries.userId, userId));
      
    const bitcoinEntry = entries.find(entry => entry.asset === "bitcoin");
    const bitcoinAmount = bitcoinEntry?.amount || 0;
    
    // Get current Bitcoin price for portfolio valuation
    const bitcoinPrice = await getBitcoinPrice();
    const bitcoinValue = bitcoinAmount * bitcoinPrice.usd;
    
    // Calculate 24h change
    const dailyChange = bitcoinValue * (bitcoinPrice.usd_24h_change / 100);
    const dailyChangePercentage = bitcoinPrice.usd_24h_change;
    
    return {
      totalValue: bitcoinValue,
      dailyChange,
      dailyChangePercentage,
      holdings: {
        bitcoin: {
          amount: bitcoinAmount,
          value: bitcoinValue
        }
      }
    };
  }
  
  async updatePortfolio(userId: number, asset: string, amount: number): Promise<Portfolio> {
    const [existingEntry] = await db.select()
      .from(portfolioEntries)
      .where(and(
        eq(portfolioEntries.userId, userId),
        eq(portfolioEntries.asset, asset)
      ));
      
    if (existingEntry) {
      // Update existing entry
      await db.update(portfolioEntries)
        .set({ amount, updatedAt: new Date() })
        .where(eq(portfolioEntries.id, existingEntry.id));
    } else {
      // Create new entry
      await db.insert(portfolioEntries)
        .values({
          userId,
          asset,
          amount,
        });
    }
    
    // Return updated portfolio
    return this.getPortfolio(userId);
  }
  
  async getPriceAlerts(userId: number): Promise<PriceAlertType[]> {
    const alerts = await db.select()
      .from(priceAlerts)
      .where(eq(priceAlerts.userId, userId));
      
    return alerts.map(alert => ({
      id: alert.id.toString(),
      type: alert.type as 'above' | 'below',
      price: alert.price,
      created: alert.createdAt.toISOString()
    }));
  }
  
  async createPriceAlert(insertAlert: InsertPriceAlert): Promise<PriceAlertType> {
    const [alert] = await db
      .insert(priceAlerts)
      .values(insertAlert)
      .returning();
    
    return {
      id: alert.id.toString(),
      type: alert.type as 'above' | 'below',
      price: alert.price,
      created: alert.createdAt.toISOString()
    };
  }
  
  async deletePriceAlert(id: number): Promise<void> {
    await db.delete(priceAlerts).where(eq(priceAlerts.id, id));
  }
  
  async getDailyTip(): Promise<DailyTipType> {
    // Get count of tips
    const countResult = await db.select({ count: sql`count(*)` }).from(dailyTips);
    const count = Number(countResult[0].count);
    
    if (count === 0) {
      // No tips in database, return a default tip
      return {
        id: "0",
        title: "Welcome to Bitcoin Hub",
        content: "Stay tuned for daily Bitcoin tips and best practices."
      };
    }
    
    // Get a random tip
    const randomOffset = Math.floor(Math.random() * count);
    const [tip] = await db.select().from(dailyTips).limit(1).offset(randomOffset);
    
    return {
      id: tip.id.toString(),
      title: tip.title,
      content: tip.content
    };
  }
  
  async getLearningProgress(userId: number): Promise<LearningProgressType> {
    const [progress] = await db.select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId));
      
    if (!progress) {
      // Return default progress if none exists
      return {
        courseName: "Bitcoin Basics",
        completed: 0,
        total: 5,
        lessons: [
          {
            title: "How to Choose a Wallet",
            icon: "wallet",
            duration: "10 min"
          },
          {
            title: "Private Keys Explained",
            icon: "key",
            duration: "8 min"
          }
        ]
      };
    }
    
    return {
      courseName: "Bitcoin Basics",
      completed: progress.completedLessons,
      total: 5,
      lessons: [
        {
          title: "How to Choose a Wallet",
          icon: "wallet",
          duration: "10 min"
        },
        {
          title: "Private Keys Explained",
          icon: "key",
          duration: "8 min"
        }
      ]
    };
  }
}

// Import necessary functions from drizzle-orm
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "./db";

// Use the database storage implementation
export const storage = new DatabaseStorage();

import { 
  users, type User, type InsertUser,
  forumPosts, type ForumPost, type InsertForumPost,
  postReactions, type PostReaction, type InsertPostReaction,
  forumComments, type ForumComment, type InsertForumComment,
  portfolioEntries, type PortfolioEntry, type InsertPortfolioEntry,
  dailyTips, type DailyTip, type InsertDailyTip,
  learningProgress, type LearningProgress, type InsertLearningProgress
} from "../shared/schema";
import { getBitcoinPrice } from "./api/cryptocompare";
import { ForumPost as ForumPostType, DailyTip as DailyTipType, LearningProgress as LearningProgressType, Portfolio } from "../client/src/lib/types";
import { db } from "./db";
import { eq, and, desc, sql, or, gt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  verifyEmail(token: string): Promise<boolean>;
  setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  
  // Forum operations
  getForumPosts(userId?: number): Promise<ForumPostType[]>;
  getLatestForumPosts(limit?: number): Promise<ForumPostType[]>;
  getForumPost(id: number): Promise<ForumPostType | undefined>;
  createForumPost(post: InsertForumPost): Promise<ForumPostType>;
  getPostReplies(postId: number, userId?: number): Promise<ForumPostType[]>;
  
  // Reaction operations
  toggleReaction(postId: number, userId: number, reactionType: string): Promise<void>;
  getPostReactions(postId: number): Promise<{[key: string]: number}>;
  
  // Delete operations (only for HodlMyBeer21)
  deleteForumPost(postId: number, userId: number): Promise<boolean>;
  
  // Portfolio operations
  getPortfolio(userId: number): Promise<Portfolio>;
  updatePortfolio(userId: number, asset: string, amount: number): Promise<Portfolio>;
  
  // Daily tip operations
  getDailyTip(): Promise<DailyTipType>;
  
  // Learning progress operations
  getLearningProgress(userId: number): Promise<LearningProgressType>;
}

// DatabaseStorage implementation using Drizzle ORM with PostgreSQL
export class DatabaseStorage implements IStorage {
  constructor() {}

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

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByUsernameOrEmail(usernameOrEmail: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail)));
    return user || undefined;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async verifyEmail(token: string): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.emailVerificationToken, token),
            gt(users.emailVerificationExpiry, new Date())
          )
        );

      if (!user) return false;

      await db
        .update(users)
        .set({
          isEmailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return true;
    } catch (error) {
      console.error('Error verifying email:', error);
      return false;
    }
  }

  async setPasswordResetToken(email: string, token: string, expiry: Date): Promise<boolean> {
    try {
      await db
        .update(users)
        .set({
          passwordResetToken: token,
          passwordResetExpiry: expiry,
          updatedAt: new Date(),
        })
        .where(eq(users.email, email));

      return true;
    } catch (error) {
      console.error('Error setting password reset token:', error);
      return false;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.passwordResetToken, token),
            gt(users.passwordResetExpiry, new Date())
          )
        );

      if (!user) return false;

      await db
        .update(users)
        .set({
          password: newPassword,
          passwordResetToken: null,
          passwordResetExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return true;
    } catch (error) {
      console.error('Error resetting password:', error);
      return false;
    }
  }

  async getForumPosts(userId?: number): Promise<ForumPostType[]> {
    const posts = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        imageUrl: forumPosts.imageUrl,
        fileName: forumPosts.fileName,
        fileType: forumPosts.fileType,
        fileSize: forumPosts.fileSize,
        memeCaption: forumPosts.memeCaption,
        memeTemplate: forumPosts.memeTemplate,
        categories: forumPosts.categories,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        commentCount: forumPosts.commentCount,
        isReply: forumPosts.isReply,
        parentPostId: forumPosts.parentPostId,
        mentions: forumPosts.mentions,
        hashtags: forumPosts.hashtags,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        userId: forumPosts.userId,
        username: users.username
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.isReply, false))
      .orderBy(desc(forumPosts.createdAt));

    return posts.map(post => ({
      ...post,
      id: post.id.toString(),
      userId: post.userId?.toString(),
      parentPostId: post.parentPostId?.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  }

  async getLatestForumPosts(limit: number = 10): Promise<ForumPostType[]> {
    const posts = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        imageUrl: forumPosts.imageUrl,
        fileName: forumPosts.fileName,
        fileType: forumPosts.fileType,
        fileSize: forumPosts.fileSize,
        memeCaption: forumPosts.memeCaption,
        memeTemplate: forumPosts.memeTemplate,
        categories: forumPosts.categories,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        commentCount: forumPosts.commentCount,
        isReply: forumPosts.isReply,
        parentPostId: forumPosts.parentPostId,
        mentions: forumPosts.mentions,
        hashtags: forumPosts.hashtags,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        userId: forumPosts.userId,
        username: users.username
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.isReply, false))
      .orderBy(desc(forumPosts.createdAt))
      .limit(limit);

    return posts.map(post => ({
      ...post,
      id: post.id.toString(),
      userId: post.userId?.toString(),
      parentPostId: post.parentPostId?.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }));
  }

  async getForumPost(id: number): Promise<ForumPostType | undefined> {
    const [post] = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        imageUrl: forumPosts.imageUrl,
        fileName: forumPosts.fileName,
        fileType: forumPosts.fileType,
        fileSize: forumPosts.fileSize,
        memeCaption: forumPosts.memeCaption,
        memeTemplate: forumPosts.memeTemplate,
        categories: forumPosts.categories,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        commentCount: forumPosts.commentCount,
        isReply: forumPosts.isReply,
        parentPostId: forumPosts.parentPostId,
        mentions: forumPosts.mentions,
        hashtags: forumPosts.hashtags,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        userId: forumPosts.userId,
        username: users.username
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(eq(forumPosts.id, id));

    if (!post) return undefined;

    return {
      ...post,
      id: post.id.toString(),
      userId: post.userId?.toString(),
      parentPostId: post.parentPostId?.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }

  async createForumPost(insertPost: InsertForumPost): Promise<ForumPostType> {
    const [post] = await db
      .insert(forumPosts)
      .values(insertPost)
      .returning();

    const [userResult] = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.id, post.userId!));

    return {
      ...post,
      id: post.id.toString(),
      userId: post.userId?.toString(),
      parentPostId: post.parentPostId?.toString(),
      username: userResult?.username || 'Unknown',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    };
  }

  async getPostReplies(postId: number, userId?: number): Promise<ForumPostType[]> {
    const replies = await db
      .select({
        id: forumPosts.id,
        title: forumPosts.title,
        content: forumPosts.content,
        imageUrl: forumPosts.imageUrl,
        fileName: forumPosts.fileName,
        fileType: forumPosts.fileType,
        fileSize: forumPosts.fileSize,
        memeCaption: forumPosts.memeCaption,
        memeTemplate: forumPosts.memeTemplate,
        categories: forumPosts.categories,
        upvotes: forumPosts.upvotes,
        downvotes: forumPosts.downvotes,
        commentCount: forumPosts.commentCount,
        isReply: forumPosts.isReply,
        parentPostId: forumPosts.parentPostId,
        mentions: forumPosts.mentions,
        hashtags: forumPosts.hashtags,
        createdAt: forumPosts.createdAt,
        updatedAt: forumPosts.updatedAt,
        userId: forumPosts.userId,
        username: users.username
      })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.userId, users.id))
      .where(and(eq(forumPosts.parentPostId, postId), eq(forumPosts.isReply, true)))
      .orderBy(forumPosts.createdAt);

    return replies.map(reply => ({
      ...reply,
      id: reply.id.toString(),
      userId: reply.userId?.toString(),
      parentPostId: reply.parentPostId?.toString(),
      createdAt: reply.createdAt.toISOString(),
      updatedAt: reply.updatedAt.toISOString()
    }));
  }

  async toggleReaction(postId: number, userId: number, reactionType: string): Promise<void> {
    // Check if reaction already exists
    const [existingReaction] = await db
      .select()
      .from(postReactions)
      .where(and(
        eq(postReactions.postId, postId),
        eq(postReactions.userId, userId),
        eq(postReactions.reactionType, reactionType)
      ));

    if (existingReaction) {
      // Remove reaction
      await db
        .delete(postReactions)
        .where(eq(postReactions.id, existingReaction.id));
    } else {
      // Add reaction
      await db
        .insert(postReactions)
        .values({
          postId,
          userId,
          reactionType
        });
    }

    // Update reaction counts in the post
    const reactions = await this.getPostReactions(postId);
    const upvotes = reactions.upvote || 0;
    const downvotes = reactions.downvote || 0;

    await db
      .update(forumPosts)
      .set({ upvotes, downvotes, updatedAt: new Date() })
      .where(eq(forumPosts.id, postId));
  }

  async getPostReactions(postId: number): Promise<{[key: string]: number}> {
    const reactions = await db
      .select({
        reactionType: postReactions.reactionType,
        count: sql<number>`count(*)`.as('count')
      })
      .from(postReactions)
      .where(eq(postReactions.postId, postId))
      .groupBy(postReactions.reactionType);

    const reactionCounts: {[key: string]: number} = {};
    reactions.forEach(reaction => {
      reactionCounts[reaction.reactionType] = Number(reaction.count);
    });

    return reactionCounts;
  }

  async deleteForumPost(postId: number, userId: number): Promise<boolean> {
    // Only allow HodlMyBeer21 (userId 1) to delete posts
    if (userId !== 1) {
      return false;
    }

    try {
      // First delete all reactions for this post
      await db
        .delete(postReactions)
        .where(eq(postReactions.postId, postId));

      // Then delete the post
      const result = await db
        .delete(forumPosts)
        .where(eq(forumPosts.id, postId));

      return true;
    } catch (error) {
      console.error('Error deleting forum post:', error);
      return false;
    }
  }

  async getPortfolio(userId: number): Promise<Portfolio> {
    const entries = await db
      .select()
      .from(portfolioEntries)
      .where(eq(portfolioEntries.userId, userId));

    // Calculate total value
    let totalValue = 0;
    const bitcoinPrice = await getBitcoinPrice();
    
    const portfolioData: Portfolio = {
      userId: userId.toString(),
      entries: [],
      totalValue: 0
    };

    for (const entry of entries) {
      const value = entry.amount * bitcoinPrice;
      totalValue += value;
      
      portfolioData.entries.push({
        id: entry.id.toString(),
        userId: entry.userId.toString(),
        asset: entry.asset,
        amount: entry.amount,
        value: value,
        createdAt: entry.createdAt.toISOString(),
        updatedAt: entry.updatedAt.toISOString()
      });
    }

    portfolioData.totalValue = totalValue;
    return portfolioData;
  }

  async updatePortfolio(userId: number, asset: string, amount: number): Promise<Portfolio> {
    // Check if entry exists
    const [existingEntry] = await db
      .select()
      .from(portfolioEntries)
      .where(and(eq(portfolioEntries.userId, userId), eq(portfolioEntries.asset, asset)));

    if (existingEntry) {
      // Update existing entry
      await db
        .update(portfolioEntries)
        .set({ amount, updatedAt: new Date() })
        .where(eq(portfolioEntries.id, existingEntry.id));
    } else {
      // Create new entry
      await db
        .insert(portfolioEntries)
        .values({
          userId,
          asset,
          amount
        });
    }

    return this.getPortfolio(userId);
  }

  async getDailyTip(): Promise<DailyTipType> {
    const tips = await db
      .select()
      .from(dailyTips)
      .orderBy(sql`RANDOM()`)
      .limit(1);

    if (tips.length === 0) {
      // Return a default tip if no tips in database
      return {
        id: "1",
        title: "Back Up Your Recovery Phrase",
        content: "Always store your wallet recovery phrase in multiple secure locations. Consider using a metal backup solution to protect against fire and water damage.",
        category: "Security",
        createdAt: new Date().toISOString()
      };
    }

    const tip = tips[0];
    return {
      id: tip.id.toString(),
      title: tip.title,
      content: tip.content,
      category: tip.category,
      createdAt: tip.createdAt.toISOString()
    };
  }

  async getLearningProgress(userId: number): Promise<LearningProgressType> {
    const [progress] = await db
      .select()
      .from(learningProgress)
      .where(eq(learningProgress.userId, userId));

    if (!progress) {
      // Return default progress for new users
      return {
        id: "0",
        userId: userId.toString(),
        courseId: "bitcoin-basics",
        completedLessons: 0,
        totalLessons: 10,
        lastAccessedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    return {
      id: progress.id.toString(),
      userId: progress.userId.toString(),
      courseId: progress.courseId,
      completedLessons: progress.completedLessons,
      totalLessons: progress.totalLessons,
      lastAccessedAt: progress.lastAccessedAt?.toISOString() || new Date().toISOString(),
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString()
    };
  }
}

export const storage: IStorage = new DatabaseStorage();
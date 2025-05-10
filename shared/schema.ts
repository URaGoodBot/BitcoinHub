import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  streakDays: integer("streak_days").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Bitcoin price alerts
export const priceAlerts = pgTable("price_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'above' or 'below'
  price: doublePrecision("price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  isTriggered: boolean("is_triggered").default(false).notNull(),
  notifiedAt: timestamp("notified_at"),
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  userId: true,
  type: true,
  price: true,
});

// Forum posts
export const forumPosts = pgTable("forum_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  categories: text("categories").array().notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumPostSchema = createInsertSchema(forumPosts).pick({
  userId: true,
  title: true,
  content: true,
  categories: true,
});

// Forum comments
export const forumComments = pgTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => forumPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertForumCommentSchema = createInsertSchema(forumComments).pick({
  postId: true,
  userId: true,
  content: true,
});

// Portfolio entries
export const portfolioEntries = pgTable("portfolio_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  asset: text("asset").notNull(), // 'bitcoin'
  amount: doublePrecision("amount").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPortfolioEntrySchema = createInsertSchema(portfolioEntries).pick({
  userId: true,
  asset: true,
  amount: true,
});

// Daily tips
export const dailyTips = pgTable("daily_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDailyTipSchema = createInsertSchema(dailyTips).pick({
  title: true,
  content: true,
  category: true,
});

// Learning progress
export const learningProgress = pgTable("learning_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }),
  courseId: text("course_id").notNull(),
  completedLessons: integer("completed_lessons").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLearningProgressSchema = createInsertSchema(learningProgress).pick({
  userId: true,
  courseId: true,
  completedLessons: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = z.infer<typeof insertForumPostSchema>;

export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = z.infer<typeof insertForumCommentSchema>;

export type PortfolioEntry = typeof portfolioEntries.$inferSelect;
export type InsertPortfolioEntry = z.infer<typeof insertPortfolioEntrySchema>;

export type DailyTip = typeof dailyTips.$inferSelect;
export type InsertDailyTip = z.infer<typeof insertDailyTipSchema>;

export type LearningProgress = typeof learningProgress.$inferSelect;
export type InsertLearningProgress = z.infer<typeof insertLearningProgressSchema>;

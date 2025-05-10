import { db } from "./db";
import { users, forumPosts, dailyTips, priceAlerts, portfolioEntries, learningProgress } from "@shared/schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  
  try {
    // Check if users table already has data
    const existingUsers = await db.select({ count: sql`count(*)` }).from(users);
    if (Number(existingUsers[0].count) > 0) {
      console.log("Database already seeded, skipping");
      return;
    }
    
    // Create a guest user
    const [user] = await db.insert(users)
      .values({
        username: "Guest",
        password: "",
        streakDays: 5
      })
      .returning();
    
    console.log("Created user:", user);
    
    // Create sample forum posts
    await db.insert(forumPosts)
      .values([
        {
          userId: user.id,
          title: "What's the safest hardware wallet for small holdings?",
          content: "I'm new to Bitcoin and looking for recommendations on a beginner-friendly hardware wallet that doesn't break the bank. I've heard about Ledger and Trezor but I'm not sure which one is better for a beginner with a small amount of Bitcoin.",
          categories: ["Wallets"],
          upvotes: 0
        },
        {
          userId: user.id,
          title: "Discussion: What's your Bitcoin price prediction for EOY?",
          content: "With the recent pump and macro environment changing, I'm curious what everyone thinks about BTC's price by the end of the year. I'm personally thinking we might see $60k again if the market sentiment continues to improve.",
          categories: ["Price Discussion"],
          upvotes: 0
        }
      ]);
    
    console.log("Created forum posts");
    
    // Add daily tips
    await db.insert(dailyTips)
      .values([
        {
          title: "Back Up Your Recovery Phrase",
          content: "Always store your wallet recovery phrase in multiple secure locations. Consider using a metal backup solution to protect against fire and water damage.",
          category: "Security"
        },
        {
          title: "Use Hardware Wallets",
          content: "For significant Bitcoin holdings, always use a hardware wallet. They provide an extra layer of security by keeping your private keys offline.",
          category: "Security"
        },
        {
          title: "Verify Receiving Addresses",
          content: "Always double-check Bitcoin addresses before sending funds. Consider sending a small test amount first for large transactions.",
          category: "Security"
        }
      ]);
    
    console.log("Created daily tips");
    
    // Add sample price alerts
    await db.insert(priceAlerts)
      .values([
        {
          userId: user.id,
          type: "above",
          price: 42000
        },
        {
          userId: user.id,
          type: "below",
          price: 38000
        }
      ]);
    
    console.log("Created price alerts");
    
    // Add portfolio entry
    await db.insert(portfolioEntries)
      .values({
        userId: user.id,
        asset: "bitcoin",
        amount: 0.2912
      });
    
    console.log("Created portfolio entry");
    
    // Add learning progress
    await db.insert(learningProgress)
      .values({
        userId: user.id,
        courseId: "bitcoin-basics",
        completedLessons: 2
      });
    
    console.log("Created learning progress");
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed().catch(console.error);
import { db } from "./db";
import { users, forumPosts, dailyTips } from "../shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Starting database seeding...");

  try {
    // Create demo users
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const hodlPassword = await bcrypt.hash("hodlmybeer21", 10);
    
    const [user] = await db.insert(users).values({
      username: "bitcoinfan",
      password: hashedPassword,
      streakDays: 5
    }).returning();

    const [hodlUser] = await db.insert(users).values({
      username: "HodlMyBeer21",
      password: hodlPassword,
      streakDays: 42
    }).returning();

    console.log("Created demo user:", user.username);
    console.log("Created HodlMyBeer21 user:", hodlUser.username);

    // No demo forum posts - keep memes section clean for user-generated content

    // Create some daily tips
    await db.insert(dailyTips).values([
      {
        title: "Dollar Cost Averaging (DCA)",
        content: "Instead of trying to time the market, consider investing a fixed amount in Bitcoin regularly. This strategy can help reduce the impact of volatility.",
        category: "Investment"
      },
      {
        title: "Secure Your Private Keys",
        content: "Never share your private keys or seed phrase with anyone. Write them down on paper and store them securely offline.",
        category: "Security"
      },
      {
        title: "Understand Bitcoin Fees",
        content: "Bitcoin transaction fees vary based on network congestion. Use fee estimation tools and consider the urgency of your transaction.",
        category: "Technology"
      },
      {
        title: "Lightning Network Benefits",
        content: "The Lightning Network enables instant, low-cost Bitcoin transactions. Perfect for small payments and microtransactions.",
        category: "Technology"
      },
      {
        title: "HODL Mentality",
        content: "HODL (Hold On for Dear Life) is a popular Bitcoin strategy. Consider your long-term goals and risk tolerance when investing.",
        category: "Investment"
      }
    ]);

    console.log("Created daily tips");
    console.log("Database seeding completed successfully!");

  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Run the seed function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed().then(() => process.exit(0));
}

export { seed };
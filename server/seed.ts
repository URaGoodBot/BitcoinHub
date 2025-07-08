import { db } from "./db";
import { users, forumPosts, dailyTips } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Starting database seeding...");

  try {
    // Create a demo user
    const hashedPassword = await bcrypt.hash("demo123", 10);
    const [user] = await db.insert(users).values({
      username: "bitcoinfan",
      password: hashedPassword,
      streakDays: 5
    }).returning();

    console.log("Created demo user:", user.username);

    // Create some demo forum posts
    await db.insert(forumPosts).values([
      {
        userId: user.id,
        title: "Bitcoin's Lightning Network: The Future of Payments?",
        content: "I've been experimenting with Lightning Network payments and the speed is incredible. What are your thoughts on its adoption potential?",
        categories: ["Technology", "Lightning"],
        upvotes: 15
      },
      {
        userId: user.id,
        title: "HODLing Strategy Discussion",
        content: "What's your long-term Bitcoin strategy? DCA? Lump sum? I'm curious about different approaches to building a position.",
        categories: ["Investment", "Strategy"],
        upvotes: 8
      },
      {
        userId: user.id,
        title: "Self-Custody vs Exchange Storage",
        content: "Just moved my Bitcoin to a hardware wallet. The peace of mind is worth the extra steps. Anyone else making the transition?",
        categories: ["Security", "Wallets"],
        upvotes: 22
      }
    ]);

    console.log("Created demo forum posts");

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
if (require.main === module) {
  seed().then(() => process.exit(0));
}

export { seed };
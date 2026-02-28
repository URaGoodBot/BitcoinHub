import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema";

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL || "postgres://invalid:invalid@127.0.0.1:5432/invalid";

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL is not set. Auth/forum/portfolio features will be unavailable until configured.");
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
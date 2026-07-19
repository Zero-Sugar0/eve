import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create a Neon connection only when needed
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!dbInstance) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    const client = neon(process.env.DATABASE_URL);
    dbInstance = drizzle(client, { schema });
  }
  return dbInstance;
}

// Default export for backward compatibility
export const db = new Proxy({} as any, {
  get: (target, prop: string | symbol) => {
    const dbInstance = getDb();
    return (dbInstance as any)[prop];
  },
}) as any;

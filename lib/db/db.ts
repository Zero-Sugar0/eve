import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Create a Neon connection
const client = neon(process.env.DATABASE_URL!);

// Initialize Drizzle with the client and schema
export const db = drizzle(client, { schema });

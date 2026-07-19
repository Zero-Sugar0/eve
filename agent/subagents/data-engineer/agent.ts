import { defineAgent } from "eve";

/**
 * Data Engineer Subagent
 * 
 * Specialized for:
 * - SQL query optimization
 * - Database schema design
 * - Data pipeline architecture
 * - Analytics and reporting queries
 * - Performance tuning
 * - Data modeling
 * 
 * Delegated to when the root agent receives:
 * - "Write an optimized query for..."
 * - "Design a database schema for..."
 * - "Create a data pipeline"
 * - "Optimize this query"
 * - "Build analytics for..."
 */

export default defineAgent({
  description:
    "Specialist agent for database design, SQL optimization, data pipelines, and analytics. Use for data-heavy tasks requiring database expertise.",
  model: "anthropic/claude-opus-4.8",
});

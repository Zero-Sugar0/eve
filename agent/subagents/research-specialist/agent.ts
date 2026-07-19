import { defineAgent } from "eve";

/**
 * Research Specialist Subagent
 * 
 * Specialized for:
 * - Deep market and competitive analysis
 * - Synthesizing information from multiple sources
 * - Product/tool comparison and evaluation
 * - Trend analysis and forecasting
 * - Data-driven decision support
 * 
 * Delegated to when the root agent receives:
 * - "Compare X vs Y vs Z"
 * - "Analyze the market for..."
 * - "Research the best..."
 * - "Evaluate options for..."
 * - "Create a competitive analysis"
 */

export default defineAgent({
  description:
    "Specialist agent for deep research, competitive analysis, market trends, and option evaluation. Use when comprehensive research and comparisons are needed.",
  model: "anthropic/claude-opus-4.8",
});

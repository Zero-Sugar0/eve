import { defineAgent } from "eve";

/**
 * Code Analyst Subagent
 * 
 * Specialized for:
 * - Code review and analysis
 * - Repository exploration and documentation generation
 * - Performance optimization suggestions
 * - Security vulnerability detection
 * - Refactoring recommendations
 * 
 * Delegated to when the root agent receives:
 * - "Review this code"
 * - "Analyze this repository"
 * - "Find performance issues"
 * - "Check for security problems"
 * - "Suggest refactoring"
 */

export default defineAgent({
  description:
    "Specialist agent for analyzing code, conducting security reviews, finding performance issues, and suggesting optimizations. Use when detailed code analysis is needed.",
  model: "anthropic/claude-opus-4.8",
});

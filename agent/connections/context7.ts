import { defineMcpClientConnection } from "eve/connections";

/**
 * Context7 MCP Connection
 * 
 * Provides real-time documentation lookup for 1000+ libraries
 * - Resolves library identifiers
 * - Queries version-specific documentation
 * - Returns accurate, up-to-date API reference
 * 
 * Tools available:
 * - resolve-library-id: Map library name to Context7 ID
 * - query-docs: Get documentation for specific topics
 * 
 * No authentication required - MCP server is public
 */

export default defineMcpClientConnection({
  url: "https://mcp.context7.com/mcp",
  description:
    "Real-time documentation lookup for 1000+ libraries and frameworks. Get version-specific API references, examples, and best practices without hallucinations.",
});

import { defineTool } from "eve/tools";
import { z } from "zod";

// Lazy-load Composio client only when tool is actually called
// This prevents build-time errors when API key is not available
let composio: any = null;

async function getComposioClient() {
  if (!composio) {
    const { Composio } = await import("@composio/core");
    composio = new Composio({
      apiKey: process.env.COMPOSIO_API_KEY!,
    });
  }
  return composio;
}

/**
 * This tool allows the agent to execute any of 1000+ Composio-integrated tools.
 * 
 * How it works:
 * 1. User provides a tool name (e.g., "gmail_send_email", "github_create_issue")
 * 2. Agent calls this tool with the tool name and input parameters
 * 3. The tool executes through Composio's pre-authenticated session
 * 
 * Common tools:
 * - Gmail: gmail_send_email, gmail_read_email, gmail_list_emails
 * - Slack: slack_send_message, slack_create_channel, slack_list_messages
 * - GitHub: github_create_issue, github_comment_pr, github_list_repos
 * - Notion: notion_create_page, notion_update_database, notion_query
 * - Linear: linear_create_issue, linear_update_issue
 * - Jira: jira_create_issue, jira_transition_issue
 * - Stripe: stripe_create_charge, stripe_list_customers
 * - HubSpot: hubspot_create_contact, hubspot_update_deal
 */

export default defineTool({
  description:
    "Execute any Composio-integrated SaaS tool (Gmail, Slack, GitHub, Notion, Linear, Jira, Stripe, etc.). Use this to interact with 1000+ tools without managing authentication.",
  inputSchema: z.object({
    action: z
      .string()
      .min(1)
      .describe(
        "The Composio action name (e.g., 'gmail_send_email', 'github_create_issue', 'slack_send_message')"
      ),
    input: z.any().describe("The input parameters for the action (varies by action)"),
    user_id: z.string().optional().describe(
      "The user ID for session-based authentication. If omitted, uses app principal."
    ),
  }),

  async execute({ action, input, user_id }) {
    try {
      // Check if API key is configured
      if (!process.env.COMPOSIO_API_KEY) {
        return {
          success: false,
          error: "Composio not configured",
          hint: "Add COMPOSIO_API_KEY to environment variables",
          setup_url: "https://composio.dev/signup",
        };
      }

      const client = await getComposioClient();

      // Create or retrieve user session
      // In production, this would verify the user and get their auth tokens
      const session = await client.getUser(
        user_id || "app_principal"
      );

      // Get the tool from the catalog
      const tool = await client.getAction(action);

      if (!tool) {
        return {
          success: false,
          error: `Action '${action}' not found in Composio catalog`,
          suggestions: [
            "Check the action name spelling",
            "Common actions: gmail_send_email, github_create_issue, slack_send_message",
            "Visit https://composio.dev/docs/actions for full catalog",
          ],
        };
      }

      // Execute the action
      const result = await session.actions.execute(action, input);

      return {
        success: true,
        action,
        result: result.data,
        message: `Successfully executed ${action}`,
      };
    } catch (error: any) {
      const errorMessage = error?.message || String(error);

      // Provide helpful error messages
      if (errorMessage.includes("authentication")) {
        return {
          success: false,
          error: "Authentication failed",
          hint: "User may need to reconnect their account to Composio",
          raw_error: errorMessage,
        };
      }

      if (errorMessage.includes("not found")) {
        return {
          success: false,
          error: `Action '${action}' not found`,
          hint: "Check action name in Composio documentation",
          raw_error: errorMessage,
        };
      }

      return {
        success: false,
        error: "Tool execution failed",
        action,
        raw_error: errorMessage,
      };
    }
  },
});

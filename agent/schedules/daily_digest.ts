import { defineSchedule } from "eve/schedules";

/**
 * Daily Digest Schedule
 * 
 * Runs every day at 9 AM UTC
 * Generates and sends a summary of:
 * - Important Linear issues and PRs
 * - GitHub activity
 * - Key metrics and alerts
 * - Task reminders
 * 
 * This is a fire-and-forget task mode schedule.
 * The agent processes the prompt and generates the digest,
 * but the output is not automatically delivered to any channel.
 */

export default defineSchedule({
  cron: "0 9 * * *", // 9 AM UTC daily
  markdown: `# Daily Digest Generation

Generate a comprehensive daily digest for team members covering:

## 1. Linear Issues
- List assigned issues (open and high-priority)
- Show overdue items
- Highlight blockers

## 2. GitHub Activity
- Recently opened PRs (last 24 hours)
- Approved PRs waiting to merge
- Critical issues in watched repositories

## 3. Key Metrics
- Project health status
- Sprint progress (if applicable)
- Team utilization

## 4. Alerts & Reminders
- Failed deployments
- Monitoring alerts
- Upcoming deadlines

## Format
Create a well-structured digest that can be:
- Sent via Slack
- Emailed to the team
- Posted in a team channel

Keep it concise (max 1 page when printed).
Include actionable items only, not just information.
Use clear formatting with sections and priorities.`,
});

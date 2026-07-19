import { defineSchedule } from "eve/schedules";

/**
 * Weekly Report Schedule
 * 
 * Runs every Friday at 5 PM UTC
 * Generates comprehensive weekly reports including:
 * - Team performance metrics
 * - Project milestones completed
 * - Blockers and risks
 * - Next week preview
 */

export default defineSchedule({
  cron: "0 17 * * 5", // 5 PM UTC on Fridays
  markdown: `# Weekly Report Generation

Create a comprehensive weekly report for stakeholders:

## 1. Executive Summary
- Key achievements this week
- Blockers or risks
- Next week preview

## 2. Project Status
For each active project:
- Completion percentage
- On-track status
- Key milestones hit
- Upcoming milestones

## 3. Team Metrics
- Issues completed
- PRs merged
- Code reviews completed
- Performance metrics

## 4. Blockers & Risks
- List active blockers
- Risk assessment
- Mitigation plans

## 5. Next Week
- Planned work
- Key deadlines
- Resource requirements

## Format
Create a professional report that can be:
- Shared with executives
- Posted to team channels
- Sent as email

Include visualizations if possible (metrics, charts).
Be honest about progress and challenges.
Provide actionable recommendations.`,
});

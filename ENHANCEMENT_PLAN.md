# Eve Agent Enhancement Plan

## Executive Summary

This document outlines a comprehensive enhancement strategy to transform the current Eve chat template into a **powerful, enterprise-grade multi-agent system** with advanced capabilities for tool automation, code analysis, research, team collaboration, and scheduled workflows.

**Current State:**
- Basic chat interface with weather tool
- 3 MCP connections (Notion, Linear, Sentry)
- 2 channels (Web, Slack)
- Simple trip planning skill
- Neon database for persistence
- Better Auth for user management

**Vision:**
Transform Eve into a **tool-orchestration platform** that enables users to:
- Access 1000+ SaaS integrations via Composio
- Perform contextual documentation lookups
- Delegate specialized tasks to expert subagents
- Schedule recurring automation tasks
- Collaborate in teams with role-based access
- Analyze code and research topics deeply

---

## Phase 1: Composio Integration (10x Tool Access)

### Why Composio?
Composio bridges Eve's agent framework with 1000+ pre-authenticated SaaS tools:
- Gmail, Slack, GitHub, Notion, Linear, Jira, HubSpot, Stripe, etc.
- No manual OAuth token management
- Session-based per-user authentication
- Native TypeScript/Python SDK or MCP interface

### Implementation Plan

**Step 1: Install Composio SDK**
```bash
npm install @composio/core @composio/client
```

**Step 2: Create Composio Connection Wrapper**
Create `agent/connections/composio.ts`:
```typescript
import { defineMcpClientConnection } from "eve/connections";
import { connect } from "@vercel/connect/eve";

export default defineMcpClientConnection({
  url: process.env.COMPOSIO_MCP_URL || "http://localhost:9123",
  description: "1000+ SaaS tool integrations via Composio",
  auth: connect("composio"), // Requires Vercel Connect setup
});
```

**Step 3: Create Composio Tools Adapter**
Create `agent/tools/composio_tools.ts`:
- Wrapper tool that dynamically exposes Composio tools
- User's session → Composio auth token → specific tool execution
- Supports Gmail, Slack, GitHub, Jira, Stripe, HubSpot, etc.

**Step 4: Add Environment Variables**
```env
COMPOSIO_API_KEY=your_api_key
COMPOSIO_MCP_URL=http://localhost:9123  # or remote
```

**Benefits:**
- Users can email reports, create GitHub issues, manage Jira tickets, etc.
- No hardcoding API keys
- Transparent tool discovery

---

## Phase 2: Context7 MCP for Documentation Lookup

### Why Context7?
- Real-time documentation lookup for 1000+ libraries
- Version-specific answers (no hallucinated APIs)
- Works with Eve's MCP infrastructure

### Implementation

**Step 1: Add Context7 MCP Connection**
Create `agent/connections/context7.ts`:
```typescript
import { defineMcpClientConnection } from "eve/connections";

export default defineMcpClientConnection({
  url: "https://mcp.context7.com/mcp",
  description: "Real-time library documentation lookup",
});
```

**Step 2: Create Documentation Research Skill**
Create `agent/skills/research_docs.md`:
```markdown
---
description: Use when answering questions about library APIs, frameworks, or technical documentation.
---

When a user asks about a library or framework:
1. Load the `research_docs` skill to access Context7
2. Query exact documentation using resolve-library-id and query-docs tools
3. Provide version-specific answers with working code examples
4. Cite the source (library name + version)
```

**Benefits:**
- Accurate, up-to-date technical information
- No outdated training data hallucinations
- Integrates seamlessly with existing chat

---

## Phase 3: Multi-Specialist Subagent Architecture

### Why Subagents?
Enable parallel, specialized work on different domains without context bloat.

### Proposed Specialists

**1. Code Analyst Subagent**
- Parse repositories and files
- Generate documentation
- Suggest refactoring opportunities
- Find bugs and security issues

**2. Research Specialist Subagent**
- Deep web research with sources
- Compare tools/services
- Analyze market data
- Create structured research reports

**3. Data Engineer Subagent**
- SQL query optimization
- Database schema design
- Data transformation pipelines
- Analytics queries

**4. DevOps/Infrastructure Subagent**
- Docker/Kubernetes advice
- CI/CD pipeline design
- Monitoring and alerts setup
- Deployment strategies

**5. Content Creator Subagent**
- Long-form content generation
- SEO optimization
- Social media scheduling
- Email campaign drafting

### Implementation Pattern

Create `agent/subagents/code-analyst/agent.ts`:
```typescript
import { defineAgent } from "eve";

export default defineAgent({
  description: "Analyze code repositories, generate documentation, identify improvements.",
  model: "anthropic/claude-opus-4.8",
});
```

With dedicated:
- `instructions.md` (role + constraints)
- `tools/` (GitHub, code parsing, documentation generation)
- `skills/` (code review patterns, security scanning)

---

## Phase 4: Advanced Skills Library

### Skill Categories

**Research & Analysis**
- `deep_research.md` - Multi-source research with synthesis
- `competitive_analysis.md` - Compare products/services
- `market_analysis.md` - Industry trends and data

**Code & Development**
- `code_review.md` - Structured code review process
- `bug_hunting.md` - Security and performance analysis
- `testing_strategy.md` - Test plan generation

**Business & Strategy**
- `product_strategy.md` - Product roadmap creation
- `go_to_market.md` - Launch planning
- `stakeholder_communication.md` - Report generation

**Data & Analytics**
- `data_analysis.md` - SQL, visualization, insights
- `reporting.md` - Automated report generation
- `forecasting.md` - Trend prediction

### Implementation

Each skill is a markdown file with:
1. Clear description (triggers auto-loading)
2. Step-by-step process
3. Specific tools to use
4. Output format

---

## Phase 5: Scheduled Tasks (Automation)

### Use Cases

1. **Daily Digest** (9 AM UTC)
   - Summarize Linear issues assigned to user
   - Review GitHub PRs
   - Fetch relevant Slack threads

2. **Weekly Reports** (Friday 5 PM)
   - Team performance metrics
   - Project health status
   - Key metrics dashboard

3. **Data Sync** (2 AM UTC)
   - Pull data from Stripe → Neon
   - Clean and denormalize data
   - Run analytics queries

4. **Notification Digests** (Every 6 hours)
   - Aggregate alerts from multiple sources
   - Summarize and send to Slack

### Implementation

Create `agent/schedules/daily_digest.ts`:
```typescript
import { defineSchedule } from "eve/schedules";
import slack from "../channels/slack";

export default defineSchedule({
  cron: "0 9 * * *", // 9 AM UTC
  async run({ receive, waitUntil, appAuth }) {
    waitUntil(
      receive(slack, {
        message: "Generate daily digest of Linear issues, GitHub activity, and Slack highlights",
        target: { channelId: process.env.SLACK_DIGEST_CHANNEL },
        auth: appAuth,
      }),
    );
  },
});
```

---

## Phase 6: Enhanced Database Persistence

### Current Schema
- Users, sessions, messages (from template)

### Enhancements

**New Tables:**
```sql
-- User team membership and roles
CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id TEXT,
  user_id TEXT,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')),
  PRIMARY KEY (team_id, user_id)
);

-- Agent execution history for audits
CREATE TABLE agent_runs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  agent_type TEXT,
  input TEXT,
  output TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Composio session tokens
CREATE TABLE composio_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  access_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Saved workflows/templates
CREATE TABLE workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  user_id TEXT NOT NULL,
  definition JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Benefits
- Audit trails for compliance
- Multi-user/team support
- Persistent workflow templates
- Analytics on agent usage

---

## Phase 7: Team Management & Collaboration

### Features

**1. Team Access Control**
- Create teams/workspaces
- Invite users with roles (admin, member, viewer)
- Share agent workflows within teams

**2. Shared Tools & Integrations**
- Team-level Composio tokens
- Shared Linear/Notion connections
- Centralized credential management

**3. Workflow Templates**
- Save successful workflows as templates
- Share templates within team
- Version control for workflows

**4. Agent Analytics Dashboard**
- Usage metrics per agent/tool
- Cost tracking (API calls)
- Performance metrics

---

## Implementation Timeline & Dependencies

### Week 1: Composio Integration
- Install SDK, create connection wrapper
- Build Composio tools adapter
- Test with 5-10 tools (Gmail, Slack, GitHub)
- Estimated effort: 2 days

### Week 2: Context7 + Advanced Skills
- Add Context7 MCP connection
- Create 3-5 core skills
- Test skill loading and triggering
- Estimated effort: 1.5 days

### Week 3: Subagent Architecture
- Create 3 specialist subagents
- Build delegation logic in root agent
- Test parallel execution
- Estimated effort: 2 days

### Week 4: Scheduling & Database
- Implement 3-4 schedules
- Run migrations for new tables
- Test schedule triggering
- Estimated effort: 1.5 days

### Week 5: Team Features & Polish
- Build team management UI
- Add shared credentials system
- Create analytics dashboard
- Estimated effort: 2 days

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Eve Root Agent                     │
│  (Orchestration, delegation, skill routing)          │
└──────────────────────┬──────────────────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────▼──┐   ┌──────▼──┐   ┌─────▼────┐
    │Channels│   │   MCP   │   │Subagents │
    ├────────┤   │ Conns   │   ├──────────┤
    │Web Chat│   ├─────────┤   │Code      │
    │Slack   │   │Composio │   │Analyst  │
    │API     │   │Context7 │   ├──────────┤
    │Cron    │   │Linear   │   │Research  │
    └────────┘   │Notion   │   │Specialist│
                 │Sentry   │   ├──────────┤
                 └─────────┘   │Data Eng  │
                               ├──────────┤
                               │DevOps    │
                               └──────────┘
                               
    ┌──────────────────────────────┐
    │    Vercel Sandbox (Compute)  │
    │    + Neon DB + Redis Cache   │
    └──────────────────────────────┘
```

---

## Success Metrics

1. **Tool Access**: 50+ Composio tools callable by users
2. **Subagent Utilization**: 40% of conversations delegate to specialists
3. **Documentation Accuracy**: 95% correct API references via Context7
4. **Automation**: 5+ scheduled workflows running reliably
5. **Team Adoption**: 5+ teams created with multi-user access
6. **Performance**: <2s response time for agent calls
7. **Reliability**: 99.9% uptime for scheduled tasks

---

## Security Considerations

1. **Token Management**
   - Never log API keys/tokens
   - Use Vercel Connect for OAuth
   - Expire Composio sessions after 24 hours

2. **Sandboxing**
   - Each agent runs in isolated Vercel Sandbox
   - File system access confined to session
   - Shell execution restricted to safe operations

3. **RBAC**
   - Teams have role-based access (admin/member/viewer)
   - Admins approve new tool connections
   - Audit logs for all agent executions

4. **Data Privacy**
   - Encrypt sensitive fields in database
   - GDPR compliance for user data
   - Right to deletion for team members

---

## Future Enhancements

1. **Multi-Model Support**
   - Support GPT-4, Gemini, Opus, Qwen, etc.
   - Per-agent model selection

2. **Fine-Tuning**
   - Train custom models on team workflows
   - Specialized experts per domain

3. **RAG Integration**
   - Index team documentation
   - Semantic search over archives

4. **Voice & Vision**
   - Audio input/output via Twilio
   - Image analysis for screenshots

5. **Marketplace**
   - Share subagents and skills publicly
   - Monetize specialized agents

---

## Next Steps

1. ✅ Complete Phase 1: Composio Integration
2. ✅ Complete Phase 2: Context7 MCP
3. ✅ Build 3 specialist subagents
4. ✅ Create advanced skill library
5. ✅ Implement scheduling
6. ✅ Deploy and monitor
7. ✅ Gather user feedback
8. ✅ Iterate on architecture


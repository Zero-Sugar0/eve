# Eve Agent Enhancement - Implementation Guide

## What We've Built

This document walks through what has been implemented in Phase 1-2 of the Eve agent enhancement plan.

### Completed

✅ **Phase 1: Composio Integration**
- Installed `@composio/core` and `@composio/client` SDKs
- Created `agent/tools/composio_execute.ts` tool for SaaS integrations
- Added environment variable documentation for Composio API key

✅ **Phase 2: Context7 MCP Connection**
- Created `agent/connections/context7.ts` for real-time documentation lookup
- Enables accurate, version-specific API references

✅ **Phase 3: Advanced Skills**
- `agent/skills/research_documentation.md` - Library documentation lookup
- `agent/skills/deep_research.md` - Comprehensive research and analysis
- `agent/skills/code_review.md` - Structured code review process

✅ **Phase 4: Specialist Subagents**
- **Code Analyst** (`agent/subagents/code-analyst/`)
  - Dedicated instructions for code review and security analysis
  - Skills for structured code review process
- **Research Specialist** (`agent/subagents/research-specialist/`)
  - Dedicated instructions for deep research and comparisons
  - Skills for competitive analysis
- **Data Engineer** (`agent/subagents/data-engineer/`)
  - Dedicated instructions for SQL and database design
  - Ready for specialized data tasks

✅ **Phase 5: Scheduling**
- `agent/schedules/daily_digest.ts` - Daily team digest (9 AM UTC)
- `agent/schedules/weekly_report.ts` - Weekly reports (Friday 5 PM UTC)

✅ **Phase 6: Updated Agent Instructions**
- Enhanced root agent instructions with complete capability reference
- Clear guidance on when to use tools, connections, skills, and subagents

---

## Architecture Overview

```
Eve Root Agent (Orchestrator)
├── Tools
│   ├── get_weather (existing)
│   └── composio_execute (1000+ SaaS tools)
├── Connections (MCP)
│   ├── composio
│   ├── context7
│   ├── linear
│   ├── notion
│   └── sentry
├── Skills
│   ├── plan_a_trip (existing)
│   ├── research_documentation (NEW)
│   ├── deep_research (NEW)
│   └── code_review (NEW)
├── Subagents
│   ├── code-analyst (NEW)
│   ├── research-specialist (NEW)
│   └── data-engineer (NEW)
└── Schedules
    ├── daily_digest (NEW)
    └── weekly_report (NEW)
```

---

## Configuration & Setup

### Environment Variables

Add to `.env.development.local`:

```env
# Composio Integration
COMPOSIO_API_KEY=your_api_key_here
# COMPOSIO_MCP_URL=http://localhost:9123  # Optional: for local MCP server

# (Existing variables remain unchanged)
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
# etc.
```

### Getting Composio API Key

1. Visit https://app.composio.dev
2. Create a free account
3. Generate API key from settings
4. Add to environment variables

---

## Usage Examples

### Example 1: Using Composio for Email

```
User: "Send an email to team@example.com with the project status"

Agent:
1. Recognizes email task
2. Calls composio_execute with action="gmail_send_email"
3. Handles user authentication through Composio session
4. Returns confirmation of sent email
```

### Example 2: Code Review Delegation

```
User: "Review this code: [code snippet]"

Agent:
1. Recognizes code review request
2. Delegates to code-analyst subagent
3. Code analyst uses code_review skill
4. Returns structured analysis with issues and recommendations
```

### Example 3: Research Task

```
User: "Compare Supabase vs Neon vs Firebase"

Agent:
1. Recognizes comparison request
2. Delegates to research-specialist subagent
3. Specialist uses competitive_analysis skill
4. Returns detailed comparison matrix and recommendation
```

### Example 4: Documentation Lookup

```
User: "How do I use useEffect in React 19?"

Agent:
1. Loads research_documentation skill
2. Uses Context7 MCP to query React docs
3. Returns accurate, version-specific information
4. Includes working code example
```

### Example 5: Database Query Optimization

```
User: "Optimize this slow query: SELECT * FROM orders..."

Agent:
1. Recognizes database task
2. Delegates to data-engineer subagent
3. Engineer analyzes query plan and suggests indexes
4. Returns optimized query with performance metrics
```

---

## Integration Checklist

- [ ] Add `COMPOSIO_API_KEY` to environment
- [ ] Test `composio_execute` tool with sample action (e.g., "github_list_repos")
- [ ] Verify Context7 MCP connection works
- [ ] Test skill loading by asking about documentation
- [ ] Trigger code-analyst subagent with code review request
- [ ] Trigger research-specialist with comparison question
- [ ] Verify schedules are discovered (should appear in build output)
- [ ] Test local schedule dispatch via dev endpoint

---

## Next Steps (Remaining Phases)

### Phase 3: Database Schema Enhancement
Create migrations for:
- `teams` table (multi-tenant support)
- `team_members` table (RBAC)
- `agent_runs` table (audit trail)
- `composio_sessions` table (token management)
- `workflows` table (saved automation)

### Phase 4: Team Management UI
- Team creation and management
- User invitation and role assignment
- Shared credential management
- Analytics dashboard

### Phase 5: Production Deployment
- Security hardening
- Rate limiting
- Monitoring and alerts
- Cost tracking for Composio

---

## Troubleshooting

### Composio Tool Not Found

**Problem**: `Action 'action_name' not found in Composio catalog`

**Solution**:
1. Check action name spelling
2. Visit https://composio.dev/docs/actions for full list
3. Ensure Composio API key is valid
4. Verify action is enabled in your Composio account

### Context7 MCP Not Responding

**Problem**: Documentation lookup fails

**Solution**:
1. Verify network connectivity
2. Check MCP URL is correct (https://mcp.context7.com/mcp)
3. Try simple query: "React documentation"
4. Check eve logs for connection errors

### Subagent Not Delegating

**Problem**: Agent doesn't delegate to subagent

**Solution**:
1. Verify subagent directories exist
2. Check `agent.ts` has `description` field
3. Verify instructions.md exists
4. Rebuild with `pnpm build:eve`
5. Check agent.ts syntax

### Schedule Not Appearing

**Problem**: Schedules not discovered

**Solution**:
1. Verify files are in `agent/schedules/`
2. Check cron expression is valid
3. Rebuild: `pnpm build:eve`
4. Check build output for schedule discovery
5. For dev testing, use `/eve/v1/dev/schedules/{name}` endpoint

---

## Performance Considerations

### Composio Rate Limits
- Free tier: 100 calls/day
- Pro tier: 10,000 calls/day
- Enterprise: Custom limits

### Context7 MCP
- No rate limits on public MCP server
- Responses typically <1 second

### Subagent Delegation
- Each subagent spins up fresh model call
- Costs same as regular agent call
- Best for specialized, non-trivial work

### Schedule Execution
- Runs on Vercel Cron infrastructure
- Task mode (no waiting for human input)
- Maximum runtime: 15 minutes

---

## Security Best Practices

### API Keys
1. Never commit `.env` files
2. Use Vercel environment variables for production
3. Rotate Composio keys periodically
4. Monitor API usage for anomalies

### Composio Tokens
1. Tokens are session-based (24-hour expiry)
2. Implement token refresh before expiry
3. Audit who has access to which tools
4. Remove access when users leave

### Sandboxing
- Eve runs all agent code in isolated Vercel Sandbox
- File system access confined to session
- No direct shell access

### RBAC Planning
- Teams own Composio tokens
- Members can use team's connected tools
- Admins manage integrations
- Audit logs track who used what

---

## Monitoring & Observability

### Key Metrics to Track

1. **Tool Usage**
   - Composio actions called per day
   - Most used integrations
   - Success/failure rates

2. **Subagent Performance**
   - Delegation frequency
   - Average execution time
   - Quality of recommendations

3. **Schedule Health**
   - Daily digest sent/failed
   - Weekly report completion
   - Error tracking

4. **Cost Tracking**
   - Composio API calls/month
   - Model call costs
   - Infrastructure costs

### Logging

All execution is logged by eve framework:
- Tool calls and results
- Subagent delegations
- Schedule runs
- Errors and failures

Access logs at:
- Vercel Dashboard → Observability → Logs
- Local dev: Check terminal output

---

## Documentation References

- [Eve Framework](https://beta.eve.dev)
- [Composio Documentation](https://composio.dev/docs)
- [Context7 MCP](https://context7.com)
- [Vercel Sandbox](https://vercel.com/docs/sandbox)
- [Vercel Workflows](https://vercel.com/docs/workflows)

---

## Support & Resources

- **Eve Discord**: Community for questions and ideas
- **Composio Community**: Help with tool integrations
- **GitHub Issues**: Report bugs and feature requests
- **Vercel Support**: For deployment and infrastructure issues

---

## Success Metrics

After implementation:

1. **Tool Access**: 50+ Composio tools callable
2. **Subagent Utilization**: 30%+ of requests delegate
3. **Documentation Accuracy**: 95%+ correct via Context7
4. **Automation**: 5+ daily digests/weekly reports
5. **Performance**: <500ms avg response time
6. **Reliability**: 99% uptime for schedules

---

## Version History

- **v1.0** (Current): Phase 1-2 complete, Phase 3-5 planned
  - Composio integration
  - Context7 MCP
  - 3 Specialist subagents
  - 2 Advanced skills
  - Scheduling framework

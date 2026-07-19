import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as repo from "@/lib/db/repositories";

/**
 * GET /api/agent-runs - Get user's agent execution audit trail
 * Query params:
 *   - limit: number (default 50)
 *   - offset: number (default 0)
 *   - team_id: string (optional, filter by team)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const teamId = searchParams.get("team_id");

    let runs;
    if (teamId) {
      // Verify user is team member
      const userRole = await repo.getUserRole(teamId, session.user.id);
      if (!userRole) {
        return NextResponse.json(
          { error: "Not a team member" },
          { status: 403 },
        );
      }
      runs = await repo.getTeamAgentRuns(teamId, limit, offset);
    } else {
      runs = await repo.getAgentRuns(session.user.id, limit, offset);
    }

    return NextResponse.json({
      runs,
      total: runs.length,
      offset,
      limit,
    });
  } catch (error) {
    console.error("GET /api/agent-runs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent runs" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/agent-runs - Log new agent run
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      teamId,
      agentType,
      action,
      input,
      output,
      status,
      error,
      duration,
      cost,
      metadata,
    } = await request.json();

    if (!status || !["pending", "success", "failed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const run = await repo.logAgentRun(session.user.id, {
      userId: session.user.id,
      teamId: teamId || null,
      agentType: agentType || null,
      action: action || null,
      input: input || null,
      output: output || null,
      status: status as "pending" | "success" | "failed",
      error: error || null,
      duration: duration || null,
      cost: cost || null,
      metadata: metadata || null,
    } as Parameters<typeof repo.logAgentRun>[1]);

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error("POST /api/agent-runs error:", error);
    return NextResponse.json(
      { error: "Failed to log agent run" },
      { status: 500 },
    );
  }
}

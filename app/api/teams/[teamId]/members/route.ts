import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as repo from "@/lib/db/repositories";

/**
 * GET /api/teams/[teamId]/members - List team members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is team member
    const userRole = await repo.getUserRole(teamId, session.user.id);
    if (!userRole) {
      return NextResponse.json(
        { error: "Not a team member" },
        { status: 403 },
      );
    }

    const members = await repo.getTeamMembers(teamId);
    return NextResponse.json(members);
  } catch (error) {
    console.error("GET /api/teams/[teamId]/members error:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/teams/[teamId]/members - Add team member
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> },
) {
  try {
    const { teamId } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const userRole = await repo.getUserRole(teamId, session.user.id);
    if (userRole !== "admin") {
      return NextResponse.json(
        { error: "Only admins can add members" },
        { status: 403 },
      );
    }

    const { email, role = "member" } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // TODO: In production, lookup user by email and add them
    // For now, return placeholder response
    const newMember = {
      id: `member_${Date.now()}`,
      teamId: teamId,
      userId: `user_${Date.now()}`,
      role,
      joinedAt: new Date(),
    };

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams/[teamId]/members error:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 },
    );
  }
}

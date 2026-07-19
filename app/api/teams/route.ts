import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as repo from "@/lib/db/repositories";
import { nanoid } from "nanoid";

/**
 * GET /api/teams - List user's teams
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teams = await repo.getTeamsByUser(session.user.id);
    return NextResponse.json(teams);
  } catch (error) {
    console.error("GET /api/teams error:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/teams - Create new team
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, image } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Team name required" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);

    const newTeam = await repo.createTeam(
      session.user.id,
      name,
      slug,
      description,
      image,
    );

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("POST /api/teams error:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 },
    );
  }
}

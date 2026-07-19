/**
 * Database repository functions for multi-tenant agent system
 * 
 * Provides CRUD and query operations for:
 * - Teams and team members (RBAC)
 * - Agent execution audit trail
 * - Composio session management
 * - Workflow/automation templates
 */

import { db } from "./db";
import {
  team,
  teamMember,
  agentRun,
  composioSession,
  workflow,
  user,
} from "./schema";
import { eq, and, or } from "drizzle-orm";
import type {
  Team,
  TeamMember,
  AgentRun,
  ComposioSession,
  Workflow,
} from "./schema";

// ============================================================================
// TEAM MANAGEMENT
// ============================================================================

export async function createTeam(
  userId: string,
  name: string,
  slug: string,
  description?: string,
  image?: string,
): Promise<Team> {
  const [newTeam] = await db
    .insert(team)
    .values({
      name,
      slug,
      description,
      image,
      createdBy: userId,
    })
    .returning();

  // Add creator as admin
  await db.insert(teamMember).values({
    teamId: newTeam.id,
    userId,
    role: "admin",
  });

  return newTeam;
}

export async function getTeamsByUser(userId: string): Promise<Team[]> {
  return db
    .select({ team: team })
    .from(team)
    .innerJoin(teamMember, eq(team.id, teamMember.teamId))
    .where(eq(teamMember.userId, userId))
    .then((rows) => rows.map((r) => r.team));
}

export async function getTeamById(teamId: string): Promise<Team | null> {
  const [result] = await db
    .select()
    .from(team)
    .where(eq(team.id, teamId));
  return result || null;
}

export async function updateTeam(
  teamId: string,
  updates: Partial<Omit<Team, "id" | "createdBy" | "createdAt">>,
): Promise<Team> {
  const [updated] = await db
    .update(team)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(team.id, teamId))
    .returning();
  return updated;
}

// ============================================================================
// TEAM MEMBERS & RBAC
// ============================================================================

export async function addTeamMember(
  teamId: string,
  userId: string,
  role: "admin" | "member" | "viewer" = "member",
): Promise<TeamMember> {
  const [newMember] = await db
    .insert(teamMember)
    .values({
      teamId,
      userId,
      role,
    })
    .returning();
  return newMember;
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
  return db.select().from(teamMember).where(eq(teamMember.teamId, teamId));
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: "admin" | "member" | "viewer",
): Promise<TeamMember> {
  const [updated] = await db
    .update(teamMember)
    .set({ role })
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)))
    .returning();
  return updated;
}

export async function removeTeamMember(
  teamId: string,
  userId: string,
): Promise<void> {
  await db
    .delete(teamMember)
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)));
}

export async function getUserRole(
  teamId: string,
  userId: string,
): Promise<"admin" | "member" | "viewer" | null> {
  const [member] = await db
    .select({ role: teamMember.role })
    .from(teamMember)
    .where(and(eq(teamMember.teamId, teamId), eq(teamMember.userId, userId)));
  return member?.role || null;
}

// ============================================================================
// AGENT RUN AUDIT TRAIL
// ============================================================================

export async function logAgentRun(
  userId: string,
  data: Omit<AgentRun, "id" | "createdAt">,
): Promise<AgentRun> {
  const [run] = await db
    .insert(agentRun)
    .values({
      userId,
      ...data,
    })
    .returning();
  return run;
}

export async function getAgentRuns(
  userId: string,
  limit: number = 50,
  offset: number = 0,
): Promise<AgentRun[]> {
  return db
    .select()
    .from(agentRun)
    .where(eq(agentRun.userId, userId))
    .orderBy((row) => row.createdAt)
    .limit(limit)
    .offset(offset);
}

export async function getTeamAgentRuns(
  teamId: string,
  limit: number = 100,
  offset: number = 0,
): Promise<AgentRun[]> {
  return db
    .select()
    .from(agentRun)
    .where(eq(agentRun.teamId, teamId))
    .orderBy((row) => row.createdAt)
    .limit(limit)
    .offset(offset);
}

export async function getAgentRunStats(userId: string) {
  const runs = await db
    .select()
    .from(agentRun)
    .where(eq(agentRun.userId, userId));

  const totalCost = runs.reduce((sum, run) => {
    const cost = parseFloat(run.cost || "0");
    return sum + cost;
  }, 0);

  return {
    total: runs.length,
    successful: runs.filter((r) => r.status === "success").length,
    failed: runs.filter((r) => r.status === "failed").length,
    avgDuration:
      runs.reduce((sum, r) => sum + (r.duration || 0), 0) / runs.length || 0,
    totalCost,
  };
}

// ============================================================================
// COMPOSIO SESSION MANAGEMENT
// ============================================================================

export async function createComposioSession(
  userId: string,
  provider: string,
  accessToken: string,
  expiresAt: Date,
  refreshToken?: string,
  scope?: string,
  teamId?: string,
): Promise<ComposioSession> {
  const [session] = await db
    .insert(composioSession)
    .values({
      userId,
      teamId,
      accessToken,
      refreshToken,
      expiresAt,
      provider,
      scope,
    })
    .returning();
  return session;
}

export async function getComposioSession(
  userId: string,
  provider: string,
): Promise<ComposioSession | null> {
  const [session] = await db
    .select()
    .from(composioSession)
    .where(
      and(
        eq(composioSession.userId, userId),
        eq(composioSession.provider, provider),
      ),
    );
  return session || null;
}

export async function updateComposioSession(
  sessionId: string,
  updates: Partial<Omit<ComposioSession, "id" | "createdAt">>,
): Promise<ComposioSession> {
  const [updated] = await db
    .update(composioSession)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(composioSession.id, sessionId))
    .returning();
  return updated;
}

export async function deleteComposioSession(sessionId: string): Promise<void> {
  await db.delete(composioSession).where(eq(composioSession.id, sessionId));
}

export async function getExpiredComposioSessions(): Promise<ComposioSession[]> {
  return db
    .select()
    .from(composioSession)
    .where(or(eq(composioSession.expiresAt, new Date())));
}

// ============================================================================
// WORKFLOW MANAGEMENT
// ============================================================================

export async function createWorkflow(
  teamId: string,
  userId: string,
  name: string,
  definition: Record<string, any>,
  description?: string,
  tags?: string[],
): Promise<Workflow> {
  const [wf] = await db
    .insert(workflow)
    .values({
      teamId,
      createdBy: userId,
      name,
      definition,
      description,
      tags,
    })
    .returning();
  return wf;
}

export async function getTeamWorkflows(teamId: string): Promise<Workflow[]> {
  return db
    .select()
    .from(workflow)
    .where(eq(workflow.teamId, teamId))
    .orderBy((w) => w.updatedAt);
}

export async function getWorkflowById(workflowId: string): Promise<Workflow | null> {
  const [wf] = await db
    .select()
    .from(workflow)
    .where(eq(workflow.id, workflowId));
  return wf || null;
}

export async function updateWorkflow(
  workflowId: string,
  updates: Partial<Omit<Workflow, "id" | "teamId" | "createdBy" | "createdAt">>,
): Promise<Workflow> {
  const [updated] = await db
    .update(workflow)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(workflow.id, workflowId))
    .returning();
  return updated;
}

export async function publishWorkflow(workflowId: string): Promise<Workflow> {
  return updateWorkflow(workflowId, { isPublished: true });
}

export async function getPublishedWorkflows(): Promise<Workflow[]> {
  return db
    .select()
    .from(workflow)
    .where(eq(workflow.isPublished, true))
    .orderBy((w) => w.runs);
}

export async function incrementWorkflowRuns(workflowId: string): Promise<void> {
  await db
    .update(workflow)
    .set({
      runs: workflow.runs,
      lastRunAt: new Date(),
    })
    .where(eq(workflow.id, workflowId));
}

export async function deleteWorkflow(workflowId: string): Promise<void> {
  await db.delete(workflow).where(eq(workflow.id, workflowId));
}

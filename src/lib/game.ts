import { prisma } from "./prisma";
import type { GameState, TeamInfo, ObstacleEventInfo } from "@/types";

export async function getActiveEvent() {
  return prisma.event.findFirst({
    where: { phase: { not: "finished" } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrCreateEvent() {
  const existing = await prisma.event.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;
  return prisma.event.create({
    data: { phase: "registration", timerDurationSeconds: 14400 },
  });
}

export async function getGameState(eventId: string): Promise<GameState> {
  const event = await prisma.event.findUniqueOrThrow({ where: { id: eventId } });

  const teams = await prisma.team.findMany({
    where: { eventId },
    include: {
      members: { include: { user: true } },
      assignment: { include: { project: true, techStack: true } },
      obstacleTargets: {
        where: { status: "active" },
        include: { obstacle: true, targetTeams: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const activeObstacles = await prisma.obstacleEvent.findMany({
    where: { eventId, status: "active" },
    include: { obstacle: true, targetTeams: true },
    orderBy: { triggeredAt: "desc" },
  });

  const participants = await prisma.user.findMany({
    where: { isOptedOut: false },
    select: {
      id: true, name: true, email: true, avatarUrl: true,
      vibeLevel: true, isAdmin: true, isOptedOut: true,
    },
    orderBy: { registeredAt: "asc" },
  });

  const recentLog = await prisma.eventLog.findMany({
    where: { eventId },
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const teamsInfo: TeamInfo[] = teams.map((t) => ({
    id: t.id,
    name: t.name,
    totalVibeLevel: t.totalVibeLevel,
    isSolo: t.isSolo,
    members: t.members.map((m) => ({
      userId: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      vibeLevel: m.user.vibeLevel,
    })),
    assignment: t.assignment
      ? {
          project: {
            id: t.assignment.project.id,
            name: t.assignment.project.name,
            tagline: t.assignment.project.tagline,
            spec: t.assignment.project.spec,
            difficulty: t.assignment.project.difficulty as "easy" | "medium" | "hard" | null,
          },
          techStack: {
            id: t.assignment.techStack.id,
            frontend: t.assignment.techStack.frontend,
            backend: t.assignment.techStack.backend,
            label: t.assignment.techStack.label,
          },
          swapHistory: t.assignment.swapHistory as never[],
        }
      : null,
    activeObstacles: t.obstacleTargets.map((oe) => ({
      id: oe.id,
      obstacle: {
        id: oe.obstacle.id,
        name: oe.obstacle.name,
        icon: oe.obstacle.icon,
        description: oe.obstacle.description,
        severity: oe.obstacle.severity as "low" | "medium" | "high" | "critical",
        durationMinutes: oe.obstacle.durationMinutes,
        isCustom: oe.obstacle.isCustom,
      },
      targetTeamIds: oe.targetTeams.map((tt) => tt.id),
      triggeredAt: oe.triggeredAt.toISOString(),
      expiresAt: oe.expiresAt?.toISOString() ?? null,
      status: oe.status as "active" | "resolved" | "dismissed",
      customNote: oe.customNote,
    })),
  }));

  const activeObstaclesInfo: ObstacleEventInfo[] = activeObstacles.map((oe) => ({
    id: oe.id,
    obstacle: {
      id: oe.obstacle.id,
      name: oe.obstacle.name,
      icon: oe.obstacle.icon,
      description: oe.obstacle.description,
      severity: oe.obstacle.severity as "low" | "medium" | "high" | "critical",
      durationMinutes: oe.obstacle.durationMinutes,
      isCustom: oe.obstacle.isCustom,
    },
    targetTeamIds: oe.targetTeams.map((tt) => tt.id),
    triggeredAt: oe.triggeredAt.toISOString(),
    expiresAt: oe.expiresAt?.toISOString() ?? null,
    status: oe.status as "active" | "resolved" | "dismissed",
    customNote: oe.customNote,
  }));

  return {
    event: {
      id: event.id,
      phase: event.phase as "registration" | "active" | "paused" | "finished",
      timerDurationSeconds: event.timerDurationSeconds,
      timerStartedAt: event.timerStartedAt?.toISOString() ?? null,
      timerPausedRemaining: event.timerPausedRemaining ?? null,
      startedAt: event.startedAt?.toISOString() ?? null,
      finishedAt: event.finishedAt?.toISOString() ?? null,
    },
    teams: teamsInfo,
    participantCount: participants.length,
    participants: participants.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatarUrl: p.avatarUrl,
      vibeLevel: p.vibeLevel,
      isAdmin: p.isAdmin,
      isOptedOut: p.isOptedOut,
    })),
    activeObstacles: activeObstaclesInfo,
    recentLog: recentLog.map((l) => ({
      id: l.id,
      message: l.message,
      type: l.type as "system" | "obstacle" | "swap" | "admin_action",
      timestamp: l.timestamp.toISOString(),
      metadata: l.metadata as Record<string, unknown> | null,
    })),
  };
}

export function calculateRemainingSeconds(event: {
  phase: string;
  timerDurationSeconds: number;
  timerStartedAt: Date | null;
  timerPausedRemaining: number | null;
}): number {
  if (event.phase === "paused" && event.timerPausedRemaining !== null) {
    return event.timerPausedRemaining;
  }
  if (event.phase === "active" && event.timerStartedAt) {
    const elapsed = Math.floor((Date.now() - event.timerStartedAt.getTime()) / 1000);
    return Math.max(0, event.timerDurationSeconds - elapsed);
  }
  return event.timerDurationSeconds;
}

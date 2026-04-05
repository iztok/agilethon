import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { teamAId, teamBId, type } = await req.json() as {
    teamAId: string; teamBId: string; type: "project" | "stack";
  };

  const event = await getOrCreateEvent();

  const [assignA, assignB] = await Promise.all([
    prisma.teamAssignment.findUniqueOrThrow({ where: { teamId: teamAId } }),
    prisma.teamAssignment.findUniqueOrThrow({ where: { teamId: teamBId } }),
  ]);

  const now = new Date().toISOString();

  if (type === "project") {
    const historyA: Prisma.InputJsonValue = [
      ...(assignA.swapHistory as Prisma.JsonArray),
      { type: "project_swap", previousId: assignA.projectId, newId: assignB.projectId, swappedWithTeamId: teamBId, timestamp: now },
    ];
    const historyB: Prisma.InputJsonValue = [
      ...(assignB.swapHistory as Prisma.JsonArray),
      { type: "project_swap", previousId: assignB.projectId, newId: assignA.projectId, swappedWithTeamId: teamAId, timestamp: now },
    ];
    await Promise.all([
      prisma.teamAssignment.update({ where: { teamId: teamAId }, data: { projectId: assignB.projectId, swapHistory: historyA } }),
      prisma.teamAssignment.update({ where: { teamId: teamBId }, data: { projectId: assignA.projectId, swapHistory: historyB } }),
    ]);
    const [projA, projB] = await Promise.all([
      prisma.project.findUniqueOrThrow({ where: { id: assignB.projectId } }),
      prisma.project.findUniqueOrThrow({ where: { id: assignA.projectId } }),
    ]);
    await prisma.eventLog.create({ data: { eventId: event.id, message: `🔀 Project swap: one team gets "${projA.name}", other gets "${projB.name}"`, type: "swap" } });
  } else {
    const historyA: Prisma.InputJsonValue = [
      ...(assignA.swapHistory as Prisma.JsonArray),
      { type: "stack_swap", previousId: assignA.techStackId, newId: assignB.techStackId, swappedWithTeamId: teamBId, timestamp: now },
    ];
    const historyB: Prisma.InputJsonValue = [
      ...(assignB.swapHistory as Prisma.JsonArray),
      { type: "stack_swap", previousId: assignB.techStackId, newId: assignA.techStackId, swappedWithTeamId: teamAId, timestamp: now },
    ];
    await Promise.all([
      prisma.teamAssignment.update({ where: { teamId: teamAId }, data: { techStackId: assignB.techStackId, swapHistory: historyA } }),
      prisma.teamAssignment.update({ where: { teamId: teamBId }, data: { techStackId: assignA.techStackId, swapHistory: historyB } }),
    ]);
    await prisma.eventLog.create({ data: { eventId: event.id, message: `💥 Stack swap between two teams!`, type: "swap" } });
  }

  const [teamA, teamB] = await Promise.all([
    prisma.team.findUniqueOrThrow({ where: { id: teamAId }, include: { assignment: { include: { project: true, techStack: true } } } }),
    prisma.team.findUniqueOrThrow({ where: { id: teamBId }, include: { assignment: { include: { project: true, techStack: true } } } }),
  ]);

  emitToEvent(event.id, "assignment:swapped", {
    teamAId, teamBId, type,
    teamA: { assignment: teamA.assignment },
    teamB: { assignment: teamB.assignment },
  });

  return NextResponse.json({ ok: true });
}

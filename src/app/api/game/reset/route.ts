import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function POST() {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const event = await getOrCreateEvent();

  const teams = await prisma.team.findMany({ where: { eventId: event.id } });
  for (const team of teams) {
    await prisma.teamAssignment.deleteMany({ where: { teamId: team.id } });
    await prisma.teamMember.deleteMany({ where: { teamId: team.id } });
  }
  await prisma.team.deleteMany({ where: { eventId: event.id } });
  await prisma.obstacleEvent.deleteMany({ where: { eventId: event.id } });
  await prisma.eventLog.deleteMany({ where: { eventId: event.id } });

  await prisma.event.update({
    where: { id: event.id },
    data: { phase: "registration", startedAt: null, finishedAt: null, timerStartedAt: null, timerPausedRemaining: null, timerDurationSeconds: 14400 },
  });

  emitToEvent(event.id, "state:full", { event: { phase: "registration" } });
  return NextResponse.json({ ok: true });
}

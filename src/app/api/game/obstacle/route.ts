import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { obstacleId, targetTeamIds, customNote } = await req.json() as {
    obstacleId: string;
    targetTeamIds: string[];
    customNote?: string;
  };

  const event = await getOrCreateEvent();
  const obstacle = await prisma.obstacle.findUniqueOrThrow({ where: { id: obstacleId } });

  const expiresAt = obstacle.durationMinutes > 0
    ? new Date(Date.now() + obstacle.durationMinutes * 60 * 1000)
    : null;

  const obstacleEvent = await prisma.obstacleEvent.create({
    data: {
      eventId: event.id,
      obstacleId,
      triggeredById: user.id,
      expiresAt,
      customNote: customNote || null,
      targetTeams: targetTeamIds.length > 0
        ? { connect: targetTeamIds.map((id) => ({ id })) }
        : undefined,
    },
    include: { obstacle: true, targetTeams: true },
  });

  const logMessage = `🚨 ${obstacle.icon} ${obstacle.name} deployed!${
    targetTeamIds.length > 0 ? ` Targets: ${targetTeamIds.length} team(s).` : " All teams affected."
  }`;

  const log = await prisma.eventLog.create({
    data: { eventId: event.id, message: logMessage, type: "obstacle" },
  });

  const payload = {
    id: obstacleEvent.id,
    obstacle: {
      id: obstacle.id, name: obstacle.name, icon: obstacle.icon,
      description: obstacle.description, severity: obstacle.severity,
      durationMinutes: obstacle.durationMinutes, isCustom: obstacle.isCustom,
    },
    targetTeamIds,
    triggeredAt: obstacleEvent.triggeredAt.toISOString(),
    expiresAt: obstacleEvent.expiresAt?.toISOString() ?? null,
    status: obstacleEvent.status,
    customNote: obstacleEvent.customNote,
    log: { id: log.id, message: log.message, type: log.type, timestamp: log.timestamp.toISOString() },
  };

  emitToEvent(event.id, "obstacle:triggered", payload);

  if (expiresAt) {
    setTimeout(async () => {
      try {
        await prisma.obstacleEvent.update({ where: { id: obstacleEvent.id }, data: { status: "resolved" } });
        await prisma.eventLog.create({ data: { eventId: event.id, message: `${obstacle.icon} ${obstacle.name} — expired.`, type: "obstacle" } });
        emitToEvent(event.id, "obstacle:resolved", { obstacleEventId: obstacleEvent.id });
      } catch {}
    }, obstacle.durationMinutes * 60 * 1000);
  }

  return NextResponse.json({ ok: true });
}

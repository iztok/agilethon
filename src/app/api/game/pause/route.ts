import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent, calculateRemainingSeconds } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function POST() {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const event = await getOrCreateEvent();
  if (event.phase !== "active") return NextResponse.json({ error: "Event is not active" }, { status: 400 });

  const remaining = calculateRemainingSeconds(event);

  await prisma.event.update({ where: { id: event.id }, data: { phase: "paused", timerPausedRemaining: remaining } });
  await prisma.eventLog.create({ data: { eventId: event.id, message: `Event paused. ${Math.floor(remaining / 60)}m remaining.`, type: "admin_action" } });

  emitToEvent(event.id, "game:paused", { remainingSeconds: remaining });
  return NextResponse.json({ ok: true, remainingSeconds: remaining });
}

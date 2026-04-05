import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function POST() {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const event = await getOrCreateEvent();
  if (event.phase !== "paused") return NextResponse.json({ error: "Event is not paused" }, { status: 400 });

  const now = new Date();
  const remaining = event.timerPausedRemaining ?? event.timerDurationSeconds;

  await prisma.event.update({
    where: { id: event.id },
    data: { phase: "active", timerStartedAt: now, timerDurationSeconds: remaining, timerPausedRemaining: null },
  });
  await prisma.eventLog.create({ data: { eventId: event.id, message: "Event resumed.", type: "admin_action" } });

  emitToEvent(event.id, "game:resumed", { timerStartedAt: now.toISOString(), timerDurationSeconds: remaining });
  return NextResponse.json({ ok: true });
}

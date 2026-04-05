import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent, calculateRemainingSeconds } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { addSeconds } = await req.json() as { addSeconds: number };
  const event = await getOrCreateEvent();

  if (event.phase === "active" && event.timerStartedAt) {
    const remaining = calculateRemainingSeconds(event);
    const newRemaining = Math.max(0, remaining + addSeconds);

    await prisma.event.update({
      where: { id: event.id },
      data: { timerDurationSeconds: event.timerDurationSeconds + addSeconds },
    });

    const action = addSeconds > 0 ? `added ${addSeconds / 60}m` : `removed ${Math.abs(addSeconds) / 60}m`;
    await prisma.eventLog.create({ data: { eventId: event.id, message: `Timer adjusted: ${action}.`, type: "admin_action" } });

    emitToEvent(event.id, "timer:sync", { remainingSeconds: newRemaining });
    return NextResponse.json({ ok: true, newRemaining });
  } else if (event.phase === "paused") {
    const newRemaining = Math.max(0, (event.timerPausedRemaining ?? 0) + addSeconds);
    await prisma.event.update({
      where: { id: event.id },
      data: { timerPausedRemaining: newRemaining, timerDurationSeconds: newRemaining },
    });
    emitToEvent(event.id, "timer:sync", { remainingSeconds: newRemaining });
    return NextResponse.json({ ok: true, newRemaining });
  }

  return NextResponse.json({ error: "Event is not active or paused" }, { status: 400 });
}

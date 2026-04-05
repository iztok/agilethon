import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { formTeams } from "@/lib/team-formation";
import { getGameState, getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function POST() {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const event = await getOrCreateEvent();
    if (event.phase !== "registration") {
      return NextResponse.json({ error: "Event is not in registration phase" }, { status: 400 });
    }

    await formTeams(event.id);

    const now = new Date();
    await prisma.event.update({
      where: { id: event.id },
      data: { phase: "active", startedAt: now, timerStartedAt: now },
    });

    await prisma.eventLog.create({
      data: { eventId: event.id, message: "Hackathon started! Teams formed and projects assigned.", type: "system" },
    });

    const state = await getGameState(event.id);
    emitToEvent(event.id, "game:started", state);

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to start event";
    console.error(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

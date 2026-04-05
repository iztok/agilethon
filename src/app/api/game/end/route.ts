import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function POST() {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const event = await getOrCreateEvent();
  if (event.phase === "finished") return NextResponse.json({ error: "Already finished" }, { status: 400 });

  await prisma.event.update({ where: { id: event.id }, data: { phase: "finished", finishedAt: new Date() } });
  await prisma.eventLog.create({ data: { eventId: event.id, message: "Event ended by Game Master.", type: "admin_action" } });

  emitToEvent(event.id, "game:finished", {});
  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { getOrCreateEvent } from "@/lib/game";
import { emitToEvent } from "@/lib/socket-emitter";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const currentUser = await getAuthUser();
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json() as { vibeLevel?: number; isAdmin?: boolean; isOptedOut?: boolean };

  const isSelf = currentUser.id === id;
  const isAdmin = currentUser.isAdmin;

  if (!isSelf && !isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updateData: Record<string, unknown> = {};

  if (body.vibeLevel !== undefined) {
    if (body.vibeLevel < 1 || body.vibeLevel > 5) return NextResponse.json({ error: "vibeLevel must be 1–5" }, { status: 400 });
    updateData.vibeLevel = body.vibeLevel;
  }

  if (isAdmin) {
    if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
    if (body.isOptedOut !== undefined) updateData.isOptedOut = body.isOptedOut;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, name: true, email: true, vibeLevel: true, isAdmin: true, isOptedOut: true, avatarUrl: true },
  });

  try {
    const event = await getOrCreateEvent();
    emitToEvent(event.id, "player:updated", { userId: id, fields: updateData });
  } catch {}

  return NextResponse.json(updated);
}

export const dynamic = "force-dynamic";

import { getOrCreateEvent, getGameState } from "@/lib/game";
import { prisma } from "@/lib/prisma";
import { GameControlClient } from "./GameControlClient";

export default async function GameControlPage() {
  const event = await getOrCreateEvent();
  const state = await getGameState(event.id);
  const obstacles = await prisma.obstacle.findMany({ orderBy: [{ severity: "desc" }, { name: "asc" }] });

  return <GameControlClient eventId={event.id} initialState={state} obstacles={obstacles} />;
}

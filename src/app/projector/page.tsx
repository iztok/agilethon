export const dynamic = "force-dynamic";

import { getOrCreateEvent, getGameState } from "@/lib/game";
import { ProjectorClient } from "./ProjectorClient";

// Public — no auth required
export default async function ProjectorPage() {
  const event = await getOrCreateEvent();
  const state = await getGameState(event.id);

  return <ProjectorClient eventId={event.id} initialState={state} />;
}

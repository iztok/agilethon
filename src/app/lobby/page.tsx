export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getOrCreateEvent, getGameState } from "@/lib/game";
import { LobbyClient } from "./LobbyClient";

export default async function LobbyPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const event = await getOrCreateEvent();
  if (event.phase !== "registration") redirect("/dashboard");

  const state = await getGameState(event.id);

  return (
    <LobbyClient
      eventId={event.id}
      initialState={state}
      currentUserId={user.id}
      isAdmin={user.isAdmin}
      user={{
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        image: user.image ?? null,
        vibeLevel: user.vibeLevel,
        isAdmin: user.isAdmin,
      }}
    />
  );
}

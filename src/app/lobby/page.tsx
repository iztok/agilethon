export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateEvent, getGameState } from "@/lib/game";
import { LobbyClient } from "./LobbyClient";

export default async function LobbyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const event = await getOrCreateEvent();
  if (event.phase !== "registration") redirect("/dashboard");

  const state = await getGameState(event.id);
  const sessionUser = session.user as typeof session.user & {
    id: string; isAdmin?: boolean; vibeLevel?: number;
  };

  return (
    <LobbyClient
      eventId={event.id}
      initialState={state}
      currentUserId={sessionUser.id}
      isAdmin={sessionUser.isAdmin ?? false}
      user={{
        id: sessionUser.id,
        name: sessionUser.name ?? "",
        email: sessionUser.email ?? "",
        image: sessionUser.image ?? null,
        vibeLevel: sessionUser.vibeLevel ?? 3,
        isAdmin: sessionUser.isAdmin ?? false,
      }}
    />
  );
}

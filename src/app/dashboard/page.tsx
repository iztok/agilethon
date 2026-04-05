export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateEvent, getGameState } from "@/lib/game";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const event = await getOrCreateEvent();
  if (event.phase === "registration") redirect("/lobby");

  const state = await getGameState(event.id);
  const sessionUser = session.user as typeof session.user & {
    id: string; isAdmin?: boolean; vibeLevel?: number;
  };

  return (
    <DashboardClient
      eventId={event.id}
      initialState={state}
      currentUserId={sessionUser.id}
      isAdmin={sessionUser.isAdmin ?? false}
      user={{
        id: sessionUser.id,
        name: sessionUser.name ?? "",
        email: sessionUser.email ?? "",
        isAdmin: sessionUser.isAdmin ?? false,
      }}
    />
  );
}

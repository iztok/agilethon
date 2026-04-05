export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getOrCreateEvent, getGameState } from "@/lib/game";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const user = await getAuthUser();
  if (!user) redirect("/login");

  const event = await getOrCreateEvent();
  if (event.phase === "registration") redirect("/lobby");

  const state = await getGameState(event.id);

  return (
    <DashboardClient
      eventId={event.id}
      initialState={state}
      currentUserId={user.id}
      isAdmin={user.isAdmin}
      user={{
        id: user.id,
        name: user.name ?? "",
        email: user.email ?? "",
        isAdmin: user.isAdmin,
      }}
    />
  );
}

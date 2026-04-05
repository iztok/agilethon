export const dynamic = "force-dynamic";

import { getAuthUser } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import { getOrCreateEvent } from "@/lib/game";

export default async function RootPage() {
  const user = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const event = await getOrCreateEvent();

  if (event.phase === "registration") {
    redirect("/lobby");
  }

  redirect("/dashboard");
}

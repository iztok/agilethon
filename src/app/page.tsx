export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getOrCreateEvent } from "@/lib/game";

export default async function RootPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const event = await getOrCreateEvent();

  if (event.phase === "registration") {
    redirect("/lobby");
  }

  redirect("/dashboard");
}

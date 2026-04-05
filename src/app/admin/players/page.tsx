export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { PlayersClient } from "./PlayersClient";

export default async function PlayersPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ isAdmin: "desc" }, { registeredAt: "asc" }],
  });

  return <PlayersClient users={users} />;
}

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ObstaclesClient } from "./ObstaclesClient";

export default async function ObstaclesPage() {
  const obstacles = await prisma.obstacle.findMany({ orderBy: [{ severity: "desc" }, { name: "asc" }] });
  return <ObstaclesClient obstacles={obstacles} />;
}

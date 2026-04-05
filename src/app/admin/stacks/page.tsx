export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { StacksClient } from "./StacksClient";

export default async function StacksPage() {
  const stacks = await prisma.techStack.findMany({ orderBy: { label: "asc" } });
  return <StacksClient stacks={stacks} />;
}

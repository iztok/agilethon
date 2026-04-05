export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { ProjectsClient } from "./ProjectsClient";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });
  return <ProjectsClient projects={projects} />;
}

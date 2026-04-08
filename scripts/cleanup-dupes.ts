import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanup() {
  // Get all records ordered by createdAt
  const stacks = await prisma.techStack.findMany({ orderBy: { createdAt: "asc" } });
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "asc" } });
  const obstacles = await prisma.obstacle.findMany({ orderBy: { createdAt: "asc" } });

  // Keep first occurrence of each unique label/name, collect duplicate IDs
  const keepStacks = new Map<string, string>();
  const dupStackIds: string[] = [];
  for (const s of stacks) {
    if (keepStacks.has(s.label)) dupStackIds.push(s.id);
    else keepStacks.set(s.label, s.id);
  }

  const keepProjects = new Map<string, string>();
  const dupProjectIds: string[] = [];
  for (const p of projects) {
    if (keepProjects.has(p.name)) dupProjectIds.push(p.id);
    else keepProjects.set(p.name, p.id);
  }

  const keepObstacles = new Map<string, string>();
  const dupObstacleIds: string[] = [];
  for (const o of obstacles) {
    if (keepObstacles.has(o.name)) dupObstacleIds.push(o.id);
    else keepObstacles.set(o.name, o.id);
  }

  console.log(`Deleting ${dupStackIds.length} duplicate tech stacks...`);
  if (dupStackIds.length) await prisma.techStack.deleteMany({ where: { id: { in: dupStackIds } } });

  console.log(`Deleting ${dupProjectIds.length} duplicate projects...`);
  if (dupProjectIds.length) await prisma.project.deleteMany({ where: { id: { in: dupProjectIds } } });

  console.log(`Deleting ${dupObstacleIds.length} duplicate obstacles...`);
  if (dupObstacleIds.length) await prisma.obstacle.deleteMany({ where: { id: { in: dupObstacleIds } } });

  const [s, p, o] = await Promise.all([
    prisma.techStack.count(),
    prisma.project.count(),
    prisma.obstacle.count(),
  ]);
  console.log(`✅ Done — TechStacks: ${s}, Projects: ${p}, Obstacles: ${o}`);
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name, tagline, spec, difficulty } = await req.json();
  if (!name || !tagline || !spec) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const project = await prisma.project.create({ data: { name, tagline, spec, difficulty } });
  return NextResponse.json(project, { status: 201 });
}

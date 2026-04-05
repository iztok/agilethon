import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const obstacles = await prisma.obstacle.findMany({ orderBy: [{ severity: "desc" }, { name: "asc" }] });
  return NextResponse.json(obstacles);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { name, icon, description, severity, durationMinutes } = await req.json();
  if (!name || !description || !severity) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const obstacle = await prisma.obstacle.create({
    data: { name, icon: icon || "⚠️", description, severity, durationMinutes: durationMinutes ?? 0, isCustom: true },
  });
  return NextResponse.json(obstacle, { status: 201 });
}

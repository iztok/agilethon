import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const stacks = await prisma.techStack.findMany({ orderBy: { label: "asc" } });
  return NextResponse.json(stacks);
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { frontend, backend } = await req.json();
  if (!frontend || !backend) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  const stack = await prisma.techStack.create({ data: { frontend, backend, label: `${frontend} + ${backend}` } });
  return NextResponse.json(stack, { status: 201 });
}

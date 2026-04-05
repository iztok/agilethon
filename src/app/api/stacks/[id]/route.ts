import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const { frontend, backend } = await req.json();
  const stack = await prisma.techStack.update({ where: { id }, data: { frontend, backend, label: `${frontend} + ${backend}` } });
  return NextResponse.json(stack);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await prisma.techStack.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

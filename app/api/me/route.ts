import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/nextAuthOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any);
  const s: any = session;
  if (!s || !s.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(s.user.id);
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, username: true, image: true, role: true } });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions as any);
  const s: any = session;
  if (!s || !s.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = Number(s.user.id);
  const body = await req.json();
  const data: any = {};
  if (body.name) data.name = body.name;
  if (body.username !== undefined) data.username = body.username || null;
  if (body.email) data.email = body.email;
  if (body.image !== undefined) data.image = body.image || null;
  if (body.password) {
    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(body.password, salt);
  }

  try {
  const updated = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, username: true, image: true, role: true } });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || 'Erro' }, { status: 500 });
  }
}

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

  // Prevent unique constraint errors by checking email/username collisions beforehand
  const current = await prisma.user.findUnique({ where: { id }, select: { email: true, username: true } });
  if (!current) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  if (body.email && body.email !== current.email) {
    const exists = await prisma.user.findUnique({ where: { email: body.email } });
    if (exists) return NextResponse.json({ error: "E-mail já em uso" }, { status: 400 });
  }

  if (body.username !== undefined && body.username !== current.username) {
    // allow empty/null username
    if (body.username) {
      const existsU = await prisma.user.findUnique({ where: { username: body.username } });
      if (existsU) return NextResponse.json({ error: "Username já em uso" }, { status: 400 });
    }
  }

  try {
    const updated = await prisma.user.update({ where: { id }, data, select: { id: true, name: true, email: true, username: true, image: true, role: true } });
    return NextResponse.json(updated);
  } catch (err: any) {
    console.error(err);
    // Prisma unique constraint fallback
    if (err.code === 'P2002') {
      const target = err.meta?.target as string[] | string | undefined;
      const field = Array.isArray(target) ? target.join(',') : target;
      return NextResponse.json({ error: `Conflito de valor único: ${field || 'campo'}` }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Erro' }, { status: 500 });
  }
}

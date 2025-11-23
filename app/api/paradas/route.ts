import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/nextAuthOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // 'em_andamento', 'concluida', 'cancelada'

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const paradas = await prisma.parada.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      testes: {
        select: { status: true }
      },
      _count: {
        select: { testes: true }
      }
    }
  });

  return NextResponse.json(paradas);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { nome, descricao, tipo, equipeResponsavel, macro, duracaoPrevistaHoras } = body;

    if (!nome || !tipo) {
      return NextResponse.json({ error: "Campos obrigatórios: nome e tipo" }, { status: 400 });
    }

    const novaParada = await prisma.parada.create({
      data: {
        nome,
        descricao,
        tipo, // 'preventiva', 'corretiva', 'emergencial'
        equipeResponsavel,
        macro,
        duracaoPrevistaHoras: duracaoPrevistaHoras ? Number(duracaoPrevistaHoras) : null,
        status: 'em_andamento',
        dataInicio: new Date(), // Auto-start now
      }
    });

    return NextResponse.json(novaParada, { status: 201 });
  } catch (error: any) {
    console.error("Erro ao criar parada:", error);
    return NextResponse.json({ error: "Erro ao criar parada" }, { status: 500 });
  }
}

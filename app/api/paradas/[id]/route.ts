import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/nextAuthOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const parada = await prisma.parada.findUnique({
    where: { id: Number(id) },
    include: {
      testes: {
        include: {
          equipamento: {
            include: {
              area: true,
              tipo: true,
            },
          },
          checkTemplate: true,
        },
      },
    }
  });

  if (!parada) return NextResponse.json({ error: "Parada não encontrada" }, { status: 404 });

  return NextResponse.json(parada);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    const { nome, descricao, tipo, equipeResponsavel, macro, duracaoPrevistaHoras, status, dataFim } = body;

    const data: any = {};
    if (nome) data.nome = nome;
    if (descricao !== undefined) data.descricao = descricao;
    if (tipo) data.tipo = tipo;
    if (equipeResponsavel !== undefined) data.equipeResponsavel = equipeResponsavel;
    if (macro !== undefined) data.macro = macro;
    if (duracaoPrevistaHoras !== undefined) data.duracaoPrevistaHoras = Number(duracaoPrevistaHoras);
    if (status) data.status = status;
    if (dataFim) data.dataFim = new Date(dataFim);

    // If status changes to 'concluida' or 'cancelada' and dataFim is not provided, set it to now
    if ((status === 'concluida' || status === 'cancelada') && !dataFim) {
      data.dataFim = new Date();
    }

    const updatedParada = await prisma.parada.update({
      where: { id: Number(id) },
      data
    });

    return NextResponse.json(updatedParada);
  } catch (error: any) {
    console.error("Erro ao atualizar parada:", error);
    return NextResponse.json({ error: "Erro ao atualizar parada" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions as any);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    await prisma.parada.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao excluir parada:", error);
    return NextResponse.json({ error: "Erro ao excluir parada" }, { status: 500 });
  }
}

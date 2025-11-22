import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/nextAuthOptions";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions as any);
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const paradaId = Number(id);
  if (!paradaId || Number.isNaN(paradaId)) {
    return NextResponse.json(
      { error: "Parada inválida" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const equipamentosIds: number[] = Array.isArray(body.equipamentos)
      ? body.equipamentos
          .map((v: unknown) => Number(v))
          .filter((n: number) => !Number.isNaN(n))
      : [];

    if (!equipamentosIds.length) {
      // se nenhuma seleção, apenas remove testes da parada
      await prisma.teste.deleteMany({ where: { paradaId } });
      return NextResponse.json({ created: 0, removed: "all" });
    }

    // garantir que equipamentos existem e carregar tipo + templates
    const equipamentos = await prisma.equipamento.findMany({
      where: { id: { in: equipamentosIds } },
      include: {
        tipo: {
          include: { checkTemplates: true },
        },
      },
    });

    // remover testes de equipamentos que não estão mais selecionados
    await prisma.teste.deleteMany({
      where: {
        paradaId,
        equipamentoId: { notIn: equipamentosIds },
      },
    });

    const existentes = await prisma.teste.findMany({
      where: {
        paradaId,
        equipamentoId: { in: equipamentosIds },
      },
      select: {
        id: true,
        equipamentoId: true,
        checkTemplateId: true,
      },
    });

    const existenteMap = new Set(
      existentes
        .filter((t) => t.checkTemplateId != null)
        .map((t) => `${t.equipamentoId}:${t.checkTemplateId}`)
    );

    let toCreate: { paradaId: number; equipamentoId: number; checkTemplateId: number; }[] = [];

    for (const eq of equipamentos) {
      if (!eq.tipo) continue;
      for (const tpl of eq.tipo.checkTemplates) {
        const key = `${eq.id}:${tpl.id}`;
        if (!existenteMap.has(key)) {
          toCreate.push({
            paradaId,
            equipamentoId: eq.id,
            checkTemplateId: tpl.id,
          });
        }
      }
    }

    if (toCreate.length) {
      await prisma.teste.createMany({
        data: toCreate.map((t) => ({
          paradaId: t.paradaId,
          equipamentoId: t.equipamentoId,
          checkTemplateId: t.checkTemplateId,
        })),
      });
    }

    return NextResponse.json({ created: toCreate.length });
  } catch (error) {
    console.error("Erro ao salvar configuração de parada:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 }
    );
  }
}


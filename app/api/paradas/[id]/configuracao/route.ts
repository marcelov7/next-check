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

    const areasPayload: any[] | undefined = Array.isArray(body.areas)
      ? body.areas.map((a: any) => ({
          areaId: Number(a.areaId),
          equipamentosSelecionados: Array.isArray(a.equipamentosSelecionados)
            ? a.equipamentosSelecionados.map((v: unknown) => Number(v)).filter((n: number) => !Number.isNaN(n))
            : [],
          responsavel: a.responsavel ? String(a.responsavel) : "",
          membros: Array.isArray(a.membros) ? a.membros : [],
        }))
      : undefined;

    if (!equipamentosIds.length) {
      // se nenhuma seleção, apenas remove testes da parada
      await prisma.teste.deleteMany({ where: { paradaId } });
      // também limpa configuração por área se enviada vazia
      if (areasPayload) {
        await prisma.parada.update({ where: { id: paradaId }, data: { areasConfig: [] } });
      }
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

    // persistir configuração por área (normalizada) se enviada
    if (areasPayload) {
      const missing = areasPayload.filter((a) => a.equipamentosSelecionados && a.equipamentosSelecionados.length > 0 && (!a.responsavel || !String(a.responsavel).trim()));
      if (missing.length) {
        return NextResponse.json({ error: "Defina um responsável para cada área selecionada." }, { status: 400 });
      }
      try {
        for (const a of areasPayload) {
          const areaId = Number(a.areaId);
          if (Number.isNaN(areaId)) continue;

          // procurar existente
          const existing = await prisma.paradaArea.findFirst({ where: { paradaId, areaId } });

          if (existing) {
            // atualizar ParadaArea
            await prisma.paradaArea.update({
              where: { id: existing.id },
              data: {
                responsavelNome: a.responsavel ?? null,
                equipeHabilitada: !!(a.membros && a.membros.length),
                updatedAt: new Date(),
              },
            });

            // members: delete old and insert new
            await prisma.paradaAreaMember.deleteMany({ where: { paradaAreaId: existing.id } });
            if (Array.isArray(a.membros) && a.membros.length) {
              const membersData = a.membros.map((m: any) => ({ paradaAreaId: existing.id, nome: m.nome ?? "", setor: m.setor ?? null }));
              await prisma.paradaAreaMember.createMany({ data: membersData });
            }

            // equipamentos: sync
            await prisma.paradaAreaEquip.deleteMany({ where: { paradaAreaId: existing.id } });
            if (Array.isArray(a.equipamentosSelecionados) && a.equipamentosSelecionados.length) {
              const eqData = a.equipamentosSelecionados.map((eid: number) => ({ paradaAreaId: existing.id, equipamentoId: Number(eid) }));
              await prisma.paradaAreaEquip.createMany({ data: eqData });
            }
          } else {
            // criar novo ParadaArea com membros e equipamentos relacionados
            await prisma.paradaArea.create({
              data: {
                paradaId,
                areaId,
                responsavelNome: a.responsavel ?? null,
                equipeHabilitada: !!(a.membros && a.membros.length),
                membros: Array.isArray(a.membros)
                  ? { create: a.membros.map((m: any) => ({ nome: m.nome ?? "", setor: m.setor ?? null })) }
                  : undefined,
                equipamentos: Array.isArray(a.equipamentosSelecionados)
                  ? { create: a.equipamentosSelecionados.map((eid: number) => ({ equipamentoId: Number(eid) })) }
                  : undefined,
              },
            });
          }
        }

        // também manter snapshot no campo JSON para compatibilidade
        await prisma.parada.update({ where: { id: paradaId }, data: { areasConfig: areasPayload } });
      } catch (e) {
        // se as tabelas normalizadas não existirem ou ocorrer algum erro, regride para salvar apenas o JSON
        console.warn('Falha ao persistir em tabelas normalizadas, salvando snapshot JSON. Erro:', e);
        await prisma.parada.update({ where: { id: paradaId }, data: { areasConfig: areasPayload } });
      }
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


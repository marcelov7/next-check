#!/usr/bin/env node
// Script simples para migrar dados do campo Parada.areasConfig (JSON) para as tabelas normalizadas
// Uso: DATABASE_URL=... node scripts/migrate_areasconfig_to_paradaarea.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando migração de areasConfig -> ParadaArea...');
  const paradas = await prisma.parada.findMany({ where: { areasConfig: { not: null } }, select: { id: true, areasConfig: true } });
  console.log(`Encontradas ${paradas.length} paradas com areasConfig`);

  for (const p of paradas) {
    const paradaId = p.id;
    const areas = p.areasConfig || [];
    if (!Array.isArray(areas) || areas.length === 0) continue;

    console.log(`Migrando parada ${paradaId} com ${areas.length} áreas`);

    for (const a of areas) {
      const areaId = Number(a.areaId);
      if (Number.isNaN(areaId)) continue;

      // verificar existente
      const existing = await prisma.paradaArea.findFirst({ where: { paradaId, areaId } });
      if (existing) {
        console.log(` - Atualizando ParadaArea existente (${existing.id}) para area ${areaId}`);
        await prisma.paradaArea.update({ where: { id: existing.id }, data: { responsavelNome: a.responsavel ?? null, equipeHabilitada: !!(a.membros && a.membros.length), updatedAt: new Date() } });

        await prisma.paradaAreaMember.deleteMany({ where: { paradaAreaId: existing.id } });
        if (Array.isArray(a.membros) && a.membros.length) {
          const membersData = a.membros.map(m => ({ paradaAreaId: existing.id, nome: m.nome ?? '', setor: m.setor ?? null }));
          await prisma.paradaAreaMember.createMany({ data: membersData });
        }

        await prisma.paradaAreaEquip.deleteMany({ where: { paradaAreaId: existing.id } });
        if (Array.isArray(a.equipamentosSelecionados) && a.equipamentosSelecionados.length) {
          const eqData = a.equipamentosSelecionados.map(eid => ({ paradaAreaId: existing.id, equipamentoId: Number(eid) }));
          await prisma.paradaAreaEquip.createMany({ data: eqData });
        }
      } else {
        console.log(` - Criando ParadaArea para area ${areaId}`);
        await prisma.paradaArea.create({ data: {
          paradaId,
          areaId,
          responsavelNome: a.responsavel ?? null,
          equipeHabilitada: !!(a.membros && a.membros.length),
          membros: Array.isArray(a.membros) ? { create: a.membros.map(m => ({ nome: m.nome ?? '', setor: m.setor ?? null })) } : undefined,
          equipamentos: Array.isArray(a.equipamentosSelecionados) && a.equipamentosSelecionados.length ? { create: a.equipamentosSelecionados.map(eid => ({ equipamentoId: Number(eid) })) } : undefined,
        }});
      }
    }
  }

  console.log('Migração concluída.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { ParadaStatus, ParadaTipo, TesteStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma";

dotenv.config();

async function main() {
  await prisma.teste.deleteMany();
  await prisma.parada.deleteMany();
  await prisma.equipamento.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password", 10);
  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@checklist.local",
      username: "admin",
      password: hashedPassword,
      role: "admin",
    },
  });

  const areaData = [
    {
      nome: "Área de Produção",
      descricao: "Área principal de produção com equipamentos críticos",
      equipamentos: [
        { nome: "Bomba Centrífuga Principal", tag: "BOMB-001", descricao: "Bomba principal do processo" },
        { nome: "Motor Elétrico 1", tag: "MOT-001", descricao: "Motor de 50HP para bomba principal" },
        { nome: "Válvula de Controle 1", tag: "VAL-001", descricao: "Válvula pneumática de controle de vazão" },
        { nome: "Sensor de Pressão 1", tag: "PT-001", descricao: "Transmissor de pressão na linha principal" },
      ],
    },
    {
      nome: "Área de Utilidades",
      descricao: "Equipamentos de apoio como bombas e compressores",
      equipamentos: [
        { nome: "Compressor de Ar", tag: "COMP-001", descricao: "Compressor de ar comprimido" },
        { nome: "Bomba de Água de Resfriamento", tag: "BOMB-002", descricao: "Sistema de água de resfriamento" },
        { nome: "Trocador de Calor", tag: "TC-001", descricao: "Trocador de calor principal" },
      ],
    },
    {
      nome: "Área de Tratamento",
      descricao: "Tratamento de água e efluentes",
      equipamentos: [
        { nome: "Bomba Dosadora de Químicos", tag: "BOMB-003", descricao: "Dosagem de produtos químicos" },
        { nome: "Filtro de Água", tag: "FIL-001", descricao: "Sistema de filtração" },
        { nome: "Medidor de pH", tag: "PH-001", descricao: "Controle de pH do processo" },
      ],
    },
  ];

  const createdAreas = [];
  for (const area of areaData) {
    const createdArea = await prisma.area.create({
      data: {
        nome: area.nome,
        descricao: area.descricao,
        ativo: true,
      },
    });

    for (const eq of area.equipamentos) {
      await prisma.equipamento.create({
        data: {
          nome: eq.nome,
          tag: eq.tag,
          descricao: eq.descricao,
          ativo: true,
          areaId: createdArea.id,
        },
      });
    }

    createdAreas.push(createdArea);
  }

  const equipamentos = await prisma.equipamento.findMany({ where: { ativo: true } });

  const now = new Date();
  const paradasData = [
    {
      macro: "PREV-OUT-2025",
      nome: "Parada de Manutenção Preventiva - Outubro 2025",
      descricao: "Parada programada para todos os equipamentos críticos",
      equipeResponsavel: "João Silva (Coordenador), Maria Santos (Técnica Elétrica), Pedro Costa (Técnico Mecânico)",
      dataInicio: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      status: ParadaStatus.em_andamento,
      tipo: ParadaTipo.preventiva,
      duracaoPrevistaHoras: 12,
    },
    {
      macro: "CORR-SET-2025",
      nome: "Manutenção Corretiva - Bomba Principal",
      descricao: "Correção de vazamento na bomba centrífuga principal",
      equipeResponsavel: "Carlos Oliveira (Técnico), Ana Paula (Auxiliar)",
      dataInicio: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
      dataFim: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
      status: ParadaStatus.concluida,
      tipo: ParadaTipo.corretiva,
      duracaoPrevistaHoras: 8,
    },
    {
      macro: "EMER-SET-2025",
      nome: "Parada Emergencial - Falha no Sistema",
      descricao: "Parada não programada devido a falha no sistema elétrico",
      equipeResponsavel: "Equipe de Plantão, Eletricista de Emergência",
      dataInicio: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      dataFim: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      status: ParadaStatus.concluida,
      tipo: ParadaTipo.emergencial,
      duracaoPrevistaHoras: 6,
    },
  ];

  const createdParadas = [];
  for (const parada of paradasData) {
    createdParadas.push(
      await prisma.parada.create({
        data: {
          macro: parada.macro,
          nome: parada.nome,
          descricao: parada.descricao,
          equipeResponsavel: parada.equipeResponsavel,
          dataInicio: parada.dataInicio,
          dataFim: parada.dataFim,
          duracaoPrevistaHoras: parada.duracaoPrevistaHoras,
          status: parada.status,
          tipo: parada.tipo,
        },
      })
    );
  }

  const statuses = [TesteStatus.pendente, TesteStatus.ok, TesteStatus.problema];

  const createTestForParada = async (paradaId: number, equipamentosToTest: typeof equipamentos) => {
    for (const equipamento of equipamentosToTest) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      await prisma.teste.create({
        data: {
          paradaId,
          equipamentoId: equipamento.id,
          status,
          observacoes: status !== TesteStatus.pendente ? "Teste realizado conforme procedimento" : null,
          problemaDescricao: status === TesteStatus.problema ? "Vazamento detectado na conexão principal" : null,
          dataTeste:
            status !== TesteStatus.pendente ? new Date(now.getTime() - Math.floor(Math.random() * 120) * 60 * 1000) : null,
          testadoPor: status !== TesteStatus.pendente ? "João Silva" : null,
        },
      });
    }
  };

  await createTestForParada(createdParadas[0].id, equipamentos);
  await createTestForParada(createdParadas[1].id, equipamentos);

  const selectedEmergencia = equipamentos.slice(0, 3);
  for (const equipamento of selectedEmergencia) {
    await prisma.teste.create({
      data: {
        paradaId: createdParadas[2].id,
        equipamentoId: equipamento.id,
        status: TesteStatus.ok,
        observacoes: "Verificação rápida durante emergência",
        dataTeste: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000 + Math.floor(Math.random() * 120) * 60 * 1000),
        testadoPor: "Equipe de Plantão",
      },
    });
  }

  console.log("Seed concluída: áreas, equipamentos, paradas, testes e usuário admin criados.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

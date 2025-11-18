import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const areaId = url.searchParams.get('areaId');
  const where: any = {};
  if (areaId) where.areaId = Number(areaId);
  // select minimal fields and include only necessary relations to reduce payload
  const equipamentos = await prisma.equipamento.findMany({
    where,
    select: {
      id: true,
      nome: true,
      tag: true,
      ativo: true,
      areaId: true,
      tipoId: true,
      area: { select: { id: true, nome: true } },
      tipo: { select: { id: true, nome: true } }
    }
  });
  return NextResponse.json(equipamentos, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.nome || !data.tag || !data.areaId) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    const equipamento = await prisma.equipamento.create({ data: { nome: data.nome, tag: data.tag, descricao: data.descricao ?? null, ativo: data.ativo ?? true, areaId: Number(data.areaId), tipoId: data.tipoId ? Number(data.tipoId) : null } });
    return NextResponse.json(equipamento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar equipamento' }, { status: 500 });
  }
}

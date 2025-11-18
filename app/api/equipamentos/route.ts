import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const equipamentos = await prisma.equipamento.findMany({ include: { area: true } });
  return NextResponse.json(equipamentos);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.nome || !data.tag || !data.areaId) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    const equipamento = await prisma.equipamento.create({ data: { nome: data.nome, tag: data.tag, descricao: data.descricao ?? null, ativo: data.ativo ?? true, areaId: Number(data.areaId) } });
    return NextResponse.json(equipamento, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar equipamento' }, { status: 500 });
  }
}

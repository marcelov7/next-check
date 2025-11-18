import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const areas = await prisma.area.findMany({ include: { equipamentos: true } });
  return NextResponse.json(areas);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    const area = await prisma.area.create({ data: { nome: data.nome, descricao: data.descricao ?? null, ativo: data.ativo ?? true } });
    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar área' }, { status: 500 });
  }
}

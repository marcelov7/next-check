import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const areas = await prisma.area.findMany({ include: { equipamentos: { select: { id: true } } } });
  return NextResponse.json(areas, {
    headers: {
      // Cache on CDN for 60s and allow stale while revalidate for 120s
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  });
}

export async function POST(request: NextRequest) {
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

import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const templates = await prisma.checkTemplate.findMany({ select: { id: true, nome: true, descricao: true, ordem: true, obrigatorio: true, tipoId: true } });
  return NextResponse.json(templates, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.nome || !data.tipoId) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    const tpl = await prisma.checkTemplate.create({ data: { nome: data.nome, descricao: data.descricao ?? null, ordem: data.ordem ?? null, obrigatorio: data.obrigatorio ?? true, tipoId: Number(data.tipoId) } });
    return NextResponse.json(tpl, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar template' }, { status: 500 });
  }
}

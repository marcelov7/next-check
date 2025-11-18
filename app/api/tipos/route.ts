import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tipos = await prisma.tipoEquipamento.findMany();
  return NextResponse.json(tipos);
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.nome) return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    const tipo = await prisma.tipoEquipamento.create({ data: { nome: data.nome, descricao: data.descricao ?? null, ativo: data.ativo ?? true } });
    return NextResponse.json(tipo, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao criar tipo' }, { status: 500 });
  }
}

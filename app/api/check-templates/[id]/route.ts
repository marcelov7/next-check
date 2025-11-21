import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: any) {
  const params = await (context?.params ?? {});
  const id = Number(params.id);
  const tpl = await prisma.checkTemplate.findUnique({ where: { id }, include: { tipo: true } });
  if (!tpl) return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 });
  return NextResponse.json(tpl);
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    const data = await request.json();
    const tpl = await prisma.checkTemplate.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao ?? null,
        ordem: data.ordem ?? null,
        obrigatorio: data.obrigatorio ?? true,
        tipoCampo: data.tipoCampo ?? 'status',
        unidade: data.unidade ?? null,
        valorMinimo: data.valorMinimo !== undefined && data.valorMinimo !== null ? Number(data.valorMinimo) : null,
        valorMaximo: data.valorMaximo !== undefined && data.valorMaximo !== null ? Number(data.valorMaximo) : null,
      },
    });
    return NextResponse.json(tpl);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    await prisma.checkTemplate.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar template' }, { status: 500 });
  }
}

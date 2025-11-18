import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: any) {
  const params = await (context?.params ?? {});
  const id = Number(params.id);
  const area = await prisma.area.findUnique({ where: { id }, include: { equipamentos: true } });
  if (!area) return NextResponse.json({ error: 'Área não encontrada' }, { status: 404 });
  return NextResponse.json(area);
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    const data = await request.json();
    const area = await prisma.area.update({ where: { id }, data: { nome: data.nome, descricao: data.descricao ?? null, ativo: data.ativo ?? true } });
    return NextResponse.json(area);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar área' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    await prisma.teste.deleteMany({ where: { equipamento: { areaId: id } } }).catch(() => {});
    await prisma.equipamento.deleteMany({ where: { areaId: id } });
    await prisma.area.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar área' }, { status: 500 });
  }
}

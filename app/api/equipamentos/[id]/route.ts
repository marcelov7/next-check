import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: any) {
  const params = await (context?.params ?? {});
  const id = Number(params.id);
  const equipamento = await prisma.equipamento.findUnique({ where: { id }, include: { area: true } });
  if (!equipamento) return NextResponse.json({ error: 'Equipamento não encontrado' }, { status: 404 });
  return NextResponse.json(equipamento);
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    const data = await request.json();
    const equipamento = await prisma.equipamento.update({ where: { id }, data: { nome: data.nome, tag: data.tag, descricao: data.descricao ?? null, ativo: data.ativo ?? true, areaId: Number(data.areaId) } });
    return NextResponse.json(equipamento);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar equipamento' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    await prisma.teste.deleteMany({ where: { equipamentoId: id } }).catch(() => {});
    await prisma.equipamento.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar equipamento' }, { status: 500 });
  }
}

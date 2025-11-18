import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, context: any) {
  const params = await (context?.params ?? {});
  const id = Number(params.id);
  const tipo = await prisma.tipoEquipamento.findUnique({ where: { id } });
  if (!tipo) return NextResponse.json({ error: 'Tipo não encontrado' }, { status: 404 });
  return NextResponse.json(tipo);
}

export async function PUT(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    const data = await request.json();
    const tipo = await prisma.tipoEquipamento.update({ where: { id }, data: { nome: data.nome, descricao: data.descricao ?? null, ativo: data.ativo ?? true } });
    return NextResponse.json(tipo);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao atualizar tipo' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: any) {
  try {
    const params = await (context?.params ?? {});
    const id = Number(params.id);
    await prisma.checkTemplate.deleteMany({ where: { tipoId: id } }).catch(() => {});
    await prisma.equipamento.updateMany({ where: { tipoId: id }, data: { tipoId: null } });
    await prisma.tipoEquipamento.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erro ao deletar tipo' }, { status: 500 });
  }
}

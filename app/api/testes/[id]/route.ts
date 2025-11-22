import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import authOptions from "@/lib/nextAuthOptions";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const session = (await getServerSession(authOptions as any)) as Session | null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!id || Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Teste inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();

    const data: Record<string, unknown> = {};

    if (body.status) {
      data.status = body.status;
      if (body.status === "ok" || body.status === "nao_aplica") {
        data.problemaDescricao = null;
      }
    }

    if (body.observacoes !== undefined) {
      data.observacoes = body.observacoes;
    }

    if (body.problemaDescricao !== undefined) {
      data.problemaDescricao = body.problemaDescricao;
    }

    if (body.evidenciaImagem !== undefined) {
      data.evidenciaImagem = body.evidenciaImagem || null;
    }

    if (body.resolucaoTexto !== undefined) {
      data.resolucaoTexto = body.resolucaoTexto || null;
    }

    if (body.resolucaoImagem !== undefined) {
      data.resolucaoImagem = body.resolucaoImagem || null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    // sempre atualiza dataTeste e testadoPor quando houver alteração
    data.dataTeste = new Date();
    if (session.user?.name) {
      data.testadoPor = session.user.name;
    } else if (session.user?.email) {
      data.testadoPor = session.user.email;
    }

    const updated = await prisma.teste.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar teste:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar teste" },
      { status: 500 }
    );
  }
}

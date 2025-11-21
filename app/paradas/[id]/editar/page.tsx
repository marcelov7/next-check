import PageLayout from "@/app/components/PageLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ParadaEditForm from "@/app/components/ParadaEditForm";

export const dynamic = "force-dynamic";

export default async function ParadaEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parada = await prisma.parada.findUnique({
    where: { id: Number(id) },
  });

  if (!parada) notFound();

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl py-8 space-y-4">
        <div>
          <Link
            href={`/paradas/${parada.id}`}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para detalhes da parada
          </Link>
        </div>
        <h1 className="text-2xl font-bold">Editar Parada</h1>
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <ParadaEditForm
            parada={{
              id: parada.id,
              nome: parada.nome,
              macro: parada.macro,
              descricao: parada.descricao,
              equipeResponsavel: parada.equipeResponsavel,
              tipo: parada.tipo,
              duracaoPrevistaHoras: parada.duracaoPrevistaHoras,
              status: parada.status,
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}


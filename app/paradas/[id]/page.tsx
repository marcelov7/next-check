import PageLayout from "@/app/components/PageLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Users, AlertTriangle, ShieldCheck, Wrench } from "lucide-react";
import ParadaActions from "@/app/components/ParadaActions";
import ParadaChecks from "@/app/components/ParadaChecks";

export const dynamic = "force-dynamic";

export default async function ParadaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parada = await prisma.parada.findUnique({
    where: { id: Number(id) },
    include: {
      testes: {
        include: {
          equipamento: {
            include: {
              area: true,
              tipo: true,
            },
          },
          checkTemplate: true,
        },
      },
    }
  });

  if (!parada) notFound();

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'preventiva': return <ShieldCheck className="h-6 w-6 text-green-500" />;
      case 'corretiva': return <Wrench className="h-6 w-6 text-orange-500" />;
      case 'emergencial': return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default: return <Clock className="h-6 w-6" />;
    }
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link href="/paradas-ativas" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Voltar para Paradas Ativas
          </Link>
        </div>

        <header className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-card border rounded-xl shadow-sm">
              {getIcon(parada.tipo)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{parada.nome}</h1>
              <div className="flex items-center gap-3 mt-1 text-muted-foreground">
                <span className="capitalize">{parada.tipo}</span>
                <span>•</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
                  parada.status === 'em_andamento' ? 'bg-blue-50 text-blue-700 ring-blue-700/10' :
                  parada.status === 'concluida' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                  'bg-red-50 text-red-700 ring-red-600/10'
                }`}>
                  {parada.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Detalhes</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Início</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{parada.dataInicio ? new Date(parada.dataInicio).toLocaleString() : '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Previsão</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{parada.duracaoPrevistaHoras ? `${parada.duracaoPrevistaHoras} horas` : '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Equipe</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{parada.equipeResponsavel || '-'}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Macro / Área</label>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>{parada.macro || '-'}</span>
                  </div>
                </div>
              </div>
              {parada.descricao && (
                <div className="mt-6 pt-6 border-t">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Descrição</label>
                  <p className="mt-2 text-sm leading-relaxed">{parada.descricao}</p>
                </div>
              )}
            </section>

            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Checks da parada</h2>
              <ParadaChecks paradaId={parada.id} testes={parada.testes as any} />
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="text-sm font-semibold mb-4 uppercase tracking-wider text-muted-foreground">Ações</h2>
              <ParadaActions paradaId={parada.id} />
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

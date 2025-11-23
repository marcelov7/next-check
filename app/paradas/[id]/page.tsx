import PageLayout from "@/app/components/PageLayout";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  AlertTriangle,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import ParadaActions from "@/app/components/ParadaActions";
import ParadaChecks from "@/app/components/ParadaChecks";

export const dynamic = "force-dynamic";

export default async function ParadaDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let parada: any = null;
  try {
    parada = await prisma.parada.findUnique({
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
        paradaAreas: {
          include: {
            membros: true,
            equipamentos: { include: { equipamento: true } },
            area: true,
          },
        },
      },
    });
  } catch (err) {
    // fallback: provavelmente a tabela ParadaArea não existe no banco.
    console.warn('Erro ao carregar parada com paradaAreas incluídas, tentando sem includes:', err);
    parada = await prisma.parada.findUnique({
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
      },
    });
  }

  if (!parada) notFound();

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "preventiva":
        return <ShieldCheck className="h-6 w-6 text-success" />;
      case "corretiva":
        return <Wrench className="h-6 w-6 text-warning" />;
      case "emergencial":
        return <AlertTriangle className="h-6 w-6 text-danger" />;
      default:
        return <Clock className="h-6 w-6 text-primary" />;
    }
  };

  const getStatusPillClasses = (status: string) => {
    if (status === "em_andamento") {
      return "bg-warning/15 text-warning ring-warning/40";
    }
    if (status === "concluida") {
      return "bg-success/15 text-success ring-success/40";
    }
    return "bg-danger/15 text-danger ring-danger/40";
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/paradas-ativas"
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Paradas Ativas
          </Link>
          <span
            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide bg-surface/60 text-muted-foreground`}
          >
            Parada de Manutenção
          </span>
        </div>

        <header className="mb-8 rounded-xl border bg-surface/80 px-6 py-5 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-secondary/80 p-3 text-primary-foreground shadow-sm">
                {getIcon(parada.tipo)}
              </div>
              <div>
                <h1 className="flex items-center gap-2 text-3xl font-bold text-primary">
                  🛠 {parada.nome}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium uppercase tracking-wide">
                    {parada.tipo}
                  </span>
                  <span className="text-xs">•</span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${getStatusPillClasses(
                      parada.status
                    )}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        parada.status === "em_andamento"
                          ? "bg-warning"
                          : parada.status === "concluida"
                          ? "bg-success"
                          : "bg-danger"
                      }`}
                    />
                    {parada.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground md:items-end">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Início:{" "}
                  {parada.dataInicio
                    ? new Date(parada.dataInicio).toLocaleString("pt-BR")
                    : "-"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  Previsão:{" "}
                  {parada.duracaoPrevistaHoras
                    ? `${parada.duracaoPrevistaHoras} horas`
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-secondary">
                Detalhes da parada
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Início
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {parada.dataInicio
                        ? new Date(parada.dataInicio).toLocaleString("pt-BR")
                        : "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Previsão
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {parada.duracaoPrevistaHoras
                        ? `${parada.duracaoPrevistaHoras} horas`
                        : "-"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Equipe
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{parada.equipeResponsavel || "-"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Macro / Área
                  </label>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    <span>{parada.macro || "-"}</span>
                  </div>
                </div>
              </div>
              {parada.descricao && (
                <div className="mt-6 border-t pt-6">
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Descrição
                  </label>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {parada.descricao}
                  </p>
                </div>
              )}
              {/* Áreas e responsáveis (normalizado) */}
              {(parada as any).paradaAreas && (parada as any).paradaAreas.length > 0 && (
                <div className="mt-6 border-t pt-6">
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Áreas e responsáveis
                  </label>
                  <div className="mt-2 space-y-3">
                    {((parada as any).paradaAreas as any[]).map((cfg: any) => {
                      const areaName = cfg.area?.nome ?? cfg.areaId;
                      return (
                        <div
                          key={cfg.id}
                          className="flex items-start gap-3 rounded-lg border bg-surface/40 px-3 py-2 text-sm"
                        >
                          <div className="flex-1">
                            <div className="text-xs font-semibold uppercase text-muted-foreground">
                              Área
                            </div>
                            <div className="text-sm font-medium text-secondary">
                              {areaName}
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              Responsável: {cfg.responsavelNome || "-"}
                            </div>
                            {cfg.membros && cfg.membros.length > 0 && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                Equipe:{" "}
                                {cfg.membros
                                  .map((m: any) => m.nome)
                                  .filter(Boolean)
                                  .join(", ") || "-"}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>

            <section className="mt-2 rounded-xl border bg-surface/80 p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-primary">
                Checks da parada
              </h2>
              <ParadaChecks 
                paradaId={parada.id} 
                testes={(parada as any).testes as any} 
                paradaAreas={(parada as any).paradaAreas ?? []} 
                areasConfig={(parada as any).areasConfig ?? []}
              />
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-xl border bg-card p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Ações
              </h2>
              <ParadaActions paradaId={parada.id} />
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

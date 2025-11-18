import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TesteStatus } from "@/app/generated/prisma/client";
import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardStats = {
  areaCount: number;
  equipamentoCount: number;
  paradaCount: number;
  testeCount: number;
  testsByStatus: Record<TesteStatus, number>;
};

const getDashboardStats = async (): Promise<DashboardStats> => {
  const [areaCount, equipamentoCount, paradaCount, testeCount, statusGroups] =
    await prisma.$transaction([
      prisma.area.count(),
      prisma.equipamento.count(),
      prisma.parada.count(),
      prisma.teste.count(),
      prisma.teste.groupBy({
        by: ["status"],
        orderBy: {
          status: "asc",
        },
        _count: {
          _all: true,
        },
      }),
    ]);

  const testsByStatus = statusGroups.reduce<Record<TesteStatus, number>>((acc, group) => {
    const count = typeof group._count === 'object' ? group._count._all ?? 0 : 0;
    acc[group.status] = count;
    return acc;
  }, {
    [TesteStatus.pendente]: 0,
    [TesteStatus.ok]: 0,
    [TesteStatus.problema]: 0,
    [TesteStatus.nao_aplica]: 0,
  });

  return {
    areaCount,
    equipamentoCount,
    paradaCount,
    testeCount,
    testsByStatus,
  };
};

const getLatestParadas = async () => {
  return prisma.parada.findMany({
    orderBy: { dataInicio: "desc" },
    take: 3,
    include: {
      testes: true,
    },
  });
};

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  const paradas = await getLatestParadas();

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto flex flex-col md:flex-row max-w-7xl gap-6">
        <Sidebar />
        <div className="min-h-[100dvh] flex-1 pt-14 md:pt-10">
      <header className="mx-auto max-w-5xl space-y-2">
  <p className="text-sm uppercase tracking-[0.3em] text-primary">Checklist de Paradas</p>
        <h1 className="text-4xl font-semibold text-foreground">Painel de Controle</h1>
        <p className="text-muted-foreground">
          Controle as áreas, equipamentos e testes em tempo real. Use o login para acessar as funcionalidades completas.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-foreground transition hover:bg-primary/80"
            href="/login"
          >
            Entrar no sistema
          </Link>
          <Link
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-foreground hover:border-border"
            href="/paradas"
          >
            Ver paradas
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-10 grid max-w-5xl gap-5 md:grid-cols-4">
  <StatCard label="Áreas" value={stats.areaCount} accent="from-primary to-blue-500" />
        <StatCard label="Equipamentos" value={stats.equipamentoCount} accent="from-slate-600 to-slate-500" />
        <StatCard label="Paradas" value={stats.paradaCount} accent="from-emerald-500 to-emerald-400" />
  <StatCard label="Testes" value={stats.testeCount} accent="from-accent to-accent-foreground" />
      </section>

      <section className="mx-auto mt-10 max-w-5xl space-y-6">
        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl font-semibold text-foreground">Status dos testes</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(stats.testsByStatus).map(([status, count]) => (
              <div key={status} className="rounded-2xl border border-border bg-card/40 p-4">
                <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{status}</p>
                <p className="text-3xl font-bold">{count}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/60 p-6">
          <h2 className="text-xl font-semibold text-foreground">Paradas recentes</h2>
          <div className="mt-4 space-y-4">
            {paradas.map((parada) => {
              const total = parada.testes.length;
              const completed = parada.testes.filter((teste) => teste.status !== TesteStatus.pendente).length;
              const progress = total ? Math.round((completed / total) * 100) : 0;

              return (
                <article key={parada.id} className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{parada.nome}</h3>
                      <p className="text-sm text-muted-foreground">
                        {parada.macro} · {parada.status.replace(/_/g, " ")}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">{parada.tipo}</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{progress}% dos testes concluidos</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
        </div>
      </div>
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: number;
  accent: string;
};

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-gradient-to-br px-6 py-5 text-foreground shadow-xl shadow-black/40 ${accent}`}
    >
      <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

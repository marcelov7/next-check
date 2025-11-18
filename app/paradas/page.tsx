import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { TesteStatus } from "@/app/generated/prisma/client";
import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ParadasPage() {
  const paradas = await prisma.parada.findMany({
    orderBy: { dataInicio: "desc" },
    include: { testes: true },
  });

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto flex flex-col md:flex-row max-w-7xl gap-6">
        <Sidebar />
        <div className="min-h-[100dvh] flex-1 pt-14 md:pt-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex flex-col gap-2">
          <Link href="/" className="text-sm text-primary underline">
            Voltar para o início
          </Link>
          <h1 className="text-3xl font-semibold">Paradas cadastradas</h1>
          <p className="text-muted-foreground">
            Cada parada pode ter vários testes. Clique em qualquer uma para visualizar detalhes complementares.
          </p>
        </header>

        <section className="grid gap-5">
          {paradas.map((parada) => {
            const total = parada.testes.length;
            const completed = parada.testes.filter((teste) => teste.status !== TesteStatus.pendente).length;
            const problems = parada.testes.filter((teste) => teste.status === TesteStatus.problema).length;

            return (
              <article key={parada.id} className="rounded-3xl border border-border bg-card/60 p-6 shadow-lg shadow-black/40">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-semibold">{parada.nome}</h2>
                    <p className="text-sm text-muted-foreground">
                      Macro: {parada.macro} · Tipo: {parada.tipo} · Status: {parada.status.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-4 py-1 text-sm text-primary">
                    {Math.round((completed / Math.max(total, 1)) * 100)}% concluído
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted-foreground">
                  <span>Total de testes: {total}</span>
                  <span>Concluídos: {completed}</span>
                  <span>Problemas: {problems}</span>
                  <span>Equipe: {parada.equipeResponsavel ?? "Não definida"}</span>
                </div>
                <div className="mt-4 h-2 rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.round((completed / Math.max(total, 1)) * 100)}%` }}
                  />
                </div>
              </article>
            );
          })}
        </section>
      </div>
        </div>
      </div>
    </main>
  );
}

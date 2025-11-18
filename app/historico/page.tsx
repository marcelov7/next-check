import PageLayout from "@/app/components/PageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HistoricoPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2 mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Paradas</p>
          <h1 className="text-3xl font-semibold">Histórico</h1>
          <p className="text-muted-foreground">Página para consulta de histórico de paradas e testes.</p>
        </header>

        {/* TODO: adicionar lista de histórico aqui */}
      </div>
    </PageLayout>
  );
}

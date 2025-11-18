import PageLayout from "@/app/components/PageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ParadasAtivasPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Paradas</p>
          <h1 className="text-3xl font-semibold">Paradas Ativas</h1>
          <p className="text-muted-foreground">Página inicial para listar e gerenciar paradas ativas.</p>
        </header>
      </div>
    </PageLayout>
  );
}

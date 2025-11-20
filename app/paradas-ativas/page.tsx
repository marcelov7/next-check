import PageLayout from "@/app/components/PageLayout";
import ParadasAtivas from "@/app/components/ParadasAtivas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ParadasAtivasPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl">
        <header className="space-y-2 mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Paradas</p>
          <h1 className="text-3xl font-semibold">Paradas Ativas</h1>
          <p className="text-muted-foreground">Gerencie as paradas que estão em andamento na planta.</p>
        </header>
        
        <ParadasAtivas />
      </div>
    </PageLayout>
  );
}

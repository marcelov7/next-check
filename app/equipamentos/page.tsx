import PageLayout from "@/app/components/PageLayout";
import EquipamentoCrud from "@/app/components/EquipamentoCrud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function EquipamentosPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2 mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Cadastro</p>
          <h1 className="text-3xl font-semibold">Equipamentos</h1>
          <p className="text-muted-foreground">Página para gerenciamento de equipamentos.</p>
        </header>

        <EquipamentoCrud />
      </div>
    </PageLayout>
  );
}

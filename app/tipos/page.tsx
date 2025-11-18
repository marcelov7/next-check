import PageLayout from "@/app/components/PageLayout";
import TiposCrud from "@/app/components/TiposCrud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function TiposPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2 mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Configurações</p>
          <h1 className="text-3xl font-semibold">Tipos de Equipamento</h1>
          <p className="text-muted-foreground">Gerencie os tipos de equipamentos do sistema.</p>
        </header>
        <TiposCrud />
      </div>
    </PageLayout>
  );
}

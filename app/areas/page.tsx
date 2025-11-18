import PageLayout from "@/app/components/PageLayout";
import AreaCrud from "@/app/components/AreaCrud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AreasPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2 mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Cadastro</p>
          <h1 className="text-3xl font-semibold">Áreas</h1>
          <p className="text-muted-foreground">Página para gerenciamento de áreas.</p>
        </header>

        <AreaCrud />
      </div>
    </PageLayout>
  );
}

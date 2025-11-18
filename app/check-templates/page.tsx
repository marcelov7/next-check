import PageLayout from "@/app/components/PageLayout";
import CheckTemplateCrud from "@/app/components/CheckTemplateCrud";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CheckTemplatesPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <header className="space-y-2 mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Configurações</p>
          <h1 className="text-3xl font-semibold">Check Templates</h1>
          <p className="text-muted-foreground">Modelos de verificação por tipo de equipamento.</p>
        </header>
        <CheckTemplateCrud />
      </div>
    </PageLayout>
  );
}

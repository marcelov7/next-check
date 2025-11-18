import PageLayout from "@/app/components/PageLayout";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function UsuariosPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Admin</p>
          <h1 className="text-3xl font-semibold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Criação, edição e permissões de usuários.</p>
        </header>
      </div>
    </PageLayout>
  );
}

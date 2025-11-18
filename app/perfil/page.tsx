import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PerfilPage() {
  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-10">
      <div className="mx-auto flex flex-col md:flex-row max-w-7xl gap-6">
        <Sidebar />
        <div className="min-h-[100dvh] flex-1 pt-14 md:pt-10">
          <header className="mx-auto max-w-5xl space-y-2">
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Conta</p>
            <h1 className="text-3xl font-semibold">Meu Perfil</h1>
            <p className="text-muted-foreground">Configurações do usuário e preferências.</p>
          </header>
        </div>
      </div>
    </main>
  );
}

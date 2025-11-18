import Sidebar from "@/app/components/Sidebar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PerfilPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="md:ml-64">
        <div className="min-h-[100dvh] px-4 py-10 pt-14 md:pt-10">
          <div className="mx-auto max-w-5xl">
            <header className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-primary">Conta</p>
              <h1 className="text-3xl font-semibold">Meu Perfil</h1>
              <p className="text-muted-foreground">Configurações do usuário e preferências.</p>
            </header>
          </div>
        </div>
      </div>
    </main>
  );
}

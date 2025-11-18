import PageLayout from "@/app/components/PageLayout";
import ProfileForm from '@/app/components/ProfileForm';

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PerfilPage() {
  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Conta</p>
          <h1 className="text-3xl font-semibold">Meu Perfil</h1>
          <p className="text-muted-foreground">Configurações do usuário e preferências.</p>
        </header>
      </div>
      <div className="mt-8">
        <ProfileForm />
      </div>
    </PageLayout>
  );
}

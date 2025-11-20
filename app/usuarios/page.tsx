import PageLayout from "@/app/components/PageLayout";
import UsersAdmin from "@/app/components/UsersAdmin";
import { getServerSession } from "next-auth";
import authOptions from "@/lib/nextAuthOptions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function UsuariosPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) redirect('/login');
  const s: any = session;
  const me = await prisma.user.findUnique({ where: { id: Number(s.user?.id) }, select: { role: true } });
  // allow both superadmin and admin to access the users management page
  if (!(me?.role === 'superadmin' || me?.role === 'admin')) redirect('/');

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl">
        <header className="space-y-2 mb-6">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Admin</p>
          <h1 className="text-3xl font-semibold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Criação, edição e permissões de usuários.</p>
        </header>
        <UsersAdmin />
      </div>
    </PageLayout>
  );
}

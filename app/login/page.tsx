"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("admin@checklist.local");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Credenciais inválidas. Verifique e tente novamente.");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-md w-full space-y-6 rounded-2xl border border-border bg-card/80 p-8 shadow-2xl backdrop-blur">
        <div>
          <h1 className="text-3xl font-semibold">Entrar no Sistema</h1>
          <p className="text-muted-foreground mt-1">Acesse os checklists e dashboards.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm text-muted-foreground">E-mail ou username</span>
            <div className="mt-1" />
            <Input
              type="text"
              value={identifier}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIdentifier(e.target.value)}
              required
              placeholder="seu@email.com ou username"
            />
          </label>

          <label className="block">
            <span className="text-sm text-muted-foreground">Senha</span>
            <div className="mt-1" />
            <Input
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </label>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Validando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}

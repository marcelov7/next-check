"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Me = { id: number; name: string; email: string; username?: string | null; image?: string | null } | null;

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UserHeader({ compact = false }: { compact?: boolean }) {
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/me");
        if (!mounted) return;
        if (res.ok) setMe(await res.json());
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const avatar = me?.image;
  const name = me?.name ?? me?.username ?? "Usuário";

  return (
    <div className={`flex items-center gap-3 ${compact ? "text-sm" : "text-base"}`}>
      {!compact && <div className="mr-2 hidden md:block text-sm text-muted-foreground">{name}</div>}
      <Link href="/perfil" className="rounded-full overflow-hidden border border-border bg-muted/30">
        {avatar ? (
          <img src={avatar} alt="avatar" className="h-9 w-9 object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center bg-primary/10 text-primary font-medium">{initials(name)}</div>
        )}
      </Link>
    </div>
  );
}

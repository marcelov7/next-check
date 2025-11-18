"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/app/components/ui/sheet";
import {
  Menu,
  LayoutDashboard,
  PlayCircle,
  History,
  Building2,
  Wrench,
  Tag,
  Clipboard,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import ThemeToggle from "@/app/components/ThemeToggle";
import { useSidebar } from "@/app/components/SidebarContext";

type NavItem = { href: string; label: string; icon: React.ElementType };

const primaryNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/paradas-ativas", label: "Paradas Ativas", icon: PlayCircle },
  { href: "/historico", label: "Histórico", icon: History },
  { href: "/areas", label: "Áreas", icon: Building2 },
  { href: "/equipamentos", label: "Equipamentos", icon: Wrench },
  { href: "/tipos", label: "Tipos", icon: Tag },
  { href: "/check-templates", label: "Check Templates", icon: Clipboard },
];

const secondaryNav: NavItem[] = [
  { href: "/perfil", label: "Meu Perfil", icon: User },
  { href: "/usuarios", label: "Gerenciar Usuários", icon: Users },
];

function SidebarContent({ onNavigate, isCollapsed }: { onNavigate?: () => void; isCollapsed?: boolean }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col p-4">
      {/* Branding */}
      {!isCollapsed ? (
        <div className="mb-4 flex items-center justify-between gap-2 px-2">
          <Link href="/dashboard" className="block text-sm font-semibold text-foreground" onClick={onNavigate}>
            Sistema de Checklist de Paradas
          </Link>
          <ThemeToggle />
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-center px-2">
          <ThemeToggle />
        </div>
      )}

      {/* Section title */}
      {!isCollapsed && (
        <div className="mb-2 flex items-center gap-2 px-2 text-muted-foreground">
          <span className="text-base">▣</span>
          <span className="text-sm font-medium">Menu Principal</span>
        </div>
      )}

      {/* Primary navigation */}
      <nav className="space-y-1">
        {primaryNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="my-4 w-full border-t border-border" />

      {/* Secondary navigation */}
      <nav className="space-y-1">
        {secondaryNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-primary/15 text-primary ring-1 ring-inset ring-primary/30"
                  : "text-muted-foreground hover:bg-card/80 hover:text-foreground"
              } ${isCollapsed ? "justify-center" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? "Sair" : undefined}
          className={`w-full rounded-xl border border-border px-3 py-2 text-sm text-muted-foreground hover:border-border hover:text-foreground flex items-center gap-2 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`app-sidebar fixed left-0 top-0 hidden h-screen shrink-0 overflow-y-auto border-r border-border bg-card md:block transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
        style={{ backgroundColor: "hsl(var(--card))" }}
      >
        <SidebarContent isCollapsed={isCollapsed} />
        
        {/* Toggle button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 z-50 rounded-full border border-border bg-card p-1 shadow-md hover:bg-card/80"
          aria-label={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

  {/* Mobile top bar */}
      <div
        className="app-sidebar sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4 md:hidden"
        style={{ backgroundColor: "hsl(var(--card))" }}
      >
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" aria-label="Abrir menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" title="Menu" className="w-72 p-0 app-sidebar">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="text-sm font-semibold text-foreground">Checklist</Link>
        <ThemeToggle />
      </div>
    </>
  );
}

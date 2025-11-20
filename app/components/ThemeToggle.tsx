"use client";

import { Button } from "@/app/components/ui/button";
import { Moon, Sun } from "lucide-react";
import * as React from "react";
import { useTheme } from "@/app/components/theme-provider";

export default function ThemeToggle({ className, variant = "outline" }: { className?: string; variant?: "outline" | "ghost" | "default" | "secondary" }) {
  const { toggle } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <Button
      variant={variant}
      size="icon"
      aria-label="Alternar tema"
      onClick={toggle}
      title="Alternar tema"
      className={className}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}

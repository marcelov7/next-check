"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("dark");

  // set initial theme from localStorage or system
  React.useEffect(() => {
    const stored = (typeof window !== "undefined" && (localStorage.getItem("theme") as Theme | null)) || null;
    let initial: Theme = "dark";
    if (stored === "light" || stored === "dark") {
      initial = stored;
    } else if (typeof window !== "undefined") {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = prefersDark ? "dark" : "light";
    }
    setTheme(initial);
  }, []);

  // apply to <html> class and persist
  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement; // <html>
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (ctx) return ctx;
  // Fallback seguro fora do provider (ex: render server antes do hydration)
  return {
    theme: "dark" as Theme,
    setTheme: () => {},
    toggle: () => {},
  };
}

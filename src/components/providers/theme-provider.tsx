"use client";

import { createContext, startTransition, useContext, useEffect, useMemo, useState } from "react";

export type ThemeId =
  | "minimal"
  | "classic"
  | "elegant"
  | "tech"
  | "forest"
  | "dusk"
  | "sunrise";

type ThemeDefinition = {
  id: ThemeId;
  label: string;
};

const THEME_DEFINITIONS: ThemeDefinition[] = [
  { id: "minimal", label: "极简 Minimal" },
  { id: "classic", label: "经典 Classic" },
  { id: "elegant", label: "典雅 Elegant" },
  { id: "tech", label: "科技 Tech" },
  { id: "forest", label: "松青 Forest" },
  { id: "dusk", label: "暮光 Dusk" },
  { id: "sunrise", label: "晨曦 Sunrise" },
];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (next: ThemeId) => void;
  themes: ThemeDefinition[];
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(id: ThemeId) {
  if (typeof document === "undefined") {
    return;
  }

  const body = document.body;
  THEME_DEFINITIONS.forEach((theme) => {
    body.classList.remove(`theme-${theme.id}`);
  });

  body.classList.add(`theme-${id}`);
  document.documentElement.setAttribute("data-theme", id);
}

const STORAGE_KEY = "site-theme";
const DEFAULT_THEME: ThemeId = "minimal";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const initial = stored && THEME_DEFINITIONS.some((item) => item.id === stored) ? stored : DEFAULT_THEME;
    startTransition(() => {
      setThemeState(initial);
      setReady(true);
    });
    applyTheme(initial);
  }, []);

  useEffect(() => {
    if (!ready) return;
    applyTheme(theme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, theme);
    }
  }, [theme, ready]);

  const setTheme = (next: ThemeId) => {
    setThemeState(next);
  };

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, themes: THEME_DEFINITIONS, ready }), [theme, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}



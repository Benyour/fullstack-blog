"use client";

import { type ThemeId, useTheme } from "@/components/providers/theme-provider";

export function ThemeSwitcher() {
  const { theme, setTheme, themes, ready } = useTheme();

  return (
    <label className="relative inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)]">
      <span className="hidden sm:inline">主题</span>
      <select
        className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm transition focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring,rgba(37,99,235,0.35))] dark:text-[var(--text-primary)]"
        value={theme}
        onChange={(event) => setTheme(event.target.value as ThemeId)}
        disabled={!ready}
      >
        {themes.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}



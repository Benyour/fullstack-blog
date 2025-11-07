import Link from "next/link";

import { Container } from "@/components/layout/container";

const links = [
  { href: "https://github.com", label: "GitHub" },
  { href: "https://www.zhihu.com/", label: "知乎" },
  { href: "https://twitter.com/", label: "X" },
];

export function SiteFooter() {
  return (
    <footer className="surface-footer border-t border-[var(--surface-border)] py-12 text-sm text-[var(--text-secondary)]">
      <Container className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">Zhang Yabin</p>
          <p className="mt-3 text-lg font-medium text-[var(--text-primary)]">前端开发者 · 创作者</p>
          <p className="mt-2 max-w-md text-xs leading-relaxed text-[var(--text-secondary)]">
            专注 Next.js、React、可观测性与前端工程化，探索设计与体验的边界。
          </p>
          <p className="mt-3 text-xs text-[var(--text-secondary)]">© {new Date().getFullYear()} Zhang Yabin. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[var(--surface-border)] px-4 py-1.5 text-[var(--text-secondary)] transition hover:border-[var(--surface-border-strong)] hover:text-[var(--text-primary)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}


import Link from "next/link";

import type { Session } from "next-auth";

import { Container } from "@/components/layout/container";
import { NavigationLinks } from "@/components/layout/navigation-links";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";

type SiteHeaderProps = {
  session: Session | null;
};

const navigation = [
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于我" },
  { href: "/uses", label: "常用工具" },
  { href: "/#contact", label: "联系" },
];

export function SiteHeader({ session }: SiteHeaderProps) {
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="surface-header sticky top-0 z-40">
      <Container className="flex h-16 items-center justify-between gap-5">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--text-primary)] transition hover:text-[var(--accent)]"
        >
          张亚斌 · 前端开发者
        </Link>

        <nav className="hidden items-center md:flex">
          <NavigationLinks items={navigation} />
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {isAdmin && (
            <Link
              href="/dashboard"
              className="hidden rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-1.5 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--surface-border-strong)] hover:text-[var(--text-primary)] md:inline-flex"
            >
              控制台
            </Link>
          )}

          {session?.user ? (
            <form action="/api/auth/signout" method="post">
              <button className="btn-accent" type="submit">
                退出
              </button>
            </form>
          ) : (
            <Link href="/login" className="btn-accent">
              登录
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}


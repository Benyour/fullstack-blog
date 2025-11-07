import Link from "next/link";

import type { Session } from "next-auth";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  session: Session | null;
};

const navigation = [
  { href: "/blog", label: "博客" },
  { href: "/about", label: "关于我" },
  { href: "/uses", label: "常用工具" },
  { href: "#contact", label: "联系" },
];

export function SiteHeader({ session }: SiteHeaderProps) {
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/70">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          张亚斌 · 前端开发者
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-slate-900 dark:hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              href="/dashboard"
              className={cn(
                "hidden rounded-full border border-slate-900/10 px-4 py-1.5 text-sm font-medium text-slate-800 transition hover:border-slate-900/30 hover:text-slate-950 dark:border-white/15 dark:text-white dark:hover:border-white/30 md:inline-flex",
              )}
            >
              控制台
            </Link>
          )}

          {session?.user ? (
            <form action="/api/auth/signout" method="post">
              <button
                className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
                type="submit"
              >
                退出
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200"
            >
              登录
            </Link>
          )}
        </div>
      </Container>
    </header>
  );
}


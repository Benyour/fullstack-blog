"use client";

import { useState } from "react";
import Link from "next/link";
import type { Session } from "next-auth";

import { NavigationLinks } from "@/components/layout/navigation-links";
import { ThemeSwitcher } from "@/components/layout/theme-switcher";
import { cn } from "@/lib/utils";

const menuButtonBase = "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]";

type MobileNavProps = {
  items: { href: string; label: string }[];
  session: Session | null;
  isAdmin: boolean;
};

export function MobileNav({ items, session, isAdmin }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <>
      <button
        type="button"
        className={menuButtonBase}
        aria-label="打开导航菜单"
        onClick={() => setOpen(true)}
      >
        <span className="sr-only">打开导航菜单</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button className="absolute inset-0 bg-black/40" aria-label="关闭导航菜单" onClick={close} />
          <div className="absolute inset-x-4 top-16 rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-background)] p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[var(--text-primary)]">导航</p>
              <button type="button" className={menuButtonBase} aria-label="关闭导航菜单" onClick={close}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm">
              <NavigationLinks items={items} className="flex-col items-stretch gap-2" onNavigate={close} />

              <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-3">
                <ThemeSwitcher />
              </div>

              <div className="space-y-3">
                {isAdmin && (
                  <Link
                    href="/dashboard"
                    className="btn-outline flex w-full justify-center px-4 py-2 text-sm font-medium"
                    onClick={close}
                  >
                    控制台
                  </Link>
                )}

                {session?.user ? (
                  <form action="/api/auth/signout" method="post" className="w-full">
                    <button type="submit" className="btn-accent w-full justify-center px-4 py-2 text-sm font-semibold">
                      退出登录
                    </button>
                  </form>
                ) : (
                  <Link
                    href="/login"
                    className="btn-accent flex w-full justify-center px-4 py-2 text-sm font-semibold"
                    onClick={close}
                  >
                    登录
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

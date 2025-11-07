import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getAuthSession } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "概览" },
  { href: "/dashboard/posts", label: "文章管理" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="py-12">
      <Container className="grid gap-10 md:grid-cols-[230px,1fr]">
        <aside className="panel text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
            控制台
          </p>
          <nav className="mt-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-2 font-medium text-[var(--text-secondary)] transition hover:border-[var(--surface-border-strong)] hover:text-[var(--text-primary)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="panel min-h-[60vh] p-8">
          {children}
        </div>
      </Container>
    </div>
  );
}


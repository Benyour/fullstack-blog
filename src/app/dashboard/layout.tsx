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
      <Container className="grid gap-10 md:grid-cols-[220px,1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            控制台
          </p>
          <nav className="mt-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-h-[60vh] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {children}
        </div>
      </Container>
    </div>
  );
}


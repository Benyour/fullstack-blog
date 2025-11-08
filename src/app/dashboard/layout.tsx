import Link from "next/link";
import { redirect } from "next/navigation";

import { Container } from "@/components/layout/container";
import { getAuthSession } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "概览" },
  { href: "/dashboard/posts", label: "文章管理" },
  { href: "/dashboard/tags", label: "标签管理" },
  { href: "/dashboard/profile", label: "站点资料" },
  { href: "/dashboard/messages", label: "留言中心" },
  { href: "/dashboard/analytics", label: "数据洞察" },
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
    <div className="py-6 sm:py-8 md:py-10">
      <div className="px-4 sm:px-6 lg:px-0">
        <Container className="px-0 lg:px-8">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[240px,minmax(0,1fr)] lg:gap-10">
            <aside className="hidden lg:block">
              <div className="panel rounded-3xl p-6 text-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                  控制台
                </p>
                <nav className="mt-5 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="btn-outline flex w-full justify-start px-4 py-2.5 text-sm font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="flex flex-col gap-6">
              <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 border-b border-[var(--surface-border)] bg-[var(--surface-background)]/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
                <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                  导航
                </span>
                <nav className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="btn-outline whitespace-nowrap px-3 py-1.5 text-xs font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="lg:hidden -mx-4 space-y-6 px-4 sm:-mx-6 sm:space-y-7 sm:px-6">
                <div className="space-y-6 md:space-y-8">{children}</div>
              </div>

              <div className="hidden lg:block">
                <div className="panel min-h-[60vh] rounded-3xl p-6 md:p-8">
                  <div className="space-y-6 md:space-y-8">{children}</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}


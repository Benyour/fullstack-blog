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
    <div className="py-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[260px,minmax(0,1fr)]">
          <aside className="panel h-fit rounded-3xl p-6 text-sm">
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
          </aside>
          <div className="panel min-h-[60vh] rounded-3xl p-8 md:p-10">
            <div className="space-y-8">{children}</div>
          </div>
        </div>
      </Container>
    </div>
  );
}


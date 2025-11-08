import { ContactStatus, SubscriptionStatus } from "@prisma/client";
import { subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "数据洞察",
};

export default async function DashboardAnalyticsPage() {
  const now = new Date();
  const last7Days = subDays(now, 6);
  const last30Days = subDays(now, 29);

  const [viewsAggregate, viewsLast7Days, pageGroup, posts, subscribers, newSubscribers, pendingMessages, pendingComments] =
    await Promise.all([
      prisma.pageView.aggregate({ _sum: { views: true } }),
      prisma.pageView.findMany({ where: { date: { gte: last7Days } }, orderBy: { date: "asc" } }),
      prisma.pageView.groupBy({
        by: ["slug"],
        _sum: { views: true },
        orderBy: { _sum: { views: "desc" } },
        take: 5,
      }),
      prisma.post.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 5,
        include: {
          _count: {
            select: {
              comments: { where: { approved: true } },
              reactions: true,
            },
          },
        },
      }),
      prisma.newsletterSubscription.count({ where: { status: SubscriptionStatus.ACTIVE } }),
      prisma.newsletterSubscription.count({
        where: {
          status: SubscriptionStatus.ACTIVE,
          createdAt: { gte: last30Days },
        },
      }),
      prisma.contactMessage.count({
        where: { status: { in: [ContactStatus.NEW, ContactStatus.IN_PROGRESS] } },
      }),
      prisma.comment.count({ where: { approved: false } }),
    ]);

  const dailyViews = Array.from({ length: 7 }).map((_, index) => {
    const date = subDays(now, 6 - index);
    const record = viewsLast7Days.find(
      (item) => item.date.toISOString().slice(0, 10) === date.toISOString().slice(0, 10),
    );
    return {
      date,
      views: record?.views ?? 0,
    };
  });

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          数据洞察
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">站点表现总览</h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
          关注内容表现、用户增长与互动情况，辅助制订内容策略。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="总浏览量" value={viewsAggregate._sum.views ?? 0} />
        <StatCard title="订阅用户" value={subscribers} helper={`近 30 天 +${newSubscribers}`} />
        <StatCard title="待回复留言" value={pendingMessages} tone="warning" />
        <StatCard title="待审核评论" value={pendingComments} tone="info" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-3 rounded-2xl border border-[var(--surface-border)] p-5 sm:space-y-4 sm:p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">近 7 日访客趋势</h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            {dailyViews.map((item) => (
              <li key={item.date.toISOString()} className="flex items-center justify-between">
                <span>{item.date.toLocaleDateString("zh-CN", { month: "numeric", day: "numeric" })}</span>
                <span className="font-medium text-[var(--text-primary)]">{item.views}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 rounded-2xl border border-[var(--surface-border)] p-5 sm:space-y-4 sm:p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)]">热门访问页面</h2>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {pageGroup.map((entry) => (
              <li key={entry.slug} className="flex items-center justify-between">
                <span className="truncate">{entry.slug}</span>
                <span className="font-medium text-[var(--text-primary)]">{entry._sum.views ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--surface-border)] p-5 sm:space-y-4 sm:p-6">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">近期发布表现</h2>
        <div className="grid gap-3 text-sm text-[var(--text-secondary)]">
          {posts.map((post) => {
            const slugPath = `/blog/${post.slug}`;
            const views = pageGroup.find((entry) => entry.slug === slugPath)?._sum.views ?? 0;
            return (
              <div
                key={post.id}
                className="grid gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 md:grid-cols-[minmax(0,1fr),auto]"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{post.title}</p>
                  <p className="text-xs">{post.summary}</p>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-3 text-xs">
                  <MetricBadge label="阅读" value={views} />
                  <MetricBadge label="评论" value={post._count.comments} />
                  <MetricBadge label="点赞" value={post._count.reactions} />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, helper, tone }: { title: string; value: number; helper?: string; tone?: "warning" | "info" }) {
  const toneClass =
    tone === "warning"
      ? "from-amber-400/20 via-orange-400/20 to-rose-400/20"
      : tone === "info"
      ? "from-sky-400/20 via-indigo-400/20 to-violet-400/20"
      : "from-emerald-400/20 via-teal-400/20 to-cyan-400/20";

  return (
    <div className={`rounded-2xl border border-[var(--surface-border)] bg-gradient-to-br ${toneClass} p-5 sm:p-6`}>
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">{title}</p>
      <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
      {helper && <p className="mt-2 text-xs text-[var(--text-secondary)]">{helper}</p>}
    </div>
  );
}

function MetricBadge({ label, value }: { label: string; value: number }) {
  return (
    <span className="rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-1 font-medium text-[var(--text-secondary)]">
      {label} · {value}
    </span>
  );
}


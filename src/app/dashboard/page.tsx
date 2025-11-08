import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "控制台概览",
};

export default async function DashboardHomePage() {
  const [publishedCount, draftCount, tagCount, messageCount, subscriberCount, pendingMessages, pendingComments, totalViews] =
    await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.tag.count(),
      prisma.contactMessage.count(),
      prisma.newsletterSubscription.count({ where: { status: "ACTIVE" } }),
      prisma.contactMessage.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
      prisma.comment.count({ where: { approved: false } }),
      prisma.pageView.aggregate({ _sum: { views: true } }),
  ]);

  const cards = [
    { title: "已发布文章", value: publishedCount, accent: "from-sky-400 via-indigo-500 to-fuchsia-500" },
    { title: "草稿箱", value: draftCount, accent: "from-amber-400 via-rose-400 to-pink-500" },
    { title: "标签数量", value: tagCount, accent: "from-emerald-400 via-teal-400 to-cyan-400" },
    { title: "总浏览量", value: totalViews._sum.views ?? 0, accent: "from-purple-400 via-indigo-400 to-blue-500" },
  ] as const;

  const secondaryStats = [
    { label: "订阅用户", value: subscriberCount },
    { label: "待处理留言", value: pendingMessages },
    { label: "待审核评论", value: pendingComments },
    { label: "历史留言", value: messageCount },
  ];

  const latestMessages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const latestPosts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      updatedAt: true,
    },
  });

  return (
    <div className="flex h-full flex-col gap-8">
      <header>
        <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
          控制台概览
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">欢迎回来</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          这里汇总了当前站点的运营数据，你可以快速了解内容产出、用户增长与互动情况。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="panel-muted p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
              {card.title}
            </p>
            <p className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="space-y-4 rounded-2xl border border-[var(--surface-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">最近更新</h2>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {latestPosts.map((post) => (
              <li key={post.id} className="flex items-center justify-between gap-4 rounded-xl bg-[var(--surface-muted)] p-4">
                <div>
                  <p className="font-medium text-[var(--text-primary)]">{post.title}</p>
                  <p className="text-xs">
                    {post.published ? "已发布" : "草稿"} · {post.updatedAt.toLocaleString("zh-CN")}
                  </p>
                </div>
                <a
                  href={`/dashboard/posts/${post.id}`}
                  className="rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  编辑
                </a>
              </li>
            ))}
            {latestPosts.length === 0 && <p className="text-sm">暂无文章，请先创建内容。</p>}
          </ul>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--surface-border)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">运营待办</h2>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            {secondaryStats.map((stat) => (
              <li key={stat.label} className="flex items-center justify-between rounded-xl bg-[var(--surface-muted)] px-4 py-2">
                <span>{stat.label}</span>
                <span className="font-semibold text-[var(--text-primary)]">{stat.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--surface-border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">最新留言</h2>
        <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
          {latestMessages.map((message) => (
            <div key={message.id} className="rounded-xl bg-[var(--surface-muted)] p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[var(--text-primary)]">{message.name}</span>
                <span>·</span>
                <a href={`mailto:${message.email}`} className="underline decoration-dotted underline-offset-4">
                  {message.email}
                </a>
                <span>·</span>
                <span>{message.createdAt.toLocaleString("zh-CN")}</span>
              </div>
              <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm">{message.message}</p>
            </div>
          ))}
          {latestMessages.length === 0 && <p className="text-sm">还没有收到留言。</p>}
        </div>
      </section>
    </div>
  );
}


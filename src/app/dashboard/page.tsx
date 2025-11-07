import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "控制台概览",
};

export default async function DashboardHomePage() {
  const [publishedCount, draftCount, tagCount, messageCount] = await Promise.all([
    prisma.post.count({ where: { published: true } }),
    prisma.post.count({ where: { published: false } }),
    prisma.tag.count(),
    prisma.contactMessage.count(),
  ]);

  const cards = [
    { title: "已发布文章", value: publishedCount, accent: "from-sky-400 via-indigo-500 to-fuchsia-500" },
    { title: "草稿", value: draftCount, accent: "from-amber-400 via-rose-400 to-pink-500" },
    { title: "标签", value: tagCount, accent: "from-emerald-400 via-teal-400 to-cyan-400" },
    { title: "收到的留言", value: messageCount, accent: "from-purple-400 via-indigo-400 to-blue-500" },
  ] as const;

  return (
    <div className="flex h-full flex-col gap-8">
      <header>
        <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
          控制台概览
        </span>
        <h1 className="mt-4 text-3xl font-semibold text-[var(--text-primary)]">欢迎回来</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          这里是站点的运营面板，你可以管理文章、标签以及查看访客留言。
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

      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">快捷入口</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          你可以在左侧导航中进入文章管理，新增或编辑内容。更多功能将在后续迭代中补充。
        </p>
      </section>
    </div>
  );
}


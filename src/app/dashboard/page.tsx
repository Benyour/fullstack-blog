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
    { title: "已发布文章", value: publishedCount },
    { title: "草稿", value: draftCount },
    { title: "标签", value: tagCount },
    { title: "收到的留言", value: messageCount },
  ];

  return (
    <div className="flex h-full flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">欢迎回来</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          这里是站点的运营面板，你可以管理文章、标签以及查看访客留言。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {card.title}
            </p>
            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{card.value}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">快捷入口</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">
          你可以在左侧导航中进入文章管理，新增或编辑内容。更多功能将在后续迭代中补充。
        </p>
      </section>
    </div>
  );
}


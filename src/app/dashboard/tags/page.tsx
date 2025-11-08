import { prisma } from "@/lib/prisma";
import { TagManager } from "@/components/dashboard/tag-manager";

export const metadata = {
  title: "标签管理",
};

export default async function DashboardTagsPage() {
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          标签管理
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">维护站点标签</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          创建、重命名或删除标签，帮助读者更快找到感兴趣的内容。
        </p>
      </header>

      <TagManager
        initialTags={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          postCount: tag._count.posts,
        }))}
      />
    </div>
  );
}


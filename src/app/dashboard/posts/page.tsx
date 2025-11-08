import Link from "next/link";

import { DeletePostButton } from "@/components/dashboard/delete-post-button";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "文章管理",
};

export default async function DashboardPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      tags: { include: { tag: true } },
      _count: {
        select: {
          reactions: true,
          comments: {
            where: { approved: true },
          },
        },
      },
    },
  });

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
            内容中心
          </span>
          <h1 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">文章管理</h1>
          <p className="text-sm text-[var(--text-secondary)]">
            创建、编辑和删除文章，支持 Markdown / MDX 格式。
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="btn-accent inline-flex items-center px-5 py-2 text-sm font-semibold"
        >
          新建文章
        </Link>
      </header>

      <section className="panel flex-1 overflow-hidden p-0">
        <table className="w-full table-fixed text-left text-sm text-[var(--text-secondary)]">
          <thead className="bg-[var(--surface-muted)] text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            <tr>
              <th className="p-4 font-semibold text-[var(--text-secondary)]">标题</th>
              <th className="w-24 p-4 font-semibold text-[var(--text-secondary)]">状态</th>
              <th className="w-32 p-4 font-semibold text-[var(--text-secondary)]">更新于</th>
              <th className="w-48 p-4 font-semibold text-[var(--text-secondary)]">标签</th>
              <th className="w-32 p-4 font-semibold text-[var(--text-secondary)]">互动</th>
              <th className="w-32 p-4 text-right font-semibold text-[var(--text-secondary)]">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-t border-[var(--surface-border)] transition hover:bg-[var(--surface-muted)]"
              >
                <td className="truncate p-4 font-medium text-[var(--text-primary)]">
                  <Link href={`/dashboard/posts/${post.id}`}>{post.title}</Link>
                </td>
                <td className="p-4">
                  {post.published ? (
                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-300/20 dark:text-emerald-200">
                      已发布
                    </span>
                  ) : post.scheduledAt ? (
                    <span className="rounded-full bg-sky-400/15 px-2 py-0.5 text-xs font-medium text-sky-600 dark:bg-sky-300/20 dark:text-sky-200">
                      已定时
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:bg-amber-300/20 dark:text-amber-200">
                      草稿
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs text-[var(--text-secondary)]">
                  {post.updatedAt.toLocaleDateString("zh-CN")}
                </td>
                <td className="truncate p-4 text-xs text-[var(--text-secondary)]">
                  {post.tags.map(({ tag }) => `#${tag.name}`).join("、") || "-"}
                </td>
                <td className="p-4 text-xs text-[var(--text-secondary)]">
                  👍 {post._count.reactions} · 💬 {post._count.comments}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/posts/${post.id}`}
                      className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--surface-border-strong)] hover:text-[var(--text-primary)]"
                    >
                      编辑
                    </Link>
                    <DeletePostButton id={post.id} />
                  </div>
                </td>
              </tr>
            ))}

            {posts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-sm text-[var(--text-secondary)]">
                  还没有文章，点击右上角的新建按钮开始创作。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}


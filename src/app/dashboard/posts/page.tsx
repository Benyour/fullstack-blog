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
    },
  });

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">文章管理</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300">
            创建、编辑和删除文章，支持 Markdown / MDX 格式。
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          新建文章
        </Link>
      </header>

      <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/60 dark:text-slate-400">
            <tr>
              <th className="p-4">标题</th>
              <th className="w-24 p-4">状态</th>
              <th className="w-32 p-4">更新于</th>
              <th className="w-48 p-4">标签</th>
              <th className="w-32 p-4 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr
                key={post.id}
                className="border-t border-slate-100 bg-white transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/80"
              >
                <td className="truncate p-4 font-medium text-slate-800 dark:text-slate-100">
                  <Link href={`/dashboard/posts/${post.id}`}>{post.title}</Link>
                </td>
                <td className="p-4">
                  {post.published ? (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/20 dark:text-green-200">
                      已发布
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      草稿
                    </span>
                  )}
                </td>
                <td className="p-4 text-xs text-slate-500 dark:text-slate-400">
                  {post.updatedAt.toLocaleDateString("zh-CN")}
                </td>
                <td className="truncate p-4 text-xs text-slate-500 dark:text-slate-400">
                  {post.tags.map(({ tag }) => `#${tag.name}`).join("、") || "-"}
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/posts/${post.id}`}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
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
                <td colSpan={5} className="p-8 text-center text-sm text-slate-500 dark:text-slate-300">
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


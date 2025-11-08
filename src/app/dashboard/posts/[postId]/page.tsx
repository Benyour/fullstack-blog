import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/dashboard/post-editor";

type EditPostPageProps = {
  params: Promise<{
    postId: string;
  }>;
};

export async function generateMetadata({ params }: EditPostPageProps) {
  const { postId } = await params;

  const post = await prisma.post.findFirst({
    where: {
      OR: [{ id: postId }, { slug: postId }],
    },
    select: {
      title: true,
    },
  });

  return {
    title: post ? `编辑 · ${post.title}` : "编辑文章",
  };
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { postId } = await params;

  const [post, tags] = await Promise.all([
    prisma.post.findFirst({
      where: {
        OR: [{ id: postId }, { slug: postId }],
      },
      include: {
        tags: {
          include: { tag: true },
        },
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: {
            editor: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">编辑文章</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">
          更新文章后会自动刷新前台内容。
        </p>
      </header>

      <PostEditor
        mode="edit"
        postId={post.id}
        initialData={{
          title: post.title,
          slug: post.slug,
          summary: post.summary,
          content: post.content,
          coverImage: post.coverImage,
          published: post.published,
          scheduledAt: post.scheduledAt?.toISOString() ?? null,
          tags: post.tags.map(({ tag }) => tag.slug),
        }}
        availableTags={tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
        }))}
      />

      <section className="rounded-2xl border border-[var(--surface-border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">版本历史</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          每次更新都会自动存档，方便回溯与比对。
        </p>
        <ul className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
          {post.revisions.map((revision) => (
            <li key={revision.id} className="rounded-xl bg-[var(--surface-muted)] px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[var(--text-primary)]">
                  {revision.editor?.name ?? "系统"}
                </span>
                <span>·</span>
                <span>{revision.createdAt.toLocaleString("zh-CN")}</span>
              </div>
              <p className="mt-1 text-xs">标题：{revision.title}</p>
              <p className="text-xs text-[var(--text-secondary)]">摘要：{revision.summary.slice(0, 80)}...</p>
            </li>
          ))}
          {post.revisions.length === 0 && <p className="text-sm">暂无修订记录。</p>}
        </ul>
      </section>
    </div>
  );
}


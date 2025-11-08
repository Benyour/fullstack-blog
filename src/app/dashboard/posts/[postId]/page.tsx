import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { PostEditor } from "@/components/dashboard/post-editor";
import { RevisionHistory } from "@/components/dashboard/revision-history";

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

      <RevisionHistory
        postId={post.id}
        currentVersion={{
          title: post.title,
          summary: post.summary,
          content: post.content,
          coverImage: post.coverImage ?? null,
          updatedAt: post.updatedAt.toISOString(),
        }}
        revisions={post.revisions.map((revision) => ({
          id: revision.id,
          title: revision.title,
          summary: revision.summary,
          content: revision.content,
          coverImage: revision.coverImage ?? null,
          createdAt: revision.createdAt.toISOString(),
          editor: revision.editor
            ? {
                id: revision.editor.id,
                name: revision.editor.name,
                email: revision.editor.email,
              }
            : null,
        }))}
      />
    </div>
  );
}


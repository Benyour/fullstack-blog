import { notFound } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import { Container } from "@/components/layout/container";
import { prisma } from "@/lib/prisma";
import { renderMDX } from "@/lib/mdx";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    select: {
      title: true,
      summary: true,
    },
  });

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      tags: {
        include: { tag: true },
      },
      author: {
        select: {
          name: true,
          profile: true,
        },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  const content = await renderMDX(post.content);

  return (
    <article className="py-16">
      <Container className="max-w-3xl text-[var(--text-secondary)]">
        <header>
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--text-secondary)] opacity-80">
            <time dateTime={post.publishedAt?.toISOString()}>
              {post.publishedAt
                ? format(post.publishedAt, "yyyy年MM月dd日", { locale: zhCN })
                : "草稿"}
            </time>
            <span>·</span>
            <span>{post.author?.name ?? "匿名作者"}</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
            {post.title}
          </h1>
          <p className="mt-4 text-base text-[var(--text-secondary)]">{post.summary}</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            {post.tags.map(({ tag }) => (
              <span key={tag.id} className="chip">
                #{tag.name}
              </span>
            ))}
          </div>
        </header>

        <div className="prose prose-theme mt-12 max-w-none">
          {content}
        </div>
      </Container>
    </article>
  );
}


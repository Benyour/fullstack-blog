import { notFound } from "next/navigation";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import { Container } from "@/components/layout/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { LikeButton } from "@/components/posts/like-button";
import { CommentsSection } from "@/components/posts/comments-section";
import { ShareButtons } from "@/components/posts/share-buttons";
import { TrackPostView } from "@/components/posts/track-post-view";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";
import { renderMDX } from "@/lib/mdx";
import { calculateReadingTime } from "@/lib/server-utils";

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
      comments: {
        where: { approved: true },
        orderBy: { createdAt: "asc" },
      },
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

  if (!post || !post.published) {
    notFound();
  }

  const [content, relatedPosts] = await Promise.all([
    renderMDX(post.content),
    prisma.post.findMany({
      where: {
        published: true,
        id: {
          not: post.id,
        },
        tags: {
          some: {
            tagId: {
              in: post.tags.map(({ tag }) => tag.id),
            },
          },
        },
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        content: true,
        publishedAt: true,
        tags: {
          select: {
            tag: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: {
              where: { approved: true },
            },
          },
        },
      },
    }),
  ]);

  const readingMinutes = calculateReadingTime(post.content);
  const pagePath = `/blog/${post.slug}`;

  return (
    <article className="py-16">
      <Container className="max-w-3xl space-y-12 text-[var(--text-secondary)]">
        <TrackPostView slug={pagePath} />

        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)] opacity-80">
            <time dateTime={post.publishedAt?.toISOString()}>
              {post.publishedAt ? format(post.publishedAt, "yyyy年MM月dd日", { locale: zhCN }) : "草稿"}
            </time>
            <span>·</span>
            <span>{post.author?.name ?? "匿名作者"}</span>
            <span>·</span>
            <span>{readingMinutes} 分钟阅读</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{post.title}</h1>
          <p className="text-base text-[var(--text-secondary)]">{post.summary}</p>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            {post.tags.map(({ tag }) => (
              <span key={tag.id} className="chip">
                #{tag.name}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
            <LikeButton postId={post.id} initialLikes={post._count.reactions} />
            <ShareButtons title={post.title} url={`${process.env.SITE_URL ?? "http://localhost:3000"}${pagePath}`} />
          </div>
        </header>

        <div className="prose prose-theme max-w-none">
          {content}
        </div>

        <aside className="space-y-4 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">订阅更新</h2>
          <p className="text-sm text-[var(--text-secondary)]">
            如果你也关注 Next.js、前端工程化与产品体验，订阅后即可第一时间收到新文章。
          </p>
          <NewsletterForm />
        </aside>

        {relatedPosts.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">延伸阅读</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {relatedPosts.map((item) => (
                <PostCard
                  key={item.id}
                  post={{
                    id: item.id,
                    title: item.title,
                    slug: item.slug,
                    summary: item.summary,
                    publishedAt: item.publishedAt,
                    tags: item.tags.map(({ tag }) => ({
                      id: tag.id,
                      name: tag.name,
                      slug: tag.slug,
                    })),
                    readingMinutes: calculateReadingTime(item.content),
                    stats: {
                      likes: item._count.reactions,
                      comments: item._count.comments,
                    },
                  }}
                  className="bg-[var(--surface-muted)]"
                />
              ))}
            </div>
          </section>
        )}

        <CommentsSection
          postId={post.id}
          initialComments={post.comments.map((comment) => ({
            id: comment.id,
            name: comment.name,
            email: comment.email,
            body: comment.body,
            createdAt: comment.createdAt.toISOString(),
          }))}
        />
      </Container>
    </article>
  );
}

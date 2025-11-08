import Link from "next/link";
import type { Prisma } from "@prisma/client";

import { Container } from "@/components/layout/container";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/server-utils";

type BlogPageProps = {
  searchParams: Promise<{
    tag?: string;
    q?: string;
    page?: string;
  }>;
};

export const metadata = {
  title: "博客",
  description: "记录在 Next.js、React、工程化与团队实践中的思考与经验。",
};

const PAGE_SIZE = 10;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const activeTagSlug = params.tag;
  const searchQuery = params.q?.trim() ?? "";
  const currentPage = Math.max(1, Number(params.page ?? "1"));

  await prisma.post.updateMany({
    where: {
      published: false,
      scheduledAt: { lte: new Date() },
    },
    data: {
      published: true,
      publishedAt: new Date(),
    },
  });

  const where: Prisma.PostWhereInput = {
    published: true,
    ...(activeTagSlug
      ? {
          tags: {
            some: {
              tag: {
                slug: activeTagSlug,
              },
            },
          },
        }
      : {}),
    ...(searchQuery
      ? {
          OR: [
            { title: { contains: searchQuery, mode: "insensitive" as const } },
            { summary: { contains: searchQuery, mode: "insensitive" as const } },
            { content: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [posts, totalCount, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      take: PAGE_SIZE,
      skip: (currentPage - 1) * PAGE_SIZE,
      orderBy: { publishedAt: "desc" },
      include: {
        tags: {
          include: {
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
    prisma.post.count({ where }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const activeTag = tags.find((item) => item.slug === activeTagSlug);

  return (
    <div className="py-12 md:py-16">
      <Container>
        <header className="max-w-2xl space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">技术笔记</h1>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            分享我在构建产品、打磨体验与优化工程体系中的方法论与实战总结。
            {activeTag ? ` 当前筛选：${activeTag.name}` : ""}
            {searchQuery ? ` 搜索关键词：“${searchQuery}”` : ""}
          </p>
          <form className="flex flex-col gap-3 text-sm md:flex-row md:items-center">
            <input
              name="q"
              defaultValue={searchQuery}
              placeholder="搜索标题、摘要或正文关键字..."
              className="input-field flex-1 rounded-full"
            />
            <button type="submit" className="btn-accent flex w-full justify-center px-5 py-2 text-sm font-semibold md:w-auto">
              搜索
            </button>
            {(searchQuery || activeTagSlug || currentPage > 1) && (
              <Link
                href="/blog"
                className="btn-outline flex w-full justify-center px-5 py-2 text-sm font-medium md:w-auto"
              >
                重置筛选
              </Link>
            )}
          </form>
        </header>

        <div className="mt-8 flex flex-wrap gap-2 text-sm sm:gap-3">
          <TagPill href="/blog" active={!activeTagSlug} label="全部" />
          {tags.map((item) => (
            <TagPill key={item.id} href={`/blog?tag=${item.slug}`} label={`#${item.name}`} active={item.slug === activeTagSlug} />
          ))}
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:mt-10 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                summary: post.summary,
                publishedAt: post.publishedAt,
                tags: post.tags.map(({ tag }) => ({
                  id: tag.id,
                  name: tag.name,
                  slug: tag.slug,
                })),
                readingMinutes: calculateReadingTime(post.content),
                stats: {
                  likes: post._count.reactions,
                  comments: post._count.comments,
                },
              }}
            />
          ))}

          {posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-[var(--surface-border)] p-6 text-center text-sm text-[var(--text-secondary)]">
              暂无匹配的文章，换个关键词试试。
            </p>
          )}
        </div>

        {totalPages > 1 && (
          <nav className="mt-10 flex flex-wrap items-center justify-center gap-2 text-sm text-[var(--text-secondary)]">
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              const query = new URLSearchParams();
              if (activeTagSlug) query.set("tag", activeTagSlug);
              if (searchQuery) query.set("q", searchQuery);
              query.set("page", page.toString());

              const href = `/blog?${query.toString()}`;
              const isActive = page === currentPage;

              return (
                <a
                  key={page}
                  href={href}
                  className={`rounded-full border px-3 py-1 ${
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                      : "border-[var(--surface-border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  }`}
                >
                  {page}
                </a>
              );
            })}
          </nav>
        )}

        <aside className="mt-12 space-y-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">订阅最新文章</h2>
          <p className="text-sm text-[var(--text-secondary)]">订阅后，每当有新内容发布会立即发送邮件通知你。</p>
          <NewsletterForm />
        </aside>
      </Container>
    </div>
  );
}

function TagPill({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1 transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
          : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      {label}
    </Link>
  );
}

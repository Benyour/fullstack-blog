import Link from "next/link";

import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";

type BlogPageProps = {
  searchParams: Promise<{
    tag?: string;
  }>;
};

export const metadata = {
  title: "博客",
  description: "记录在 Next.js、React、工程化与团队实践中的思考与经验。",
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { tag } = await searchParams;

  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
      where: {
        published: true,
        ...(tag
          ? {
              tags: {
                some: {
                  tag: {
                    slug: tag,
                  },
                },
              },
            }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const activeTag = tags.find((item) => item.slug === tag);

  return (
    <div className="py-16">
      <Container>
        <header className="max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">技术笔记</h1>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            分享我在构建产品、打磨体验与优化工程体系中的方法论与实战总结。
            {activeTag ? ` 当前筛选：${activeTag.name}` : ""}
          </p>
        </header>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <Link
            href="/blog"
            className={`rounded-full border px-4 py-1 transition ${
              !tag
                ? "border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-400 dark:bg-sky-500/20 dark:text-sky-200"
                : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-200"
            }`}
          >
            全部
          </Link>
          {tags.map((item) => (
            <Link
              key={item.id}
              href={`/blog?tag=${item.slug}`}
              className={`rounded-full border px-4 py-1 transition ${
                item.slug === tag
                  ? "border-sky-500 bg-sky-100 text-sky-700 dark:border-sky-400 dark:bg-sky-500/20 dark:text-sky-200"
                  : "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-200"
              }`}
            >
              #{item.name}
            </Link>
          ))}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={{
                id: post.id,
                title: post.title,
                slug: post.slug,
                summary: post.summary,
                publishedAt: post.publishedAt,
                tags: post.tags.map(({ tag: tagItem }) => ({
                  id: tagItem.id,
                  name: tagItem.name,
                  slug: tagItem.slug,
                })),
              }}
            />
          ))}

          {posts.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
              暂无文章，欢迎稍后再来。
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}


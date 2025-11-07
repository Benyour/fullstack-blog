import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/posts/post-card";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const [profile, posts, tags] = await Promise.all([
    prisma.profile.findFirst({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.post.findMany({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: {
        tags: { include: { tag: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const heroTitle = profile?.headline ?? "你好，我是张亚斌";
  const heroSubtitle =
    profile?.bio ??
    "专注于构建用户喜欢的 Web 产品，近期在研究 Next.js 全栈能力、工程化提效与团队知识沉淀。";

  return (
    <div className="space-y-24 pb-24 pt-12 md:pt-16">
      <section>
        <Container className="grid items-center gap-12 md:grid-cols-[1.2fr,1fr]">
          <div>
            <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-500/20 dark:text-sky-200">
              前端开发者 · 全栈探索者
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {heroTitle}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300">
              {heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm">
              <Link
                href="/blog"
                className="inline-flex items-center rounded-full bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-100"
              >
                阅读我的博客
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
              >
                了解更多 →
              </Link>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-300">当前状态</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">常驻城市</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">
                  {profile?.location ?? "北京"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">邮箱</dt>
                <dd className="font-medium text-slate-800 dark:text-slate-100">
                  <a href={`mailto:${profile?.user.email ?? "hello@example.com"}`}>
                    {profile?.user.email ?? "hello@example.com"}
                  </a>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500 dark:text-slate-400">技术兴趣</dt>
                <dd className="max-w-[220px] text-right text-slate-700 dark:text-slate-200">
                  Next.js · React · 前端工程化 · AIGC 工作流
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">最新文章</h2>
            <Link
              href="/blog"
              className="text-sm font-medium text-sky-600 transition hover:text-sky-700"
            >
              查看全部
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
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
                }}
              />
            ))}
            {posts.length === 0 && (
              <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500 dark:border-slate-700">
                博客还在建设中，敬请期待首篇文章。
              </p>
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <h2 className="text-2xl font-semibold">高频标签</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.slug}`}
                className="rounded-full border border-slate-300 px-4 py-1 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
              >
                #{tag.name}
              </Link>
            ))}
            {tags.length === 0 && (
              <p className="text-sm text-slate-500 dark:text-slate-300">
                标签数据暂未设置，可以在控制台中维护。
              </p>
            )}
          </div>
        </Container>
      </section>

      <section id="contact" className="bg-slate-50 py-16 dark:bg-slate-950">
        <Container className="grid items-start gap-10 md:grid-cols-[1.1fr,1fr]">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              一起打造优秀的体验
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              无论你正在规划下一版产品、优化工程体系，还是希望和我讨论技术方案，都欢迎发来信息。
              我会在 24 小时内回复你。
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <li>· 前端架构设计 / 性能优化</li>
              <li>· 多端一体化解决方案</li>
              <li>· 团队工程化与工具链咨询</li>
            </ul>
          </div>
          <ContactForm />
        </Container>
      </section>
    </div>
  );
}

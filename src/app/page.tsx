import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/posts/post-card";
import { ParticleField } from "@/components/ui/particle-field";
import { prisma } from "@/lib/prisma";
import { calculateReadingTime } from "@/lib/server-utils";

export default async function Home() {
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
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  const heroTitle = profile?.headline ?? "你好，我是张亚斌";
  const heroSubtitle =
    profile?.bio ??
    "专注于构建用户喜欢的 Web 产品，近期在研究 Next.js 全栈能力、工程化提效与团队知识沉淀。";

  return (
    <div className="space-y-16 pb-16 pt-10 md:space-y-24 md:pb-24 md:pt-16">
      <section className="relative overflow-hidden">
        <div className="hero-overlay absolute inset-0" />
        <ParticleField className="opacity-60" />
        <Container className="relative py-12 md:py-24">
          <div className="panel flex flex-col gap-10 px-6 py-10 md:gap-12 md:px-12 md:py-16 lg:grid lg:grid-cols-[1.1fr,0.9fr]">
            <div>
              <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                前端开发者 · 全栈探索者
              </span>
              <h1 className="mt-6 text-3xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-4xl md:mt-8 md:text-5xl lg:text-6xl">
                {heroTitle}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base md:mt-6 md:text-lg">
                {heroSubtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center md:mt-10">
                <Link href="/blog" className="btn-accent flex justify-center px-7 py-3 text-sm font-semibold">
                  探索最新文章
                </Link>
                <Link href="/about" className="btn-outline flex justify-center px-7 py-3 text-sm font-medium">
                  了解更多 →
                </Link>
              </div>
            </div>
            <div className="panel-muted h-full rounded-3xl p-6 sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)] sm:text-sm">
                当前状态
              </h2>
              <dl className="mt-6 space-y-5 text-sm sm:mt-8 sm:text-base">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <dt className="text-[var(--text-secondary)]">常驻城市</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{profile?.location ?? "北京"}</dd>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <dt className="text-[var(--text-secondary)]">邮箱</dt>
                  <dd className="font-medium text-[var(--text-primary)]">
                    <a href={`mailto:${profile?.user.email ?? "hello@example.com"}`} className="transition hover:text-[var(--accent)]">
                      {profile?.user.email ?? "hello@example.com"}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <dt className="text-[var(--text-secondary)]">技术兴趣</dt>
                  <dd className="text-[var(--text-primary)] sm:max-w-[240px] sm:text-right">
                    Next.js · React · 前端工程化 · AIGC 工作流
                  </dd>
                </div>
              </dl>
              <div className="mt-6 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-5 text-[0.65rem] uppercase tracking-[0.24em] text-[var(--text-secondary)] sm:mt-8 sm:text-xs">
                <p>Currently open for collaboration</p>
                <p className="mt-1 text-[var(--text-secondary)] normal-case">
                  接受技术咨询 · 远程合作 · 演讲分享
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section>
        <Container className="panel flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:gap-10 md:px-8 md:py-10">
          <div className="space-y-2 md:max-w-xl">
            <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
              Newsletter
            </span>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">订阅我的技术周报</h2>
            <p className="text-sm text-[var(--text-secondary)] sm:text-[0.95rem]">
              每周精选工程实践、产品体验与值得关注的工具，发送至你的邮箱。
            </p>
          </div>
          <div className="w-full max-w-md">
            <NewsletterForm />
          </div>
        </Container>
      </section>

      <section>
        <Container className="relative">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
                最新动态
              </span>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)] sm:text-3xl">最新文章</h2>
            </div>
            <Link href="/blog" className="btn-outline flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium">
              查看全部
              <span aria-hidden>↗</span>
            </Link>
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
              <p className="panel-muted text-sm text-[var(--text-secondary)]">
                博客还在建设中，敬请期待首篇文章。
              </p>
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="panel px-6 py-8 sm:px-8 sm:py-10">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">高频标签</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)] sm:mt-3">
              快速定位你感兴趣的主题，订阅 RSS 获取最新内容。
            </p>
            <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`} className="chip">
                  #{tag.name}
                </Link>
              ))}
              {tags.length === 0 && (
                <p className="text-sm text-[var(--text-secondary)]">
                  标签数据暂未设置，可以在控制台中维护。
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      <section id="contact" className="relative overflow-hidden py-16 md:py-20">
        <div className="hero-overlay absolute inset-0 opacity-60" />
        <Container className="relative grid items-start gap-8 md:grid-cols-[1.1fr,1fr] md:gap-10">
          <div className="panel px-6 py-8 sm:px-8 sm:py-10">
            <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
              联系我
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)] sm:mt-5 sm:text-3xl">
              一起打造优秀的体验
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-4">
              无论你正在规划下一版产品、优化工程体系，还是希望和我讨论技术方案，都欢迎发来信息。我会在 24 小时内回复你。
            </p>
            <ul className="mt-5 space-y-3 text-sm text-[var(--text-secondary)] sm:mt-6">
              <li>· 前端架构设计 / 性能优化</li>
              <li>· 多端一体化解决方案</li>
              <li>· 团队工程化与工具链咨询</li>
            </ul>
          </div>
          <div className="panel px-4 py-6 sm:px-6 sm:py-8">
            <ContactForm />
          </div>
        </Container>
      </section>
    </div>
  );
}

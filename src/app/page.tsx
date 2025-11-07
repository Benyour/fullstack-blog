import Link from "next/link";

import { ContactForm } from "@/components/forms/contact-form";
import { Container } from "@/components/layout/container";
import { PostCard } from "@/components/posts/post-card";
import { ParticleField } from "@/components/ui/particle-field";
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
      <section className="relative overflow-hidden">
        <div className="hero-overlay absolute inset-0" />
        <ParticleField className="opacity-60" />
        <Container className="relative py-16 md:py-24">
          <div className="panel grid gap-12 px-8 py-12 md:grid-cols-[1.1fr,0.9fr] md:px-12 md:py-16">
            <div>
              <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">
                前端开发者 · 全栈探索者
              </span>
              <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
                {heroTitle}
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                {heroSubtitle}
              </p>
              <div className="mt-10 flex flex-wrap gap-4 text-sm">
                <Link href="/blog" className="btn-accent px-7 py-3 text-sm font-semibold">
                  探索最新文章
                </Link>
                <Link href="/about" className="btn-outline px-7 py-3 text-sm font-medium">
                  了解更多 →
                </Link>
              </div>
            </div>
            <div className="panel-muted h-full p-8">
              <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--text-secondary)]">当前状态</h2>
              <dl className="mt-8 space-y-5 text-sm md:text-base">
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-[var(--text-secondary)]">常驻城市</dt>
                  <dd className="font-medium text-[var(--text-primary)]">{profile?.location ?? "北京"}</dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-[var(--text-secondary)]">邮箱</dt>
                  <dd className="font-medium text-[var(--text-primary)]">
                    <a href={`mailto:${profile?.user.email ?? "hello@example.com"}`} className="transition hover:text-[var(--accent)]">
                      {profile?.user.email ?? "hello@example.com"}
                    </a>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <dt className="text-[var(--text-secondary)]">技术兴趣</dt>
                  <dd className="max-w-[240px] text-right text-[var(--text-primary)]">
                    Next.js · React · 前端工程化 · AIGC 工作流
                  </dd>
                </div>
              </dl>
              <div className="mt-8 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-5 text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                <p>Currently open for collaboration</p>
                <p className="mt-1 text-[0.65rem] normal-case">
                  接受技术咨询 · 远程合作 · 演讲分享
                </p>
              </div>
            </div>
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
              <h2 className="mt-3 text-3xl font-semibold text-[var(--text-primary)]">最新文章</h2>
            </div>
            <Link
              href="/blog"
              className="btn-outline inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
            >
              查看全部
              <span aria-hidden>↗</span>
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
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
              <p className="panel-muted text-sm text-[var(--text-secondary)]">
                博客还在建设中，敬请期待首篇文章。
              </p>
            )}
          </div>
        </Container>
      </section>

      <section>
        <Container>
          <div className="panel px-8 py-10">
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">高频标签</h2>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              快速定位你感兴趣的主题，订阅 RSS 获取最新内容。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="chip"
                >
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

      <section id="contact" className="relative overflow-hidden py-20">
        <div className="hero-overlay absolute inset-0 opacity-60" />
        <Container className="relative grid items-start gap-10 md:grid-cols-[1.1fr,1fr]">
          <div className="panel px-8 py-10">
            <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[var(--text-secondary)]">
              联系我
            </span>
            <h2 className="mt-5 text-3xl font-semibold text-[var(--text-primary)]">
              一起打造优秀的体验
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)]">
              无论你正在规划下一版产品、优化工程体系，还是希望和我讨论技术方案，都欢迎发来信息。我会在 24 小时内回复你。
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
              <li>· 前端架构设计 / 性能优化</li>
              <li>· 多端一体化解决方案</li>
              <li>· 团队工程化与工具链咨询</li>
            </ul>
          </div>
          <div className="panel p-8">
            <ContactForm />
          </div>
        </Container>
      </section>
    </div>
  );
}

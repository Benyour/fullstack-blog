import Link from "next/link";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Globe2,
  Lightbulb,
  Rocket,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Container } from "@/components/layout/container";

export const metadata = {
  title: "关于我",
  description: "认识一下张亚斌，一名热爱开源与创造的前端开发者。",
};

const HIGHLIGHTS = [
  {
    title: "8 年前端 & 全栈经验",
    description: "聚焦企业级中台、国际化项目与研发效能建设。",
    icon: BriefcaseBusiness,
  },
  {
    title: "跨团队协作",
    description: "协调产品、设计、后端与运营，跨时区交付 40+ 国家项目。",
    icon: Globe2,
  },
  {
    title: "工程化体系",
    description: "搭建 Monorepo、CI/CD、质量基线与可观测性，保障持续交付。",
    icon: Workflow,
  },
  {
    title: "体验驱动",
    description: "深耕 Next.js、React、Tailwind 与设计系统，追求体验与性能平衡。",
    icon: Sparkles,
  },
];

const PROJECTS = [
  {
    title: "vivo 全球营销系统",
    period: "2023 - 2024",
    summary: "面向 40+ 国家营销团队的多语言内容编排与投放平台。",
    highlights: [
      "牵头 Next.js BFF + Supabase 架构，打通品牌内容与运营团队",
      "搭建多租户主题系统与动态权限模型，支撑全球化差异化需求",
      "上线后使内容投放效率提升 35%，大区协同周期缩短一半",
    ],
  },
  {
    title: "宁德时代关务系统",
    period: "2022 - 2023",
    summary: "覆盖进出口全流程的关务合规模型与报关自动化平台。",
    highlights: [
      "主导前端微模块化与实时可视化监控，提升物流透明度",
      "整合 SAP / 海关接口，自动化处理率达 99%，显著减少人工",
      "流程可视化后，审批时长压缩至原来的 1/3",
    ],
  },
  {
    title: "小天才智造项目",
    period: "2020 - 2022",
    summary: "儿童电话手表智能制造与售后联动的生产执行平台。",
    highlights: [
      "搭建实时产线看板与质量追溯系统，支撑百万级设备上线",
      "引入 Server Components + Edge 缓存，端到端响应提升 40%",
      "为售后与运营提供统一数据面板，实现跨部门协同",
    ],
  },
];

const VALUES = [
  {
    title: "体验与效率两手抓",
    description: "设计系统化、组件资产化，把优秀体验复用到更多业务场景。",
    icon: Lightbulb,
  },
  {
    title: "数据驱动决策",
    description: "以可观测性作为项目基线，持续优化性能、稳定性与业务指标。",
    icon: Rocket,
  },
  {
    title: "工程文化建设者",
    description: "擅长搭建研发流程、规范与工具链，让团队更快、更稳、更愉快。",
    icon: Workflow,
  },
];

const STACK = [
  "Next.js 14/19",
  "React Server Components",
  "TypeScript",
  "Prisma + Supabase",
  "Tailwind 4",
  "Zod / React Hook Form",
  "Framer Motion",
  "Turborepo",
];

export default function AboutPage() {
  return (
    <div className="relative overflow-hidden py-16">
      <Container className="max-w-5xl space-y-14 text-[var(--text-secondary)]">
        <section className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="panel relative overflow-hidden p-8 sm:p-10">
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
              关于我 · 张亚斌
            </h1>
            <p className="mt-4 text-base leading-relaxed">
              常驻北京的前端开发者 / 全栈工程师。擅长在复杂业务中平衡体验、工程与跨团队协作，喜欢把抽象的
              需求拆解成可落地的系统化方案，帮助产品快速稳定地上线迭代。
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {HIGHLIGHTS.map(({ title, description, icon: Icon }) => (
                <div key={title} className="panel-muted flex items-start gap-4 p-4">
                  <Icon className="mt-1 h-6 w-6 text-[var(--accent)]" aria-hidden />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#contact" className="btn-accent">
                合作洽谈
              </Link>
              <Link href="/blog" className="btn-outline">
                查看博客
                <ArrowUpRight className="ml-1 h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>

          <aside className="panel-muted flex h-full flex-col justify-between gap-6 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Snapshot</p>
              <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">
                让业务、设计与工程更高效协同
              </p>
              <p className="mt-3 text-sm leading-relaxed">
                · 目前专注 Next.js App Router + Supabase 的一体化方案<br />
                · 注重 UI 设计语言、信息架构与可访问性<br />
                · 关注研发效率、团队流程和指标化运营
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Tech Stack</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {STACK.map((item) => (
                  <span key={item} className="chip text-xs">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-6">
          <header className="max-w-2xl space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Selected Work</p>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              代表项目经历
            </h2>
            <p>
              核心角色通常是 Tech Lead / 前端负责人，从需求梳理、架构设计到工程落地全程把关，确保产品与工程节奏一致。
            </p>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {PROJECTS.map((project) => (
              <article key={project.title} className="panel flex flex-col gap-4 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">{project.title}</h3>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">
                      {project.period}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                </div>
                <p className="text-sm leading-relaxed">{project.summary}</p>
                <ul className="space-y-2 text-sm leading-relaxed">
                  {project.highlights.map((item) => (
                    <li key={item} className="relative pl-4">
                      <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="panel p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Ways of Working</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">工作理念</h2>
            <p className="mt-4 text-sm leading-relaxed">
              我相信优秀的产品既需要稳健的工程体系，也需要有人持续关注体验细节。通过设计系统、组件资产与自动化流程，让团队可以更专注在对用户真正有价值的创新上。
            </p>
            <div className="mt-6 space-y-4">
              {VALUES.map(({ title, description, icon: Icon }) => (
                <div key={title} className="flex items-start gap-4 rounded-2xl bg-[var(--surface-muted)]/70 p-4">
                  <Icon className="mt-1 h-6 w-6 text-[var(--accent)]" aria-hidden />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="panel-muted flex flex-col justify-between gap-6 p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Current Focus</p>
              <h3 className="mt-3 text-xl font-semibold text-[var(--text-primary)]">正在做的事</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                <li>
                  · 研究 Next.js App Router 与服务端组件的最佳实践，打造多主题、多语言的可复用模板。
                </li>
                <li>· 探索 AI 辅助研发、内容生产在企业团队中的落地方式。</li>
                <li>· 梳理 Supabase + Vercel 的一键部署方案，让个人开发者也能享受云原生效率。</li>
              </ul>
            </div>

            <div className="rounded-3xl bg-[var(--surface-background)] p-6 text-sm leading-relaxed shadow-[var(--shadow-soft)]">
              <p className="font-semibold text-[var(--text-primary)]">下一步期待</p>
              <p className="mt-2">
                如果你的项目也正在寻找前端负责人 / 全栈工程师，欢迎联系我聊聊：
                <a className="ml-1 font-medium text-[var(--accent)] underline" href="mailto:founder@example.com">
                  founder@example.com
                </a>
                ，或在首页底部表单留言。
              </p>
            </div>
          </aside>
        </section>
      </Container>
    </div>
  );
}


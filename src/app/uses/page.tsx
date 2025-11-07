import {
  BookOpenCheck,
  Cloudy,
  Code2,
  Cpu,
  PenTool,
  Sparkles,
  TerminalSquare,
  Zap,
} from "lucide-react";

import { Container } from "@/components/layout/container";

export const metadata = {
  title: "工具清单",
  description: "我在开发、设计与效率提升中常用的工具与服务。",
};

const TOOLSETS = [
  {
    title: "核心开发环境",
    description: "满足前端 / 全栈开发的日常场景，把效率和规范拉满。",
    icon: Code2,
    items: [
      {
        name: "Visual Studio Code",
        detail: "主力编辑器，配合 Chinese (Simplified) Language Pack、i18n Ally、ESLint、Prisma、GitLens。",
      },
      {
        name: "Cursor",
        detail: "AI Pair Programmer，常用于重构、代码审查、业务逻辑草稿。",
      },
      {
        name: "WebStorm",
        detail: "处理大型 Monorepo / TS 项目时的备用 IDE，重型重构更稳。",
      },
      {
        name: "Windows Terminal + PowerShell",
        detail: "配合 oh-my-posh、scoop、fzf，打造类 Unix 的命令行体验。",
      },
    ],
  },
  {
    title: "前端构建与服务",
    description: "提升交付质量的工程化基础设施。",
    icon: TerminalSquare,
    items: [
      {
        name: "pnpm / npm",
        detail: "日常以 pnpm 开发，团队协作常备 npm 方案，兼顾国内外镜像。",
      },
      {
        name: "Turborepo",
        detail: "多包管理、缓存加速，适合大型项目工程化。",
      },
      {
        name: "Vercel CLI",
        detail: "部署、预览环境、日志跟踪，秒级同步线上状态。",
      },
      {
        name: "Supabase Studio",
        detail: "在线数据库管理、SQL 编辑、鉴权配置，一站式处理。",
      },
    ],
  },
  {
    title: "设计与原型",
    description: "让设计语言和组件库保持一致，落地体验更顺滑。",
    icon: PenTool,
    items: [
      {
        name: "Figma",
        detail: "设计系统、主题样式、动效稿。常用 FigJam 做团队脑暴。",
      },
      {
        name: "MasterGo",
        detail: "与国内设计师协作时更顺畅，联动飞书文件权限。",
      },
      {
        name: "LottieFiles",
        detail: "动效素材管理与导出，自定义品牌动效。",
      },
      {
        name: "IconPark / Ant Design Icons",
        detail: "中文字重、图标风格统一的最佳选择。",
      },
    ],
  },
  {
    title: "协同与效率",
    description: "结合国内互联网环境的沟通与知识管理 stack。",
    icon: Cloudy,
    items: [
      {
        name: "飞书",
        detail: "团队沟通、日历排期、OKR，文档权限也做得最好。",
      },
      {
        name: "语雀",
        detail: "国内团队常用知识库，适配中文搜索与权限体系。",
      },
      {
        name: "禅道 / TAPD",
        detail: "项目管理平台，能满足甲方/乙方协同的流程管控。",
      },
      {
        name: "飞书妙记",
        detail: "会议实时转写 + 要点整理，大幅降低会议成本。",
      },
    ],
  },
];

const FAVORITES = [
  "Supabase Edge Functions",
  "Framer Motion",
  "Tailwind CSS Typography",
  "dayjs / date-fns",
  "UnoCSS + preset-rem-to-px",
  "VitePress",
  "ESLint Flat Config",
  "Playwright",
];

const HABITS = [
  {
    title: "代码质量",
    icon: Sparkles,
    notes: "以 ESLint + Biome 双栈确保前端/Node 代码风格统一，Commit 使用 lint-staged 提前兜底。",
  },
  {
    title: "自动化测试",
    icon: Cpu,
    notes: "Playwright 做端到端回归，Vitest 做单元测试，配合 GitHub Actions + 飞书机器人推送结果。",
  },
  {
    title: "学习输入",
    icon: BookOpenCheck,
    notes: "Chrome DevRel、Vercel、字节质量工程团队博客 + InfoQ China 每周定向阅读。",
  },
  {
    title: "效率插件",
    icon: Zap,
    notes: "uTools 各类命令、效率工具集合；CheatSheetsPro 管理常用快捷键与脚本。",
  },
];

export default function UsesPage() {
  return (
    <div className="relative overflow-hidden py-16">
      <Container className="max-w-5xl space-y-12 text-[var(--text-secondary)]">
        <header className="panel flex flex-col gap-6 p-8 sm:p-10">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Toolbox</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)] md:text-4xl">
              常用工具与工作流
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed">
              结合国内团队协作习惯与云原生开发趋势，挑选了真正高频使用的工具。目标是保持高效产出、稳定交付，
              同时照顾多语言、多团队的协作需求。
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">操作系统</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Windows 11 + WSL2 (Ubuntu)</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">主要框架</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Next.js · React · Supabase</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">协作平台</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">飞书 · GitHub · Notion / 语雀</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {TOOLSETS.map(({ title, description, items, icon: Icon }) => (
            <article key={title} className="panel flex flex-col gap-4 p-6">
              <div className="flex items-start gap-3">
                <Icon className="h-6 w-6 text-[var(--accent)]" aria-hidden />
                <div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h2>
                  <p className="mt-1 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed">
                {items.map((item) => (
                  <li key={item.name}>
                    <p className="font-medium text-[var(--text-primary)]">{item.name}</p>
                    <p className="mt-1 text-[var(--text-secondary)]">{item.detail}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">Favorites</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--text-primary)]">当前常驻技术栈</h2>
            <p className="mt-2 text-sm leading-relaxed">
              这些工具在我的项目中出现频率最高，也最能体现我对工程效率与体验的追求。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FAVORITES.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <aside className="panel-muted flex flex-col gap-4 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]/80">习惯与方法论</p>
            <div className="space-y-4 text-sm leading-relaxed">
              {HABITS.map(({ title, icon: Icon, notes }) => (
                <div key={title} className="flex items-start gap-3">
                  <Icon className="mt-1 h-5 w-5 text-[var(--accent)]" aria-hidden />
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{title}</p>
                    <p className="mt-1 text-[var(--text-secondary)]">{notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>
      </Container>
    </div>
  );
}


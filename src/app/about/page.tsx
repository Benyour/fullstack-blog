import { Container } from "@/components/layout/container";

export const metadata = {
  title: "关于我",
  description: "认识一下张亚斌，一名热爱开源与创造的前端开发者。",
};

export default function AboutPage() {
  return (
    <div className="py-16">
      <Container className="max-w-3xl space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            关于我
          </h1>
          <p className="mt-3">
            你好，我是张亚斌，一名常驻北京的前端开发者。过去 8 年，我先后在互联网公司和创新型
            SaaS 团队中担任前端负责人，专注于 Web 应用的体验设计、工程化体系与团队协作流程优化。
          </p>
        </div>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">职业关注</h2>
          <ul className="mt-3 space-y-2">
            <li>· 使用 Next.js、React 打造高性能、可扩展的前端应用。</li>
            <li>· 构建稳定的工程体系：Monorepo、CI/CD、质量基线与可观测性。</li>
            <li>· 将 AI 能力嵌入业务流程，提升研发效率与产品体验。</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">近期动态</h2>
          <p className="mt-3">
            目前我正在探索如何把 AIGC 与前端开发流程结合，降低高质量内容生产与界面实现的成本。
            同时也在为团队搭建一套可复用的设计系统与知识沉淀平台，帮助新人更快融入并发挥价值。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">联系我</h2>
          <p className="mt-3">
            如果你对我的工作感兴趣，或者有项目希望合作，欢迎在首页底部的表单留下信息，或者发送邮件到
            <a className="ml-1 underline" href="mailto:founder@example.com">
              founder@example.com
            </a>
            。
          </p>
        </section>
      </Container>
    </div>
  );
}


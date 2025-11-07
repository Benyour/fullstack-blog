import { Container } from "@/components/layout/container";

export const metadata = {
  title: "工具清单",
  description: "我在开发、设计与效率提升中常用的工具与服务。",
};

const sections: Array<{
  title: string;
  items: Array<{ name: string; description: string }>;
}> = [
  {
    title: "开发",
    items: [
      { name: "Visual Studio Code", description: "主要编辑器，配合 WakaTime、GitLens、Tailwind CSS IntelliSense 等插件。" },
      { name: "Cursor", description: "通过 AI 辅助重构、生成初稿和代码审查。" },
      { name: "Insomnia", description: "调试 API 与 GraphQL 接口的常备工具。" },
    ],
  },
  {
    title: "设计 & 协作",
    items: [
      { name: "Figma", description: "绘制低保真原型和设计系统组件。" },
      { name: "Notion", description: "团队知识库与项目计划。" },
      { name: "Excalidraw", description: "快速手绘流程图和架构图。" },
    ],
  },
  {
    title: "效率",
    items: [
      { name: "Raycast", description: "命令面板 + 脚本扩展，结合自定义 Workflow 简化日常工作。" },
      { name: "Arc Browser", description: "分空间管理的浏览器，便于隔离不同项目的标签页。" },
      { name: "Things 3", description: "个人任务管理与周计划。" },
    ],
  },
];

export default function UsesPage() {
  return (
    <div className="py-16">
      <Container className="max-w-3xl space-y-10 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">工具清单</h1>
          <p className="mt-3">
            这里记录了我在工作与生活中常用的工具，它们帮助我维持稳定的输出效率，也让协作变得更顺畅。
          </p>
        </header>

        {sections.map((section) => (
          <section key={section.title} className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {section.title}
            </h2>
            <ul className="space-y-3">
              {section.items.map((item) => (
                <li key={item.name}>
                  <p className="font-medium text-slate-800 dark:text-slate-100">{item.name}</p>
                  <p>{item.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </div>
  );
}


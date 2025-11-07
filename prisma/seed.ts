import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "founder@example.com" },
    update: {},
    create: {
      email: "founder@example.com",
      name: "张亚斌",
      image: "https://avatars.githubusercontent.com/u/1?v=4",
      role: UserRole.ADMIN,
      emailVerified: new Date(),
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    create: {
      userId: admin.id,
      headline: "前端开发者 & 创作者",
      bio: "热爱构建极致体验的应用，关注 Next.js、React、Web 性能与产品设计。",
      location: "北京，中国",
      avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
      heroImage: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    },
    update: {},
  });

  const tags = [
    { name: "Next.js", slug: "nextjs" },
    { name: "前端工程化", slug: "fe-tooling" },
    { name: "React", slug: "react" },
    { name: "职场成长", slug: "career" },
  ];

  await Promise.all(
    tags.map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: tag,
        create: tag,
      }),
    ),
  );

  const posts = [
    {
      title: "使用 Next.js 16 打造个性化全栈博客",
      slug: "build-fullstack-blog-with-nextjs16",
      summary: "从架构选型、数据层到部署流程，带你一步步完成一个可扩展的全栈博客系统。",
      content: `## 为什么选择 Next.js 16

Next.js 16 在 App Router 上继续发力，配合 React 19 带来的并发特性，让我们可以：

- 更轻松地拆分页面和数据请求
- 使用 Server Actions 简化表单和 Mutations
- 借助 Vercel Edge Network 提升全球访问体验

## 系统模块拆解

1. **内容管理**：使用 Prisma + Supabase 存储文章、标签与消息。
2. **认证授权**：NextAuth + GitHub / 邮件双通道登录。
3. **界面体验**：Tailwind CSS + 自定义组件，支持深浅色模式。
4. **部署运维**：一键部署到 Vercel，数据库托管在 Supabase。

## 下一步

欢迎 fork 项目，按照 README 的部署指南，几分钟内就能拥有自己的个人网站。`,
      coverImage: "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
      tags: ["nextjs", "react"],
    },
    {
      title: "前端工程师的内容创作工作流",
      slug: "content-workflow-for-frontend-developers",
      summary: "分享我在日常中整理灵感、输出文章与维护知识库的工作流。",
      content: `写作并不是灵感闪现的结果，而是持续积累的过程。

### 我的三步法

1. **收集灵感** - 使用 Notion + Raycast 快速记录日常遇到的问题与解法。
2. **结构化大纲** - 先写标题与小节，让文章有清晰的叙述节奏。
3. **验证与迭代** - 结合 Demo、代码片段、线上讨论，持续完善内容。

> 与其追求一次成型，不如保持高频率地迭代与分享。

### 推荐工具

- Obsidian / Logseq 做本地知识库
- Figma / Excalidraw 画流程图
- Vercel Analytics 观察读者行为`,
      coverImage: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d",
      tags: ["career", "fe-tooling"],
    },
  ];

  for (const post of posts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {
        title: post.title,
        summary: post.summary,
        content: post.content,
        coverImage: post.coverImage,
        published: true,
        publishedAt: new Date(),
        tags: {
          deleteMany: {},
          create: post.tags.map((slug) => ({
            tag: {
              connect: { slug },
            },
          })),
        },
      },
      create: {
        title: post.title,
        slug: post.slug,
        summary: post.summary,
        content: post.content,
        coverImage: post.coverImage,
        published: true,
        publishedAt: new Date(),
        authorId: admin.id,
        tags: {
          create: post.tags.map((slug) => ({
            tag: {
              connect: { slug },
            },
          })),
        },
      },
    });
  }

  console.log("✅ Database has been seeded successfully.");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


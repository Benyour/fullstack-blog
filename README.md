## 全栈个人网站 & 博客

基于 **Next.js 16 (App Router)** 构建的个人品牌站点，集成博客、后台管理、联系表单与 RSS，可一键部署到 Vercel + Supabase。

### 功能亮点

- 🎯 主页：个人介绍、最新文章、高频标签、联系表单
- ✍️ 博客：MDX 正文渲染、标签筛选、RSS 输出
- 🔐 认证：NextAuth（GitHub / 邮件魔法链接）
- 🗂️ 后台：文章增删改、草稿/发布状态切换
- 💌 留言：访客信息写入数据库并通过 Resend 邮件通知
- ☁️ 部署：Vercel 前端托管 + Supabase Postgres / Storage

### 技术栈

- **前端**：Next.js 16、React 19、Tailwind CSS 4、next-mdx-remote
- **数据层**：Prisma ORM + Supabase Postgres
- **认证**：NextAuth.js（GitHub Provider、Email Provider）
- **表单 & 校验**：React Hook Form、Zod
- **其他**：Feed RSS、Resend、date-fns、clsx / tailwind-merge

## 快速开始

```bash
npm install

# 生成 Prisma Client
npm run prisma:generate

# 同步数据库结构（需先配置 DATABASE_URL）
npm run db:push

# 写入示例管理员、文章、标签
npm run db:seed

# 启动开发环境
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 预览站点。

## 环境变量

复制 `env.example` 为 `.env.local`，根据实际部署填写：

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` / `DATABASE_DIRECT_URL` | Supabase Postgres 连接串 |
| `NEXTAUTH_URL` | 站点地址，本地为 `http://localhost:3000` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 生成 |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App |
| `RESEND_API_KEY` / `EMAIL_FROM` | Resend 邮件配置 |
| `CONTACT_FORWARD_TO` | 留言通知收件邮箱（可多个，逗号分隔） |
| `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Supabase 项目密钥 |
| `SUPABASE_STORAGE_BUCKET` | 可选，Supabase 存储桶名称 |
| `SITE_URL` | 生产环境域名，用于 RSS / OG |

## 目录结构

```
src/
├─ app/
│  ├─ blog/            # 博客列表与详情
│  ├─ dashboard/       # 后台控制台（受保护）
│  ├─ api/             # Auth、Posts、Contact、RSS 等 API
│  └─ ...
├─ components/         # UI、表单、后台组件
├─ lib/                # Prisma、Auth、MDX、Supabase 工具
└─ prisma/             # schema.prisma & seed.ts
```

## 本地账号

执行 `npm run db:seed` 将创建一名管理员：

- 邮箱：`founder@example.com`
- 登录方式：在 `/login` 输入邮箱触发魔法链接（若未配置 Resend，可在终端日志中找到登录 URL）。

首位登录用户自动赋予 `ADMIN` 角色，拥有后台权限。

## 部署指南（Vercel + Supabase + Resend）

1. **Supabase**：创建项目，复制数据库连接串；如需对象存储，新建 Storage Bucket（示例：`media`）。
2. **Resend**：验证发件域名，获取 `RESEND_API_KEY`。
3. **GitHub OAuth**：回调地址设为 `https://your-domain.vercel.app/api/auth/callback/github`。
4. **Vercel**：导入仓库、配置所有环境变量，确保构建命令包含 `npm run prisma:generate`。

部署完成后访问 `/dashboard` 进入后台管理。

## 后续规划

- Supabase Storage 文件上传表单
- 文章版本历史 & 草稿箱
- 评论 / 点赞模块
- 接入 Vercel Analytics 或 Plausible 统计

## 许可证

MIT License. 欢迎 Fork 并定制属于你的个人网站。🎉

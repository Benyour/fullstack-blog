import { redirect } from "next/navigation";

import { LoginButtons } from "@/components/auth/login-buttons";
import { Container } from "@/components/layout/container";
import { getAuthSession } from "@/lib/auth";

export const metadata = {
  title: "登录",
  description: "登录后台，管理博客内容与站点信息。",
};

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="py-16">
      <Container className="max-w-md space-y-6 rounded-3xl border border-slate-200 bg-white p-8 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">欢迎回来</h1>
          <p className="text-slate-600 dark:text-slate-300">
            登录后即可管理文章、标签与站点内容。
          </p>
        </div>

        <LoginButtons />

        <p className="text-xs text-slate-500 dark:text-slate-400">
          登录即代表你同意站点的隐私政策与使用条款。
        </p>
      </Container>
    </div>
  );
}


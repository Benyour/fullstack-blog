import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = {
  title: "站点资料",
};

export default async function DashboardProfilePage() {
  const profile = await prisma.profile.findFirst({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          品牌资料
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">更新个人信息</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          编辑主页简介、社交信息与视觉素材，实时同步到前台展示页面。
        </p>
      </header>

      <ProfileForm
        initialData={{
          headline: profile?.headline ?? "",
          bio: profile?.bio ?? "",
          location: profile?.location ?? "",
          avatarUrl: profile?.avatarUrl ?? "",
          heroImage: profile?.heroImage ?? "",
          userName: profile?.user?.name ?? "",
          userEmail: profile?.user?.email ?? "",
        }}
      />
    </div>
  );
}


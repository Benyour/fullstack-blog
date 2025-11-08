import { ContactStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { MessageCenter } from "@/components/dashboard/message-center";

export const metadata = {
  title: "留言中心",
};

export default async function DashboardMessagesPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const stats = await prisma.contactMessage.groupBy({
    by: ["status"],
    _count: {
      status: true,
    },
  });

  const statusCount: Record<ContactStatus, number> = {
    [ContactStatus.NEW]: 0,
    [ContactStatus.IN_PROGRESS]: 0,
    [ContactStatus.RESOLVED]: 0,
  };

  stats.forEach((item) => {
    statusCount[item.status] = item._count.status ?? 0;
  });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <span className="inline-flex items-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          留言中心
        </span>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">访客留言</h1>
        <p className="text-sm text-[var(--text-secondary)]">跟踪访客咨询进度，及时回复潜在合作机会。</p>
      </header>

      <MessageCenter
        initialMessages={messages.map((message) => ({
          id: message.id,
          name: message.name,
          email: message.email,
          message: message.message,
          status: message.status,
          notes: message.notes,
          createdAt: message.createdAt.toISOString(),
          resolvedAt: message.resolvedAt?.toISOString() ?? null,
        }))}
        statusCount={{
          new: statusCount[ContactStatus.NEW],
          inProgress: statusCount[ContactStatus.IN_PROGRESS],
          resolved: statusCount[ContactStatus.RESOLVED],
        }}
      />
    </div>
  );
}


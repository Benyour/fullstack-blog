"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: ContactStatus;
  notes: string | null;
  createdAt: string;
  resolvedAt: string | null;
};

type MessageCenterProps = {
  initialMessages: Message[];
  statusCount: {
    new: number;
    inProgress: number;
    resolved: number;
  };
};

const FILTERS = [
  { key: "all", label: "全部" },
  { key: ContactStatus.NEW, label: "待处理" },
  { key: ContactStatus.IN_PROGRESS, label: "进行中" },
  { key: ContactStatus.RESOLVED, label: "已完成" },
] as const;

export function MessageCenter({ initialMessages, statusCount }: MessageCenterProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [feedback, setFeedback] = useState<string | null>(null);

  const filteredMessages = useMemo(() => {
    if (filter === "all") return messages;
    return messages.filter((message) => message.status === filter);
  }, [filter, messages]);

  async function updateMessage(id: string, data: Partial<Pick<Message, "status" | "notes">>) {
    try {
      setStatus("loading");
      setFeedback(null);

      const response = await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("更新失败");
      }

      const updated = (await response.json()) as Message;
      setMessages((prev) => prev.map((message) => (message.id === id ? { ...message, ...updated } : message)));
      setStatus("success");
      setFeedback("状态已更新");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("更新失败，请稍后再试");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  async function deleteMessage(id: string) {
    if (!confirm("确定要删除这条留言吗？删除后无法恢复。")) {
      return;
    }

    try {
      setStatus("loading");
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setMessages((prev) => prev.filter((message) => message.id !== id));
      setStatus("success");
      setFeedback("留言已删除");
    } catch (error) {
      console.error(error);
      setStatus("error");
      setFeedback("删除失败，请稍后再试");
    } finally {
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setFilter(item.key)}
            className={`rounded-full border px-4 py-1 text-xs font-semibold transition ${
              filter === item.key
                ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {item.label}
            {item.key !== "all" && (
              <span className="ml-1 rounded-full bg-[var(--surface-muted)] px-2 py-0.5 text-[var(--text-secondary)]">
                {item.key === ContactStatus.NEW
                  ? statusCount.new
                  : item.key === ContactStatus.IN_PROGRESS
                  ? statusCount.inProgress
                  : statusCount.resolved}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="divide-y divide-[var(--surface-border)] rounded-2xl border border-[var(--surface-border)]">
        {filteredMessages.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--text-secondary)]">暂无符合条件的留言。</p>
        )}

        {filteredMessages.map((message) => {
          const isActive = activeMessageId === message.id;
          return (
            <div key={message.id} className="space-y-4 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">{message.name}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <a href={`mailto:${message.email}`} className="underline decoration-dotted underline-offset-4">
                      {message.email}
                    </a>
                    <span>·</span>
                    <span>{format(new Date(message.createdAt), "yyyy-MM-dd HH:mm")}</span>
                    {message.resolvedAt && (
                      <>
                        <span>·</span>
                        <span>完成于 {format(new Date(message.resolvedAt), "yyyy-MM-dd HH:mm")}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={message.status} />
                  <button
                    type="button"
                    onClick={() => setActiveMessageId((prev) => (prev === message.id ? null : message.id))}
                    className="rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    {isActive ? "收起" : "展开"}
                  </button>
                </div>
              </div>

              <p className="whitespace-pre-wrap rounded-xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 text-[var(--text-secondary)]">
                {message.message}
              </p>

              {isActive && (
                <div className="space-y-3 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 text-xs">
                  <div className="grid gap-2 md:grid-cols-[1fr,1fr] md:items-center">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-[var(--text-secondary)]">状态：</span>
                      <select
                        className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
                        value={message.status}
                        onChange={(event) =>
                          updateMessage(message.id, { status: event.target.value as ContactStatus })
                        }
                        disabled={status === "loading"}
                      >
                        <option value={ContactStatus.NEW}>待处理</option>
                        <option value={ContactStatus.IN_PROGRESS}>进行中</option>
                        <option value={ContactStatus.RESOLVED}>已完成</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMessage(message.id)}
                      className="ml-auto inline-flex items-center gap-1 rounded-full bg-red-500 px-4 py-2 font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={status === "loading"}
                    >
                      删除
                    </button>
                  </div>

                  <div className="grid gap-2">
                    <label className="font-semibold text-[var(--text-secondary)]">跟进记录</label>
                    <textarea
                      rows={3}
                      className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 leading-relaxed focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
                      defaultValue={message.notes ?? ""}
                      placeholder="记录沟通纪要、下一步行动..."
                      onBlur={(event) => {
                        if (event.target.value !== (message.notes ?? "")) {
                          updateMessage(message.id, { notes: event.target.value });
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {feedback && (
        <p className={`text-xs ${status === "error" ? "text-red-500" : "text-emerald-500"}`}>
          {feedback}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: ContactStatus }) {
  const label =
    status === ContactStatus.NEW
      ? "待处理"
      : status === ContactStatus.IN_PROGRESS
      ? "进行中"
      : "已完成";

  const styles =
    status === ContactStatus.NEW
      ? "bg-amber-400/15 text-amber-600 dark:bg-amber-300/20 dark:text-amber-200"
      : status === ContactStatus.IN_PROGRESS
      ? "bg-sky-400/15 text-sky-600 dark:bg-sky-300/20 dark:text-sky-200"
      : "bg-emerald-400/15 text-emerald-600 dark:bg-emerald-300/20 dark:text-emerald-200";

  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>{label}</span>;
}


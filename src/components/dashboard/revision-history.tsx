"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { diffWordsWithSpace, type Change as DiffChange } from "diff";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

type RevisionEditor = {
  id: string | null;
  name: string | null;
  email: string | null;
};

type RevisionSnapshot = {
  id: string;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  createdAt: string;
  editor: RevisionEditor | null;
};

type CurrentVersion = {
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  updatedAt: string;
};

type RevisionHistoryProps = {
  postId: string;
  currentVersion: CurrentVersion;
  revisions: RevisionSnapshot[];
};

type RestoreState = "idle" | "loading" | "success" | "error";

type DiffToken = {
  value: string;
  type: "added" | "removed" | "unchanged";
};

export function RevisionHistory({ postId, currentVersion, revisions }: RevisionHistoryProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<RestoreState>("idle");
  const [activeRevisionId, setActiveRevisionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId((previous) => (previous === id ? null : id));
  };

  const handleRestore = async (id: string) => {
    if (!confirm("确定要恢复到该版本吗？当前内容将被覆盖，并生成新的历史版本。")) {
      return;
    }

    setRestoreStatus("loading");
    setActiveRevisionId(id);
    setFeedback(null);

    try {
      const response = await fetch(`/api/posts/${postId}/revisions/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("恢复失败");
      }

      setRestoreStatus("success");
      setFeedback("已恢复到所选版本");
      router.refresh();
    } catch (error) {
      console.error(error);
      setRestoreStatus("error");
      setFeedback("恢复失败，请稍后再试");
    } finally {
      setTimeout(() => {
        setRestoreStatus("idle");
        setActiveRevisionId(null);
      }, 3000);
    }
  };

  if (revisions.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--surface-border)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">版本历史</h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">暂无修订记录，保存后会自动生成历史版本。</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-[var(--surface-border)] p-6">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">版本历史</h2>
        <p className="text-sm text-[var(--text-secondary)]">
          最近保存的 10 个版本快照，可进行差异对比与一键恢复。
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          当前版本更新时间：{format(new Date(currentVersion.updatedAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
        </p>
      </header>

      <ul className="space-y-4 text-sm text-[var(--text-secondary)]">
        {revisions.map((revision) => {
          const isExpanded = expandedId === revision.id;
          const isRestoring = activeRevisionId === revision.id && restoreStatus === "loading";

          return (
            <li key={revision.id} className="rounded-2xl bg-[var(--surface-muted)] p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-[var(--text-primary)]">
                  {revision.editor?.name ?? "系统"}
                </span>
                <span>·</span>
                <span>{format(new Date(revision.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}</span>
              </div>

              <div className="mt-3 grid gap-1 text-xs">
                <span className="font-semibold text-[var(--text-primary)]">标题：{revision.title}</span>
                <span className="text-[var(--text-secondary)] line-clamp-2">
                  摘要：{revision.summary}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <button
                  type="button"
                  className="btn-outline px-3 py-1 text-xs font-medium"
                  onClick={() => handleToggle(revision.id)}
                >
                  {isExpanded ? "收起对比" : "对比当前版本"}
                </button>
                <button
                  type="button"
                  className="btn-outline px-3 py-1 text-xs font-medium"
                  onClick={() => handleRestore(revision.id)}
                  disabled={isRestoring}
                >
                  {isRestoring ? "恢复中..." : "恢复到此版本"}
                </button>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-4 rounded-xl border border-[var(--surface-border)] bg-[var(--surface-background)] p-4 text-xs">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">差异对比</h3>

                  <DiffSection label="标题" previous={revision.title} current={currentVersion.title} />
                  <DiffSection label="摘要" previous={revision.summary} current={currentVersion.summary} />

                  {revision.coverImage !== currentVersion.coverImage && (
                    <div className="space-y-2">
                      <p className="font-semibold text-[var(--text-primary)]">封面图</p>
                      <div className="grid gap-3 md:grid-cols-2">
                        <ImagePreview url={revision.coverImage} label="历史版本" />
                        <ImagePreview url={currentVersion.coverImage} label="当前版本" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <p className="font-semibold text-[var(--text-primary)]">正文对比</p>
                    <DiffContent previous={revision.content} current={currentVersion.content} />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {feedback && (
        <p
          className={`text-xs ${
            restoreStatus === "error" ? "text-red-500" : restoreStatus === "success" ? "text-emerald-500" : "text-[var(--text-secondary)]"
          }`}
        >
          {feedback}
        </p>
      )}
    </section>
  );
}

function DiffSection({ label, previous, current }: { label: string; previous: string; current: string }) {
  const tokens = useDiffTokens(previous, current);

  return (
    <div className="space-y-1">
      <p className="font-medium text-[var(--text-secondary)]">{label}</p>
      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-3 font-medium text-[var(--text-primary)]">
        {tokens.map((token, index) => {
          if (token.type === "added") {
            return (
              <mark key={index} className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                {token.value}
              </mark>
            );
          }
          if (token.type === "removed") {
            return (
              <mark key={index} className="bg-rose-500/20 text-rose-700 line-through dark:text-rose-300">
                {token.value}
              </mark>
            );
          }
          return <span key={index}>{token.value}</span>;
        })}
      </div>
    </div>
  );
}

function DiffContent({ previous, current }: { previous: string; current: string }) {
  const tokens = useDiffTokens(previous, current);

  return (
    <pre className="max-h-[320px] overflow-auto rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-3 font-mono text-xs leading-6">
      {tokens.map((token, index) => {
        if (token.type === "added") {
          return (
            <span key={index} className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {token.value}
            </span>
          );
        }
        if (token.type === "removed") {
          return (
            <span key={index} className="bg-rose-500/20 text-rose-700 line-through dark:text-rose-300">
              {token.value}
            </span>
          );
        }
        return <span key={index}>{token.value}</span>;
      })}
    </pre>
  );
}

function ImagePreview({ url, label }: { url: string | null; label: string }) {
  return (
    <div className="space-y-2 text-xs">
      <p className="font-medium text-[var(--text-secondary)]">{label}</p>
      {url ? (
        <div className="overflow-hidden rounded-lg border border-[var(--surface-border)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={label} className="h-32 w-full object-cover" />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed border-[var(--surface-border)] p-3 text-[var(--text-secondary)]">
          无封面图
        </p>
      )}
    </div>
  );
}

function useDiffTokens(previous: string, current: string) {
  return useMemo<DiffToken[]>(() => {
    const result = diffWordsWithSpace(previous ?? "", current ?? "");
    return result.map((change: DiffChange) => {
      if (change.added) {
        return { value: change.value, type: "added" as const };
      }
      if (change.removed) {
        return { value: change.value, type: "removed" as const };
      }
      return { value: change.value, type: "unchanged" as const };
    });
  }, [previous, current]);
}

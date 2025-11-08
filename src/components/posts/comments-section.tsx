"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import { createCommentSchema, type CreateCommentInput } from "@/lib/validators/comment";

type CommentItem = {
  id: string;
  name: string | null;
  email: string | null;
  body: string;
  createdAt: string;
};

type CommentsSectionProps = {
  postId: string;
  initialComments: CommentItem[];
};

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCommentInput>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      postId,
      body: "",
    },
  });

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  async function refreshComments() {
    try {
      const response = await fetch(`/api/comments?postId=${postId}`);
      if (!response.ok) {
        throw new Error("加载失败");
      }
      const data = (await response.json()) as CommentItem[];
      setComments(data);
    } catch (error) {
      console.error(error);
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      setStatus("loading");
      setMessage(null);
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("评论失败");
      }

      setStatus("success");
      setMessage("评论已提交，待审核通过后将出现在页面中。");
      reset({ postId, body: "", name: "", email: "" });
      await refreshComments();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("评论失败，请稍后再试。");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">留言讨论</h2>
        <p className="text-sm text-[var(--text-secondary)]">欢迎分享你的观点或疑问，期待与你交流。</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 text-sm">
        <input type="hidden" value={postId} {...register("postId")} />
        <div className="grid gap-2 md:grid-cols-2">
          <div className="grid gap-1">
            <label className="text-xs text-[var(--text-secondary)]">昵称（可选）</label>
            <input
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
              placeholder="你想让大家如何称呼你？"
              {...register("name")}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-xs text-[var(--text-secondary)]">邮箱（可选，不会公开）</label>
            <input
              type="email"
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
              placeholder="用于回复时通知你"
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-xs text-[var(--text-secondary)]">内容</label>
          <textarea
            rows={4}
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 leading-relaxed focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="就文中的观点或你的实践经验展开讨论吧～"
            {...register("body")}
          />
          {errors.body && <p className="text-xs text-red-500">{errors.body.message}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="btn-accent flex items-center justify-center px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "提交中..." : "发布评论"}
          </button>
          {message && (
            <span className={`text-xs ${status === "error" ? "text-red-500" : "text-emerald-500"}`}>
              {message}
            </span>
          )}
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
          <span>共 {comments.length} 条讨论</span>
          <button
            type="button"
            onClick={refreshComments}
            className="rounded-full border border-[var(--surface-border)] px-3 py-1 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            刷新
          </button>
        </div>
        {comments.length === 0 ? (
          <p className="text-sm text-[var(--text-secondary)]">还没有评论，快来抢首条留言吧！</p>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text-primary)]">{comment.name || "匿名读者"}</span>
                  <span>·</span>
                  <span>{format(new Date(comment.createdAt), "yyyy年MM月dd日 HH:mm", { locale: zhCN })}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{comment.body}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}


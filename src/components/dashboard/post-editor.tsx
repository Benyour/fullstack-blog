"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { slugify } from "@/lib/utils";
import { upsertPostSchema } from "@/lib/validators/post";

type EditorMode = "create" | "edit";

type AvailableTag = {
  id: string;
  name: string;
  slug: string;
};

const editorSchema = z.object({
  title: upsertPostSchema.shape.title,
  slug: upsertPostSchema.shape.slug,
  summary: upsertPostSchema.shape.summary,
  content: upsertPostSchema.shape.content,
  coverImage: upsertPostSchema.shape.coverImage,
  published: z.boolean(),
  scheduledAt: upsertPostSchema.shape.scheduledAt,
});

type EditorFormValues = z.infer<typeof editorSchema>;

export type PostEditorProps = {
  mode: EditorMode;
  postId?: string;
  initialData?: {
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage?: string | null;
    published: boolean;
    scheduledAt?: string | null;
    tags: string[];
  };
  availableTags: AvailableTag[];
};

const wordsPerMinute = 200;

function toInputDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000).toISOString().slice(0, 16);
}

function calculateReadingMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}

export function PostEditor({ mode, postId, initialData, availableTags }: PostEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [view, setView] = useState<"write" | "preview">("write");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags ?? []);
  const [draftStatus, setDraftStatus] = useState<string>("草稿自动保存已启用");
  const storageKey = useMemo(
    () => `post-editor:${mode}:${postId ?? "new"}`,
    [mode, postId],
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<EditorFormValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      summary: initialData?.summary ?? "",
      content: initialData?.content ?? "",
      coverImage: initialData?.coverImage ?? "",
      published: initialData?.published ?? false,
      scheduledAt: toInputDateTime(initialData?.scheduledAt),
    },
  });

  // Hydrate from local draft if存在
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<EditorFormValues> & { tags?: string[] };
      reset({
        title: parsed.title ?? initialData?.title ?? "",
        slug: parsed.slug ?? initialData?.slug ?? "",
        summary: parsed.summary ?? initialData?.summary ?? "",
        content: parsed.content ?? initialData?.content ?? "",
        coverImage: parsed.coverImage ?? initialData?.coverImage ?? "",
        published: parsed.published ?? initialData?.published ?? false,
        scheduledAt: parsed.scheduledAt ?? toInputDateTime(initialData?.scheduledAt),
      });
      if (parsed.tags) {
        setSelectedTags(parsed.tags);
      }
      setDraftStatus("已从本地草稿恢复");
    } catch (error) {
      console.error("Failed to restore draft", error);
    }
  }, [initialData, reset, storageKey]);

  const watchedValues = watch();
  const contentValue = watchedValues.content ?? "";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handle = setTimeout(() => {
      const payload = {
        ...watchedValues,
        tags: selectedTags,
      };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setDraftStatus("草稿已保存到本地");
    }, 800);

    return () => clearTimeout(handle);
  }, [watchedValues, selectedTags, storageKey]);

  const readingMinutes = useMemo(() => calculateReadingMinutes(contentValue), [contentValue]);

  const recommendedTags = useMemo(
    () => availableTags.filter((tag) => !selectedTags.includes(tag.slug)),
    [availableTags, selectedTags],
  );

  async function handleUpload(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "covers");

    try {
      setState("loading");
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = (await response.json()) as { url: string };
      setValue("coverImage", data.url, { shouldDirty: true, shouldValidate: true });
      setDraftStatus("封面图已上传");
    } catch (error) {
      console.error(error);
      setDraftStatus("封面图上传失败");
      setState("error");
    } finally {
      setState("idle");
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      content: values.content,
      coverImage: values.coverImage || undefined,
      published: values.published,
      scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : undefined,
      tags: selectedTags,
    } satisfies z.infer<typeof upsertPostSchema>;

    try {
      setState("loading");

      const response = await fetch(postId ? `/api/posts/${postId}` : "/api/posts", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }

      setState("success");
      router.push("/dashboard/posts");
      router.refresh();
    } catch (error) {
      console.error(error);
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 4000);
    }
  });

  const addTag = (tag: string) => {
    const next = slugify(tag);
    if (!next || selectedTags.includes(next)) return;
    setSelectedTags((prev) => [...prev, next]);
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-sm">
      <div className="grid gap-2">
        <label className="font-medium text-[var(--text-primary)]" htmlFor="title">
          标题
        </label>
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            id="title"
            className="flex-1 rounded-lg border border-[var(--surface-border)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="输入标题"
            {...register("title")}
          />
          <button
            type="button"
            className="rounded-full border border-[var(--surface-border)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            onClick={() => {
              const generated = slugify(watchedValues.title ?? "");
              if (generated) {
                setValue("slug", generated, { shouldDirty: true, shouldValidate: true });
              }
            }}
          >
            根据标题生成 Slug
          </button>
        </div>
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-[var(--text-primary)]" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className="rounded-lg border border-[var(--surface-border)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          placeholder="例如：nextjs-best-practices"
          {...register("slug")}
        />
        {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-[var(--text-primary)]" htmlFor="summary">
          摘要
        </label>
        <textarea
          id="summary"
          rows={3}
          className="rounded-lg border border-[var(--surface-border)] px-3 py-2 leading-relaxed focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          placeholder="简要说明文章核心内容"
          {...register("summary")}
        />
        {errors.summary && <p className="text-xs text-red-500">{errors.summary.message}</p>}
      </div>

      <div className="grid gap-2">
        <span className="font-medium text-[var(--text-primary)]">封面图</span>
        {watchedValues.coverImage && (
          <div className="overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={watchedValues.coverImage} alt="封面图预览" className="h-40 w-full object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-2 md:flex-row">
          <input
            type="url"
            className="flex-1 rounded-lg border border-[var(--surface-border)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="https://..."
            {...register("coverImage")}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) {
                await handleUpload(file);
              }
            }}
          />
          <button
            type="button"
            className="rounded-full border border-[var(--surface-border)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            onClick={() => fileInputRef.current?.click()}
          >
            上传图片
          </button>
        </div>
        {errors.coverImage && <p className="text-xs text-red-500">{errors.coverImage.message}</p>}
      </div>

      <div className="grid gap-3">
        <span className="font-medium text-[var(--text-primary)]">标签</span>
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="group inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
            >
              #{tag}
              <button
                type="button"
                className="rounded-full bg-[var(--surface-border)] px-1 text-[var(--text-secondary)] group-hover:bg-red-500 group-hover:text-white"
                onClick={() => removeTag(tag)}
              >
                ×
              </button>
            </span>
          ))}
          {selectedTags.length === 0 && (
            <span className="text-xs text-[var(--text-secondary)]">尚未选择标签，可在下方快速添加。</span>
          )}
        </div>
        <TagInput onAdd={addTag} />
        {recommendedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            <span>推荐：</span>
            {recommendedTags.slice(0, 8).map((tag) => (
              <button
                type="button"
                key={tag.id}
                onClick={() => addTag(tag.slug)}
                className="rounded-full border border-dashed border-[var(--surface-border)] px-3 py-1 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-medium text-[var(--text-primary)]">正文（支持 MDX）</span>
          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setView("write")}
              className={`rounded-full px-3 py-1 font-semibold ${
                view === "write"
                  ? "bg-[var(--surface-border)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              写作
            </button>
            <button
              type="button"
              onClick={() => setView("preview")}
              className={`rounded-full px-3 py-1 font-semibold ${
                view === "preview"
                  ? "bg-[var(--surface-border)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              预览
            </button>
            <span className="rounded-full bg-[var(--surface-border)] px-3 py-1 text-[var(--text-secondary)]">
              预计阅读 {readingMinutes} 分钟
            </span>
          </div>
        </div>

        {view === "write" ? (
          <textarea
            id="content"
            rows={18}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-3 font-mono text-xs leading-relaxed focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="## 标题\n\n内容..."
            {...register("content")}
          />
        ) : (
          <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
            <MDXPreview content={contentValue} />
          </div>
        )}

        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      <div className="grid gap-2 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]" htmlFor="published">
          <input id="published" type="checkbox" {...register("published")} />
          发布本文（未勾选时保存为草稿）
        </label>

        <div className="grid gap-1">
          <label className="text-sm text-[var(--text-secondary)]" htmlFor="scheduledAt">
            定时发布（可选）
          </label>
          <input
            id="scheduledAt"
            type="datetime-local"
            className="rounded-lg border border-[var(--surface-border)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            {...register("scheduledAt")}
          />
          <p className="text-xs text-[var(--text-secondary)]">到达指定时间后会自动发布。</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-accent flex items-center justify-center px-6 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? "保存中..." : mode === "edit" ? "保存修改" : "发布文章"}
        </button>
        <button
          type="button"
          className="btn-outline flex items-center justify-center px-5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"
          onClick={() => {
            if (typeof window !== "undefined") {
              localStorage.removeItem(storageKey);
              setDraftStatus("本地草稿已清除");
            }
          }}
        >
          清除本地草稿
        </button>
        {state === "success" && <span className="text-xs text-emerald-500">保存成功</span>}
        {state === "error" && <span className="text-xs text-red-500">保存失败，请稍后再试</span>}
        <span className="text-xs text-[var(--text-secondary)]">{draftStatus}</span>
      </div>
    </form>
  );
}

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [value, setValue] = useState("");

  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            if (value.trim()) {
              onAdd(value.trim());
              setValue("");
            }
          }
        }}
        className="input-field flex-1"
        placeholder="输入标签后回车添加"
      />
      <button
        type="button"
        onClick={() => {
          if (value.trim()) {
            onAdd(value.trim());
            setValue("");
          }
        }}
        className="btn-outline flex items-center justify-center px-4 py-2 text-xs font-medium"
      >
        添加标签
      </button>
    </div>
  );
}

function MDXPreview({ content }: { content: string }) {
  const [html, setHtml] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
    if (!content.trim()) {
      setHtml("");
      setStatus("idle");
      return;
    }

    const controller = new AbortController();
    const handler = setTimeout(async () => {
      try {
        setStatus("loading");
        const response = await fetch("/api/preview/mdx", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("preview failed");
        }

        const data = (await response.json()) as { html: string };
        setHtml(data.html);
        setStatus("idle");
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error(error);
          setStatus("error");
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(handler);
    };
  }, [content]);

  if (status === "loading") {
    return <p className="text-xs text-[var(--text-secondary)]">渲染预览中...</p>;
  }

  if (status === "error") {
    return <p className="text-xs text-red-500">预览失败，请检查 MDX 语法。</p>;
  }

  if (!html) {
    return <p className="text-xs text-[var(--text-secondary)]">编写内容后即可在此预览效果。</p>;
  }

  return (
    <div
      className="prose prose-sm max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

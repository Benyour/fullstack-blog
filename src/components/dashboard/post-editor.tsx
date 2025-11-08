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

type MarkdownActionId = "heading" | "bold" | "italic" | "quote" | "code" | "list" | "link" | "image";

type MarkdownAction = {
  id: MarkdownActionId;
  label: string;
  hint: string;
};

const markdownActions: MarkdownAction[] = [
  { id: "heading", label: "H2", hint: "插入二级标题" },
  { id: "bold", label: "B", hint: "加粗" },
  { id: "italic", label: "I", hint: "斜体" },
  { id: "quote", label: "\u2033", hint: "引用" },
  { id: "list", label: "\u2022", hint: "无序列表" },
  { id: "code", label: "</>", hint: "代码块" },
  { id: "link", label: "链接", hint: "插入链接" },
  { id: "image", label: "🖼", hint: "上传并插入图片" },
];

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

const AUTOSAVE_INTERVAL = 60;

const COMMON_TAG_LIMIT = 8;
const SCHEDULING_TICK_MS = 1000;

export function PostEditor({ mode, postId, initialData, availableTags }: PostEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inlineImageInputRef = useRef<HTMLInputElement | null>(null);
  const contentRef = useRef<HTMLTextAreaElement | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [inlineUploadState, setInlineUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [inlineUploadMessage, setInlineUploadMessage] = useState<string | null>(null);
  const [view, setView] = useState<"write" | "preview">("write");
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags ?? []);
  const [tagQuery, setTagQuery] = useState("");
  const [showChecklist, setShowChecklist] = useState(false);
  const [checklistState, setChecklistState] = useState<"idle" | "running" | "done" | "error">("idle");
  const [checklistResult, setChecklistResult] = useState<{
    issues: string[];
    suggestions: string[];
    slugConflict?: boolean;
    shareUrl?: string;
  } | null>(null);
  const [draftStatus, setDraftStatus] = useState<string>("草稿自动保存已启用");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [scheduledCountdown, setScheduledCountdown] = useState<string | null>(null);
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

  const {
    ref: contentFieldRef,
    ...contentField
  } = register("content");

  const watchedValues = watch();
  const contentValue = watchedValues.content ?? "";
  const scheduledAtInput = watchedValues.scheduledAt;

  // Hydrate from local draft
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
      setLastSavedAt(Date.now());
    } catch (error) {
      console.error("Failed to restore draft", error);
    }
  }, [initialData, reset, storageKey]);

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
      setLastSavedAt(Date.now());
    }, 800);

    return () => clearTimeout(handle);
  }, [watchedValues, selectedTags, storageKey]);

  useEffect(() => {
    if (!scheduledAtInput) {
      setScheduledCountdown(null);
      return;
    }
    const target = new Date(scheduledAtInput).getTime();
    if (Number.isNaN(target)) {
      setScheduledCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setScheduledCountdown("即将发布");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const parts = [
        hours > 0 ? `${hours} 小时` : null,
        minutes > 0 ? `${minutes} 分钟` : null,
        `${seconds} 秒`,
      ].filter(Boolean);
      setScheduledCountdown(`距离发布约 ${parts.join(" ")}`);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, SCHEDULING_TICK_MS);
    return () => window.clearInterval(timer);
  }, [scheduledAtInput]);

  const formattedLastSaved = useMemo(() => {
    if (!lastSavedAt) return "";
    return new Date(lastSavedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  }, [lastSavedAt]);

  const readingMinutes = useMemo(() => calculateReadingMinutes(contentValue), [contentValue]);

  const recommendedTags = useMemo(() => {
    const normalizedQuery = tagQuery.trim().toLowerCase();
    return availableTags
      .filter((tag) => !selectedTags.includes(tag.slug))
      .filter((tag) =>
        normalizedQuery ? tag.name.toLowerCase().includes(normalizedQuery) || tag.slug.includes(normalizedQuery) : true,
      )
      .slice(0, 10);
  }, [availableTags, selectedTags, tagQuery]);

  const commonTags = useMemo(
    () => availableTags.filter((tag) => !selectedTags.includes(tag.slug)).slice(0, COMMON_TAG_LIMIT),
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

  const insertSnippet = (insertText: string, highlightStart?: number, highlightEnd?: number) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = textarea.value;
    const nextValue = value.slice(0, start) + insertText + value.slice(end);
    setValue("content", nextValue, { shouldDirty: true, shouldValidate: true });

    requestAnimationFrame(() => {
      textarea.focus();
      const selectionStart = highlightStart !== undefined ? start + highlightStart : start + insertText.length;
      const selectionEnd = highlightEnd !== undefined ? start + highlightEnd : start + insertText.length;
      textarea.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const applyMarkdown = (action: MarkdownActionId) => {
    const textarea = contentRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const value = textarea.value;
    const selected = value.slice(start, end);

    switch (action) {
      case "heading": {
        const text = selected || "在此输入标题";
        insertSnippet(`## ${text}`, selected ? undefined : 3, selected ? undefined : 3 + text.length);
        break;
      }
      case "bold": {
        const text = selected || "加粗文本";
        insertSnippet(`**${text}**`, selected ? undefined : 2, selected ? undefined : 2 + text.length);
        break;
      }
      case "italic": {
        const text = selected || "斜体文本";
        insertSnippet(`*${text}*`, selected ? undefined : 1, selected ? undefined : 1 + text.length);
        break;
      }
      case "quote": {
        const text = selected || "引用内容";
        const formatted = text
          .split("\n")
          .map((line) => (line.trim() ? `> ${line}` : ">"))
          .join("\n");
        insertSnippet(formatted, selected ? undefined : 2, selected ? undefined : formatted.length);
        break;
      }
      case "list": {
        const text = selected || "列表示例";
        const formatted = text
          .split("\n")
          .map((line) => (line.trim() ? `- ${line}` : "- 项目"))
          .join("\n");
        insertSnippet(formatted, selected ? undefined : 2, selected ? undefined : formatted.length);
        break;
      }
      case "code": {
        const text = selected || "在此输入代码";
        const snippet = `\n\
\`\`\`
${text}
\`\`\`
`;
        insertSnippet(snippet, selected ? undefined : 5, selected ? undefined : 5 + text.length);
        break;
      }
      case "link": {
        const text = selected || "链接文字";
        insertSnippet(`[${text}](https://)`, selected ? undefined : 1, selected ? undefined : 1 + text.length);
        break;
      }
      case "image": {
        inlineImageInputRef.current?.click();
        break;
      }
      default:
        break;
    }
  };

  const handleInlineUpload = async (file: File) => {
    try {
      setInlineUploadState("uploading");
      setInlineUploadMessage("图片上传中...");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "inline-images");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = (await response.json()) as { url: string };
      const placeholder = "图片描述";
      insertSnippet(`![${placeholder}](${data.url})`, 2, 2 + placeholder.length);
      setInlineUploadState("idle");
      setInlineUploadMessage("图片已插入，记得补充描述~");
    } catch (error) {
      console.error(error);
      setInlineUploadState("error");
      setInlineUploadMessage("图片上传失败，请稍后再试");
    } finally {
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = "";
      }
    }
  };

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
    setTagQuery("");
  };

  const removeTag = (tag: string) => {
    setSelectedTags((prev) => prev.filter((item) => item !== tag));
  };

  const runPreflightCheck = async () => {
    setShowChecklist(true);
    setChecklistState("running");
    setChecklistResult(null);

    try {
      const issues: string[] = [];
      const suggestions: string[] = [];

      if (!watchedValues.title.trim()) {
        issues.push("标题为空，请完善");
      }
      if (!watchedValues.slug.trim()) {
        issues.push("Slug 为空，建议填写英文短语");
      }
      if (selectedTags.length === 0) {
        suggestions.push("为文章添加至少 1 个标签，方便分类");
      }
      if (watchedValues.summary.trim().length < 20) {
        suggestions.push("摘要较短，可进一步补充核心信息（>=20 字）");
      }
      if (watchedValues.content.trim().length < 200) {
        suggestions.push("正文篇幅较短，建议扩展内容或补充细节");
      }

      let slugConflict = false;
      if (watchedValues.slug.trim()) {
        try {
          const response = await fetch(`/api/posts/${watchedValues.slug.trim()}`);
          if (response.ok) {
            const existing = (await response.json()) as { id: string };
            if (!postId || existing.id !== postId) {
              slugConflict = true;
              issues.push("Slug 已存在，请更换");
            }
          }
        } catch (error) {
          console.error("Slug check failed", error);
        }
      }

      const shareUrl = (() => {
        if (!watchedValues.slug.trim()) return undefined;
        const origin = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL;
        if (!origin) return undefined;
        return `${origin.replace(/\/?$/, "")}/blog/${watchedValues.slug.trim()}`;
      })();

      setChecklistResult({ issues, suggestions, slugConflict, shareUrl });
      setChecklistState("done");
    } catch (error) {
      console.error(error);
      setChecklistState("error");
    }
  };

  const scrollContent = (direction: "top" | "bottom") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    textarea.scrollTo({
      top: direction === "top" ? 0 : textarea.scrollHeight,
      behavior: "smooth",
    });
  };

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6 text-sm">
        <WritingGuidance scheduledCountdown={scheduledCountdown} />

        <div className="grid gap-2">
          <label className="font-medium text-[var(--text-primary)]" htmlFor="title">
            标题
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              id="title"
              className="input-field"
              placeholder="输入标题"
              enterKeyHint="next"
              {...register("title")}
            />
            <button
              type="button"
              className="btn-outline flex justify-center px-4 py-2 text-xs font-medium"
              onClick={() => {
                const generated = slugify(watchedValues.title ?? "");
                if (generated) {
                  setValue("slug", generated, { shouldDirty: true, shouldValidate: true });
                }
              }}
            >
              生成 Slug
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
            className="input-field"
            placeholder="例如：nextjs-best-practices"
            inputMode="url"
            enterKeyHint="next"
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
            className="input-field min-h-[120px]"
            placeholder="简要说明文章核心内容"
            enterKeyHint="next"
            {...register("summary")}
          />
          {errors.summary && <p className="text-xs text-red-500">{errors.summary.message}</p>}
        </div>

        <WritingTipsCard />

        <div className="grid gap-2">
          <label className="font-medium text-[var(--text-primary)]" htmlFor="coverImage">
            封面图 URL
          </label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              id="coverImage"
              className="input-field"
              placeholder="https://..."
              inputMode="url"
              enterKeyHint="next"
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
              className="btn-outline flex justify-center px-4 py-2 text-xs font-medium"
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
            {selectedTags.length === 0 && <span className="text-xs text-[var(--text-secondary)]">尚未选择标签，可在下方快速添加。</span>}
          </div>

          <div className="relative">
            <input
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && tagQuery.trim()) {
                  event.preventDefault();
                  addTag(tagQuery.trim());
                }
              }}
              className="input-field"
              placeholder="输入标签名称后回车添加"
              inputMode="text"
              enterKeyHint="done"
            />
            {tagQuery.trim() && recommendedTags.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] shadow-lg">
                <ul className="divide-y divide-[var(--surface-border)] text-xs">
                  {recommendedTags.map((tag) => (
                    <li key={tag.id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-[var(--surface-muted)]"
                        onClick={() => addTag(tag.slug)}
                      >
                        <span>{tag.name}</span>
                        <span className="text-[var(--text-secondary)]">#{tag.slug}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {commonTags.length > 0 && (
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <p>常用标签（手机端可直接勾选）：</p>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    className={`rounded-full border px-3 py-1 ${
                      selectedTags.includes(tag.slug)
                        ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
                        : "border-[var(--surface-border)] text-[var(--text-secondary)]"
                    }`}
                    onClick={() => addTag(tag.slug)}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium text-[var(--text-primary)]">正文（支持 MDX）</span>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setView("write")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  view === "write" ? "bg-[var(--surface-border)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                写作
              </button>
              <button
                type="button"
                onClick={() => setView("preview")}
                className={`rounded-full px-3 py-1 font-semibold ${
                  view === "preview" ? "bg-[var(--surface-border)] text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
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
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 text-xs sm:gap-3 sm:px-4 sm:py-3 sm:text-sm">
                {markdownActions.map((action) => (
                  <button
                    key={action.id}
                    type="button"
                    title={action.hint}
                    className="rounded-full border border-[var(--surface-border)] bg-[var(--surface-background)] px-3 py-1 font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    onClick={() => applyMarkdown(action.id)}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              {inlineUploadMessage && (
                <p
                  className={`text-xs ${
                    inlineUploadState === "error"
                      ? "text-red-500"
                      : inlineUploadState === "uploading"
                      ? "text-[var(--text-secondary)]"
                      : "text-emerald-500"
                  }`}
                >
                  {inlineUploadMessage}
                </p>
              )}
              <div className="relative">
                <textarea
                  id="content"
                  rows={16}
                  className="input-field min-h-[280px] font-mono text-xs leading-relaxed"
                  placeholder="## 标题\n\n内容..."
                  {...contentField}
                  ref={(element) => {
                    contentRef.current = element;
                    contentFieldRef(element);
                  }}
                />
                <div className="pointer-events-none absolute inset-y-2 right-2 flex flex-col gap-2">
                  <button
                    type="button"
                    className="pointer-events-auto rounded-full bg-white/80 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur hover:bg-white"
                    onClick={() => scrollContent("top")}
                  >
                    ↑ 顶部
                  </button>
                  <button
                    type="button"
                    className="pointer-events-auto rounded-full bg-white/80 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur hover:bg-white"
                    onClick={() => scrollContent("bottom")}
                  >
                    ↓ 底部
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-4">
              <MDXPreview content={contentValue} />
            </div>
          )}

          {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]" htmlFor="published">
            <input id="published" type="checkbox" className="h-4 w-4" {...register("published")}
            />
            发布本文（未勾选时保存为草稿）
          </label>

          <div className="grid gap-1">
            <label className="text-sm text-[var(--text-secondary)]" htmlFor="scheduledAt">
              定时发布（可选）
            </label>
            <input
              id="scheduledAt"
              type="datetime-local"
              className="input-field"
              enterKeyHint="done"
              {...register("scheduledAt")}
            />
            {scheduledCountdown && <p className="text-xs text-[var(--accent)]">{scheduledCountdown}</p>}
            <p className="text-xs text-[var(--text-secondary)]">到达指定时间后会自动发布。</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 text-xs text-[var(--text-secondary)] sm:flex-row sm:items-center sm:gap-3">
            <span>{draftStatus}</span>
            {formattedLastSaved && <span>最近保存：{formattedLastSaved}</span>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <button
              type="button"
              className="btn-outline flex w-full justify-center px-5 py-2 text-xs font-medium"
              onClick={() => {
                setChecklistResult(null);
                runPreflightCheck();
              }}
            >
              发布检查
            </button>
            <button
              type="button"
              className="btn-outline flex w-full justify-center px-5 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] sm:w-auto"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem(storageKey);
                  setDraftStatus("本地草稿已清除");
                }
              }}
            >
              清除本地草稿
            </button>
            <button
              type="button"
              className="btn-outline flex w-full justify-center px-5 py-2 text-xs font-medium sm:w-auto"
              onClick={() => {
                setDraftStatus("草稿已保存到本地");
                setLastSavedAt(Date.now());
                const payload = {
                  ...watchedValues,
                  tags: selectedTags,
                };
                localStorage.setItem(storageKey, JSON.stringify(payload));
              }}
            >
              手动保存
            </button>
            <button
              type="submit"
              disabled={state === "loading"}
              className="btn-accent flex w-full justify-center px-6 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {state === "loading" ? "保存中..." : mode === "edit" ? "保存修改" : "发布文章"}
            </button>
          </div>
        </div>
        {state === "success" && <span className="text-xs text-emerald-500">保存成功</span>}
        {state === "error" && <span className="text-xs text-red-500">保存失败，请稍后再试</span>}
      </form>

      <input
        ref={inlineImageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await handleInlineUpload(file);
          }
        }}
      />

      <PrepublishChecklist
        open={showChecklist}
        onClose={() => {
          setShowChecklist(false);
          setChecklistState("idle");
          setChecklistResult(null);
        }}
        state={checklistState}
        result={checklistResult}
      />
    </>
  );
}

function WritingGuidance({ scheduledCountdown }: { scheduledCountdown: string | null }) {
  return (
    <section className="rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 text-xs text-[var(--text-secondary)] sm:panel-muted sm:border-transparent sm:p-0 sm:text-sm">
      <details className="sm:hidden">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
          写作提示
          <span className="text-xs text-[var(--text-secondary)]">展开</span>
        </summary>
        <div className="mt-3 space-y-3">
          <div className="space-y-2">
            <p className="font-semibold text-[var(--text-primary)]">写作提示</p>
            <ul className="space-y-1">
              <li>· 开头使用 2-3 句引出问题，结尾附上行动建议或资源链接。</li>
              <li>· 检查每个小节标题是否包含核心关键词，段落不超过 5 行。</li>
              <li>· 确认文中包含至少 1 个代码/示例或图示说明。</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-[var(--text-primary)]">SEO 建议</p>
            <ul className="space-y-1">
              <li>· Meta 标题不超过 60 字符，确保摘要涵盖关键词。</li>
              <li>· 若引用外部资料，请补充链接并加上 rel="nofollow"。</li>
              <li>· 添加封面图 Alt 文案，便于搜索引擎识别。</li>
            </ul>
            {scheduledCountdown && <p className="text-[var(--accent)]">{scheduledCountdown}</p>}
          </div>
        </div>
      </details>

      <div className="hidden gap-6 text-sm text-[var(--text-secondary)] sm:grid sm:grid-cols-[minmax(0,1fr),minmax(0,0.8fr)]">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--text-primary)]">写作提示</p>
          <ul className="space-y-1">
            <li>· 开头使用 2-3 句引出问题，结尾附上行动建议或资源链接。</li>
            <li>· 检查每个小节标题是否包含核心关键词，段落不超过 5 行。</li>
            <li>· 确认文中包含至少 1 个代码/示例或图示说明。</li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--text-primary)]">SEO 建议</p>
          <ul className="space-y-1">
            <li>· Meta 标题不超过 60 字符，确保摘要涵盖关键词。</li>
            <li>· 若引用外部资料，请补充链接并加上 rel="nofollow"。</li>
            <li>· 添加封面图 Alt 文案，便于搜索引擎识别。</li>
          </ul>
          {scheduledCountdown && <p className="text-xs text-[var(--accent)]">{scheduledCountdown}</p>}
        </div>
      </div>
    </section>
  );
}

function WritingTipsCard() {
  return (
    <section className="rounded-2xl border border-dashed border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 text-xs text-[var(--text-secondary)]">
      <details className="sm:hidden">
        <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-[var(--text-primary)]">
          快速检查
          <span className="text-xs text-[var(--text-secondary)]">展开</span>
        </summary>
        <ul className="mt-3 space-y-1">
          <li>· 文章是否具备吸引人的开篇与清晰的结构？</li>
          <li>· 是否补充了 Meta 标题、描述及封面图 Alt？</li>
          <li>· 是否添加了 CTA（订阅、联系或下一步行动）？</li>
        </ul>
      </details>
      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-[var(--text-primary)]">快速检查</p>
        <ul className="mt-2 space-y-1">
          <li>· 文章是否具备吸引人的开篇与清晰的结构？</li>
          <li>· 是否补充了 Meta 标题、描述及封面图 Alt？</li>
          <li>· 是否添加了 CTA（订阅、联系或下一步行动）？</li>
        </ul>
      </div>
    </section>
  );
}

function PrepublishChecklist({
  open,
  onClose,
  state,
  result,
}: {
  open: boolean;
  onClose: () => void;
  state: "idle" | "running" | "done" | "error";
  result: {
    issues: string[];
    suggestions: string[];
    slugConflict?: boolean;
    shareUrl?: string;
  } | null;
}) {
  if (!open) return null;

  const shareUrl = result?.shareUrl;
  const shareLinks = shareUrl
    ? [
        {
          label: "复制链接",
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(shareUrl);
              alert("链接已复制");
            } catch (error) {
              console.error(error);
              alert("复制失败，请手动复制");
            }
          },
        },
        {
          label: "分享到 Twitter",
          href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`,
        },
        {
          label: "分享到 LinkedIn",
          href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        },
      ]
    : [];

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">发布检查</h3>
          <button type="button" className="text-xs text-[var(--text-secondary)]" onClick={onClose}>
            关闭
          </button>
        </div>

        {state === "running" && <p className="mt-4 text-xs text-[var(--text-secondary)]">正在检查，请稍候…</p>}
        {state === "error" && <p className="mt-4 text-xs text-red-500">检查失败，请稍后重试。</p>}

        {state === "done" && result && (
          <div className="mt-4 space-y-4 text-xs text-[var(--text-secondary)]">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">必须解决的问题</p>
              {result.issues.length === 0 ? (
                <p className="mt-2 rounded-xl bg-emerald-500/10 p-3 text-emerald-600">未发现阻塞问题，准备发布！</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {result.issues.map((issue) => (
                    <li key={issue} className="rounded-xl bg-rose-500/10 p-3 text-rose-600">
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">优化建议</p>
              {result.suggestions.length === 0 ? (
                <p className="mt-2 rounded-xl bg-[var(--surface-muted)] p-3">当前内容已满足基础要求。</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {result.suggestions.map((suggestion) => (
                    <li key={suggestion} className="rounded-xl bg-[var(--surface-muted)] p-3">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {shareLinks.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-[var(--text-primary)]">发布后操作</p>
                <div className="flex flex-wrap gap-2">
                  {shareLinks.map((item) =>
                    item.href ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline px-3 py-1"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <button key={item.label} type="button" onClick={item.onClick} className="btn-outline px-3 py-1">
                        {item.label}
                      </button>
                    ),
                  )}
                </div>
                <p className="text-[var(--text-secondary)]">预览链接：{shareUrl}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
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

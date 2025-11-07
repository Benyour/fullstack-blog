"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";

import { upsertPostSchema } from "@/lib/validators/post";

type EditorMode = "create" | "edit";

const editorSchema = z.object({
  title: upsertPostSchema.shape.title,
  slug: upsertPostSchema.shape.slug,
  summary: upsertPostSchema.shape.summary,
  content: upsertPostSchema.shape.content,
  coverImage: upsertPostSchema.shape.coverImage,
  published: z.boolean(),
  tagsInput: z.string().optional(),
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
    tags: string[];
  };
};

export function PostEditor({ mode, postId, initialData }: PostEditorProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditorFormValues>({
    resolver: zodResolver(editorSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      slug: initialData?.slug ?? "",
      summary: initialData?.summary ?? "",
      content: initialData?.content ?? "",
      coverImage: initialData?.coverImage ?? "",
      published: initialData?.published ?? false,
      tagsInput: initialData?.tags.join(", ") ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const tags = values.tagsInput
      ? values.tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const payload = {
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      content: values.content,
      coverImage: values.coverImage || undefined,
      published: values.published,
      tags,
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

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-sm">
      <div className="grid gap-2">
        <label className="font-medium text-slate-600 dark:text-slate-200" htmlFor="title">
          标题
        </label>
        <input
          id="title"
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          placeholder="输入标题"
          {...register("title")}
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-slate-600 dark:text-slate-200" htmlFor="slug">
          Slug
        </label>
        <input
          id="slug"
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          placeholder="例如：my-first-post"
          {...register("slug")}
        />
        {errors.slug && <p className="text-xs text-red-500">{errors.slug.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-slate-600 dark:text-slate-200" htmlFor="summary">
          摘要
        </label>
        <textarea
          id="summary"
          rows={3}
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          placeholder="简要说明文章核心内容"
          {...register("summary")}
        />
        {errors.summary && <p className="text-xs text-red-500">{errors.summary.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-slate-600 dark:text-slate-200" htmlFor="coverImage">
          封面图 URL
        </label>
        <input
          id="coverImage"
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          placeholder="https://..."
          {...register("coverImage")}
        />
        {errors.coverImage && <p className="text-xs text-red-500">{errors.coverImage.message}</p>}
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-slate-600 dark:text-slate-200" htmlFor="tagsInput">
          标签（用逗号分隔）
        </label>
        <input
          id="tagsInput"
          className="rounded-lg border border-slate-200 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          placeholder="nextjs, 性能优化"
          {...register("tagsInput")}
        />
      </div>

      <div className="grid gap-2">
        <label className="font-medium text-slate-600 dark:text-slate-200" htmlFor="content">
          正文（支持 MDX）
        </label>
        <textarea
          id="content"
          rows={16}
          className="rounded-xl border border-slate-200 px-3 py-3 font-mono text-xs leading-relaxed focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          placeholder="## 标题\n\n内容..."
          {...register("content")}
        />
        {errors.content && <p className="text-xs text-red-500">{errors.content.message}</p>}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input type="checkbox" {...register("published")} />
        发布
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "loading"}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? "保存中..." : mode === "edit" ? "保存修改" : "发布文章"}
        </button>
        {state === "success" && <span className="text-xs text-green-600">保存成功</span>}
        {state === "error" && <span className="text-xs text-red-500">保存失败，请稍后再试</span>}
      </div>
    </form>
  );
}


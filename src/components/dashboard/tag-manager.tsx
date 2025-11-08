"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { slugify } from "@/lib/utils";

type TagItem = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

type TagManagerProps = {
  initialTags: TagItem[];
};

export function TagManager({ initialTags }: TagManagerProps) {
  const router = useRouter();
  const [tags, setTags] = useState(initialTags);
  const [formState, setFormState] = useState<"idle" | "submitting" | "error" | "success">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();

    if (!name) {
      setMessage("标签名称不能为空");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setMessage(null);

    try {
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug: slug ? slugify(slug) : slugify(name),
        }),
      });

      if (!response.ok) {
        throw new Error("创建失败");
      }

      const data = (await response.json()) as TagItem;
      setTags((prev) => [...prev, { ...data, postCount: 0 }].sort((a, b) => a.name.localeCompare(b.name)));
      setFormState("success");
      setMessage("标签创建成功");
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormState("error");
      setMessage("创建标签失败");
    }
  }

  async function handleUpdate(id: string, values: { name: string; slug: string }) {
    try {
      setFormState("submitting");
      const response = await fetch(`/api/tags/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("更新失败");
      }

      const data = await response.json();
      setTags((prev) =>
        prev
          .map((tag) => (tag.id === id ? { ...tag, name: data.name, slug: data.slug } : tag))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setFormState("success");
      setMessage("标签已更新");
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormState("error");
      setMessage("更新失败，请稍后重试");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定要删除该标签吗？相关文章的标签将一并移除。")) {
      return;
    }

    try {
      setFormState("submitting");
      const response = await fetch(`/api/tags/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("删除失败");
      }

      setTags((prev) => prev.filter((tag) => tag.id !== id));
      setFormState("success");
      setMessage("标签已删除");
      router.refresh();
    } catch (error) {
      console.error(error);
      setFormState("error");
      setMessage("删除失败，请稍后重试");
    }
  }

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">已有标签</h2>
        <div className="divide-y divide-[var(--surface-border)] rounded-2xl border border-[var(--surface-border)]">
          {tags.length === 0 && (
            <p className="p-6 text-sm text-[var(--text-secondary)]">暂无标签，先在下方创建一个吧。</p>
          )}
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onUpdate={handleUpdate} onDelete={handleDelete} disabled={formState === "submitting"} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-[var(--text-primary)]">新增标签</h2>
        <form
          className="grid gap-3 rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-muted)] p-4 md:grid-cols-[1fr,1fr,auto]"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            handleCreate(formData);
            event.currentTarget.reset();
          }}
        >
          <div className="grid gap-1">
            <label htmlFor="tag-name" className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              名称
            </label>
            <input
              id="tag-name"
              name="name"
              required
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
              placeholder="例如：性能优化"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="tag-slug" className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">
              Slug
            </label>
            <input
              id="tag-slug"
              name="slug"
              className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
              placeholder="performance"
            />
            <p className="text-xs text-[var(--text-secondary)]">留空将自动生成。</p>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-full bg-[var(--text-primary)] px-4 py-2 font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={formState === "submitting"}
            >
              {formState === "submitting" ? "创建中..." : "创建标签"}
            </button>
          </div>
        </form>
        {message && <p className={`text-xs ${formState === "error" ? "text-red-500" : "text-emerald-500"}`}>{message}</p>}
      </section>
    </div>
  );
}

function TagRow({
  tag,
  onUpdate,
  onDelete,
  disabled,
}: {
  tag: TagItem;
  onUpdate: (id: string, values: { name: string; slug: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  disabled: boolean;
}) {
  const [name, setName] = useState(tag.name);
  const [slug, setSlug] = useState(tag.slug);
  const [editing, setEditing] = useState(false);

  const hasChanges = name !== tag.name || slug !== tag.slug;

  const handleSave = async () => {
    if (!hasChanges) {
      setEditing(false);
      return;
    }
    await onUpdate(tag.id, {
      name,
      slug: slugify(slug || name),
    });
    setEditing(false);
  };

  return (
    <div className="grid gap-2 p-4 md:grid-cols-[minmax(0,2fr),minmax(0,1fr),auto] md:items-center">
      <div className="grid gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">名称</label>
        <input
          className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          value={name}
          onChange={(event) => {
            setEditing(true);
            setName(event.target.value);
          }}
          disabled={disabled}
        />
      </div>
      <div className="grid gap-1">
        <label className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-secondary)]">Slug</label>
        <input
          className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          value={slug}
          onChange={(event) => {
            setEditing(true);
            setSlug(event.target.value);
          }}
          disabled={disabled}
        />
      </div>
      <div className="flex items-center justify-end gap-2 text-xs">
        <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-[var(--text-secondary)]">
          {tag.postCount} 篇文章
        </span>
        {editing ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={disabled}
            className="rounded-full bg-emerald-500 px-4 py-1 font-medium text-white transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            保存
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDelete(tag.id)}
            disabled={disabled || tag.postCount > 0}
            className="rounded-full bg-red-500 px-4 py-1 font-medium text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
            title={tag.postCount > 0 ? "存在关联文章，删除前请先移除文章中的标签" : "删除标签"}
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
}


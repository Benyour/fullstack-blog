import Link from "next/link";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import { cn } from "@/lib/utils";

type Tag = {
  id?: string;
  name: string;
  slug: string;
};

type PostSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  publishedAt: Date | null;
  tags: Tag[];
};

export function PostCard({ post, className }: { post: PostSummary; className?: string }) {
  const dateLabel = post.publishedAt
    ? format(post.publishedAt, "yyyy年MM月dd日", { locale: zhCN })
    : "草稿";

  return (
    <article
      className={cn(
        "group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{dateLabel}</span>
        <div className="flex gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.slug}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
      <Link href={`/blog/${post.slug}`} className="mt-3 block">
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-slate-900 transition group-hover:text-slate-700 dark:text-slate-50 dark:group-hover:text-slate-100">
          {post.title}
        </h3>
      </Link>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{post.summary}</p>
      <Link
        href={`/blog/${post.slug}`}
        className="mt-4 inline-flex items-center text-sm font-medium text-sky-600 transition hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
      >
        阅读全文 →
      </Link>
    </article>
  );
}


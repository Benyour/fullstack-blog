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
        "panel group flex h-full flex-col gap-4 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-strong)]",
        className,
      )}
    >
      <div className="flex items-center justify-between text-[0.78rem] text-[var(--text-secondary)]">
        <span>{dateLabel}</span>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag.slug} className="chip text-xs">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
      <Link href={`/blog/${post.slug}`} className="block">
        <h3 className="break-words text-xl font-semibold leading-snug tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--accent)]">
          {post.title}
        </h3>
      </Link>
      <p className="clamp-3 break-words text-sm leading-relaxed text-[var(--text-secondary)] overflow-hidden">{post.summary}</p>
      <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]">
        阅读全文
        <span aria-hidden className="transition group-hover:translate-x-1">→</span>
      </Link>
    </article>
  );
}


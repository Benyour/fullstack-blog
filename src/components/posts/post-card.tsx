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
  readingMinutes?: number;
  stats?: {
    likes: number;
    comments: number;
  };
};

export function PostCard({ post, className }: { post: PostSummary; className?: string }) {
  const dateLabel = post.publishedAt
    ? format(post.publishedAt, "yyyy年MM月dd日", { locale: zhCN })
    : "草稿";

  return (
    <article
      className={cn(
        "panel group flex h-full flex-col gap-3 p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-strong)] sm:gap-4 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-[0.78rem] text-[var(--text-secondary)]">
        <div className="flex items-center gap-2">
          <span>{dateLabel}</span>
          {post.readingMinutes ? <span>· {post.readingMinutes} 分钟</span> : null}
        </div>
        <div className="flex flex-wrap gap-2 text-[0.7rem]">
          {post.tags.map((tag) => (
            <span key={tag.slug} className="chip text-xs">
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
      <Link href={`/blog/${post.slug}`} className="block">
        <h3 className="break-words text-lg font-semibold leading-snug tracking-tight text-[var(--text-primary)] transition group-hover:text-[var(--accent)] sm:text-xl">
          {post.title}
        </h3>
      </Link>
      <p className="clamp-3 break-words text-sm leading-relaxed text-[var(--text-secondary)] overflow-hidden">{post.summary}</p>
      {post.stats && (
        <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
          <span>👍 {post.stats.likes}</span>
          <span>💬 {post.stats.comments}</span>
        </div>
      )}
      <Link href={`/blog/${post.slug}`} className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-hover)]">
        阅读全文
        <span aria-hidden className="transition group-hover:translate-x-1">→</span>
      </Link>
    </article>
  );
}


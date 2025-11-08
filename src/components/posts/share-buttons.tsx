"use client";

import { useState } from "react";

type ShareButtonsProps = {
  title: string;
  url: string;
};

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        console.error(error);
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] px-4 py-2 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
    >
      <span aria-hidden>🔗</span>
      <span>{copied ? "链接已复制" : "分享给朋友"}</span>
    </button>
  );
}


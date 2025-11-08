"use client";

import { useEffect, useState } from "react";

type LikeButtonProps = {
  postId: string;
  initialLikes: number;
};

const STORAGE_KEY = "liked-posts";

export function LikeButton({ postId, initialLikes }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as string[];
      setLiked(parsed.includes(postId));
    } catch (error) {
      console.error(error);
    }
  }, [postId]);

  async function persistLike(newState: boolean) {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    let parsed: string[] = [];
    if (stored) {
      try {
        parsed = JSON.parse(stored) as string[];
      } catch (error) {
        console.error(error);
      }
    }
    if (newState) {
      if (!parsed.includes(postId)) {
        parsed.push(postId);
      }
    } else {
      parsed = parsed.filter((id) => id !== postId);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  }

  async function toggleLike() {
    const previousLiked = liked;
    const previousLikes = likes;
    try {
      setLoading(true);
      const nextLiked = !previousLiked;
      setLiked(nextLiked);
      setLikes((prev) => Math.max(0, prev + (nextLiked ? 1 : -1)));
      await persistLike(nextLiked);

      const response = await fetch(`/api/posts/${postId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });

      if (!response.ok) {
        throw new Error("请求失败");
      }
    } catch (error) {
      console.error(error);
      setLiked(previousLiked);
      setLikes(previousLikes);
      await persistLike(previousLiked);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleLike}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-sm font-medium transition ${
        liked
          ? "border-[var(--accent)] bg-[var(--accent-muted)] text-[var(--accent)]"
          : "border-[var(--surface-border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      }`}
    >
      <span aria-hidden>{liked ? "❤️" : "🤍"}</span>
      <span>{likes}</span>
    </button>
  );
}


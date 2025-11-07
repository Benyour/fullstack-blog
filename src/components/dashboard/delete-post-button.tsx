"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function DeletePostButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (!confirm("确定要删除这篇文章吗？")) return;

    startTransition(async () => {
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("删除失败，请稍后再试。");
        return;
      }

      router.refresh();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-full border border-rose-200/60 bg-rose-500/10 px-3 py-1 text-xs font-medium text-rose-500 transition hover:border-rose-300 hover:bg-rose-500/20 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
    >
      删除
    </button>
  );
}


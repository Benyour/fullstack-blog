"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { subscribeSchema } from "@/lib/validators/newsletter";

type FormValues = z.infer<typeof subscribeSchema>;

export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(subscribeSchema),
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    try {
      setStatus("loading");
      setMessage(null);
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("订阅失败");
      }

      setStatus("success");
      setMessage("订阅成功！有新文章时会第一时间通知你。");
      reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
      setMessage("订阅失败，请稍后再试。");
    } finally {
      setTimeout(() => setStatus("idle"), 4000);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-sm">
      <div className="grid gap-2 md:grid-cols-[1fr,auto]">
        <input
          type="email"
          placeholder="输入邮箱，订阅新文章"
          className="input-field rounded-full"
          {...register("email")}
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-accent flex items-center justify-center px-6 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "订阅中..." : "订阅"}
        </button>
      </div>
      {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      {message && (
        <p className={`text-xs ${status === "error" ? "text-red-500" : "text-emerald-500"}`}>
          {message}
        </p>
      )}
    </form>
  );
}


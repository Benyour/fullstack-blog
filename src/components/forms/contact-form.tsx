"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { contactFormSchema, type ContactFormInput } from "@/lib/validators/contact";

export function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setState("loading");
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      setState("success");
      reset();
    } catch (error) {
      console.error(error);
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 4000);
    }
  });

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-semibold text-[var(--text-secondary)]">
          称呼
        </label>
        <input
          id="name"
          className="input-field"
          {...register("name")}
          placeholder="例如：张亚斌"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-semibold text-[var(--text-secondary)]">
          邮箱
        </label>
        <input
          id="email"
          type="email"
          className="input-field"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm font-semibold text-[var(--text-secondary)]">
          留言
        </label>
        <textarea
          id="message"
          rows={4}
          className="input-field resize-none py-3"
          {...register("message")}
          placeholder="告诉我你的项目或想法，我们一起聊聊。"
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      <button type="submit" disabled={state === "loading"} className="btn-accent inline-flex items-center justify-center px-5 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
        {state === "loading" ? "发送中..." : "发送"}
      </button>

      {state === "success" && <p className="text-sm text-green-600">信息已送达，我会尽快回复你！</p>}
      {state === "error" && <p className="text-sm text-red-500">提交失败，请稍后重试。</p>}
    </form>
  );
}


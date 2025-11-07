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
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          称呼
        </label>
        <input
          id="name"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          {...register("name")}
          placeholder="例如：张亚斌"
        />
        {errors.name && (
          <p className="text-xs text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          邮箱
        </label>
        <input
          id="email"
          type="email"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          {...register("email")}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          留言
        </label>
        <textarea
          id="message"
          rows={4}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-950"
          {...register("message")}
          placeholder="告诉我你的项目或想法，我们一起聊聊。"
        />
        {errors.message && (
          <p className="text-xs text-red-500">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "loading" ? "发送中..." : "发送"}
      </button>

      {state === "success" && <p className="text-sm text-green-600">信息已送达，我会尽快回复你！</p>}
      {state === "error" && <p className="text-sm text-red-500">提交失败，请稍后重试。</p>}
    </form>
  );
}


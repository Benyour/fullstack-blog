"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
});

type EmailInput = z.infer<typeof emailSchema>;

export function LoginButtons() {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
  });

  const onEmailSubmit = handleSubmit(async ({ email }) => {
    try {
      setState("loading");
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      setState("sent");
      reset();
    } catch (error) {
      console.error(error);
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), 5000);
    }
  });

  return (
    <div className="space-y-6">
      <button
        onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
        className="btn-accent flex w-full gap-2 px-5 py-2 text-sm font-semibold"
        type="button"
      >
        使用 GitHub 登录
      </button>

      <div className="h-px bg-slate-200 dark:bg-slate-700" />

      <form onSubmit={onEmailSubmit} className="space-y-3 text-sm">
        <label className="block text-slate-600 dark:text-slate-300" htmlFor="email">
          或者使用邮箱魔法链接登录
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          className="input-field rounded-full"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        <button
          type="submit"
          disabled={state === "loading"}
          className="btn-outline flex w-full justify-center px-5 py-2 font-medium disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? "发送中..." : "发送登录邮件"}
        </button>
        {state === "sent" && <p className="text-xs text-green-600">邮件已发送，请检查你的收件箱。</p>}
        {state === "error" && <p className="text-xs text-red-500">发送失败，请稍后再试。</p>}
      </form>
    </div>
  );
}


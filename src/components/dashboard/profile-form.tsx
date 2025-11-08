"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { updateProfileSchema, type UpdateProfileInput } from "@/lib/validators/profile";

type ProfileFormProps = {
  initialData: {
    headline: string;
    bio: string;
    location: string;
    avatarUrl: string;
    heroImage: string;
    userName: string;
    userEmail: string;
  };
};

type FormValues = UpdateProfileInput;

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      headline: initialData.headline,
      bio: initialData.bio,
      location: initialData.location,
      avatarUrl: initialData.avatarUrl,
      heroImage: initialData.heroImage,
      userName: initialData.userName,
      userEmail: initialData.userEmail,
    },
  });

  const avatarUrl = watch("avatarUrl");
  const heroImage = watch("heroImage");

  const onSubmit = handleSubmit(async (values) => {
    try {
      setState("loading");
      setMessage(null);
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("更新失败");
      }

      setState("success");
      setMessage("资料已更新");
      router.refresh();
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage("更新失败，请稍后再试");
    } finally {
      setTimeout(() => setState("idle"), 4000);
    }
  });

  async function handleUpload(file: File, targetField: "avatarUrl" | "heroImage") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", targetField === "avatarUrl" ? "avatars" : "hero");

    try {
      setState("loading");
      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = (await response.json()) as { url: string };
      setValue(targetField, data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setState("success");
      setMessage("图片上传成功");
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage("上传失败，请稍后重试");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 text-sm">
      <section className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="font-medium text-[var(--text-primary)]" htmlFor="userName">
            姓名
          </label>
          <input
            id="userName"
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            {...register("userName")}
          />
          {errors.userName && <p className="text-xs text-red-500">{errors.userName.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="font-medium text-[var(--text-primary)]" htmlFor="userEmail">
            邮箱
          </label>
          <input
            id="userEmail"
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            {...register("userEmail")}
          />
          {errors.userEmail && <p className="text-xs text-red-500">{errors.userEmail.message}</p>}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="font-medium text-[var(--text-primary)]" htmlFor="headline">
            主页标题
          </label>
          <input
            id="headline"
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="你好，我是..."
            {...register("headline")}
          />
          {errors.headline && <p className="text-xs text-red-500">{errors.headline.message}</p>}
        </div>
        <div className="grid gap-2">
          <label className="font-medium text-[var(--text-primary)]" htmlFor="location">
            常驻城市
          </label>
          <input
            id="location"
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
            placeholder="北京 / Remote"
            {...register("location")}
          />
          {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
        </div>
      </section>

      <section className="grid gap-2">
        <label className="font-medium text-[var(--text-primary)]" htmlFor="bio">
          个人简介
        </label>
        <textarea
          id="bio"
          rows={5}
          className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 leading-relaxed focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          placeholder="介绍你的经历、擅长领域，以及正在关注的方向..."
          {...register("bio")}
        />
        {errors.bio && <p className="text-xs text-red-500">{errors.bio.message}</p>}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <ImageUploadField
          label="头像"
          preview={avatarUrl}
          onUpload={async (file) => {
            await handleUpload(file, "avatarUrl");
          }}
          onManualChange={(value) => setValue("avatarUrl", value, { shouldDirty: true, shouldValidate: true })}
          error={errors.avatarUrl?.message}
          placeholder="https://..."
        />
        <ImageUploadField
          label="头图"
          preview={heroImage}
          onUpload={async (file) => {
            await handleUpload(file, "heroImage");
          }}
          onManualChange={(value) => setValue("heroImage", value, { shouldDirty: true, shouldValidate: true })}
          error={errors.heroImage?.message}
          placeholder="https://..."
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="btn-accent flex items-center justify-center px-6 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
          disabled={state === "loading"}
        >
          {state === "loading" ? "保存中..." : "保存修改"}
        </button>
        {message && <span className={`text-xs ${state === "error" ? "text-red-500" : "text-emerald-500"}`}>{message}</span>}
      </div>
    </form>
  );
}

type ImageUploadFieldProps = {
  label: string;
  preview: string;
  onUpload: (file: File) => Promise<void>;
  onManualChange: (value: string) => void;
  placeholder: string;
  error?: string;
};

function ImageUploadField({ label, preview, onUpload, onManualChange, placeholder, error }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="grid gap-2">
      <span className="font-medium text-[var(--text-primary)]">{label}</span>
      {preview && (
        <div className="overflow-hidden rounded-xl border border-[var(--surface-border)] bg-[var(--surface-muted)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={label} className="h-40 w-full object-cover" />
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (file) {
              await onUpload(file);
            }
          }}
        />
        <button
          type="button"
          className="btn-outline flex items-center justify-center px-4 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent)]"
          onClick={() => inputRef.current?.click()}
        >
          上传图片
        </button>
        <input
          type="url"
          className="flex-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-muted)]"
          placeholder={placeholder}
          defaultValue={preview}
          onBlur={(event) => onManualChange(event.target.value)}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}


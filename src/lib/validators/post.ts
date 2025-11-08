import { z } from "zod";

export const upsertPostSchema = z.object({
  title: z.string().min(3, "标题至少 3 个字符"),
  slug: z
    .string()
    .min(3, "Slug 至少 3 个字符")
    .regex(/^[a-z0-9-]+$/, "Slug 仅支持小写字母、数字与短横线"),
  summary: z.string().min(10, "摘要至少 10 个字符"),
  content: z.string().min(20, "正文至少 20 个字符"),
  coverImage: z.string().url("请输入合法的图片 URL").optional().or(z.literal("")),
  published: z.boolean().optional().default(false),
  scheduledAt: z
    .string()
    .datetime()
    .optional()
    .or(z.literal("")),
  tags: z.array(z.string()).default([]),
});

export type UpsertPostInput = z.infer<typeof upsertPostSchema>;


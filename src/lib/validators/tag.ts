import { z } from "zod";

export const upsertTagSchema = z.object({
  name: z.string().min(1, "标签名称不能为空").max(40, "标签名称不能超过 40 个字符"),
  slug: z
    .string()
    .min(1, "Slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "Slug 仅支持小写字母、数字与短横线")
    .optional(),
});

export const reorderTagsSchema = z.object({
  ids: z.array(z.string()).min(1),
});

export type UpsertTagInput = z.infer<typeof upsertTagSchema>;


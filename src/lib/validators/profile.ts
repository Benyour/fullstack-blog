import { z } from "zod";

export const updateProfileSchema = z.object({
  headline: z
    .string()
    .max(120, "标题不能超过 120 个字符")
    .optional()
    .or(z.literal("")),
  bio: z
    .string()
    .max(2000, "简介不能超过 2000 个字符")
    .optional()
    .or(z.literal("")),
  location: z
    .string()
    .max(120, "地址不能超过 120 个字符")
    .optional()
    .or(z.literal("")),
  avatarUrl: z.string().url("请输入合法的头像 URL").optional().or(z.literal("")),
  heroImage: z.string().url("请输入合法的头图 URL").optional().or(z.literal("")),
  userName: z.string().min(1, "用户名不能为空").max(60, "用户名不能超过 60 个字符").optional(),
  userEmail: z.string().email("请输入合法邮箱").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;


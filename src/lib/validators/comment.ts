import { z } from "zod";

export const createCommentSchema = z.object({
  postId: z.string().min(1),
  body: z.string().min(5, "评论至少 5 个字符"),
  name: z.string().max(80, "昵称不能超过 80 个字符").optional().or(z.literal("")),
  email: z.string().email("请输入合法邮箱").optional().or(z.literal("")),
});

export const moderateCommentSchema = z.object({
  approved: z.boolean().optional(),
  body: z.string().min(5).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;


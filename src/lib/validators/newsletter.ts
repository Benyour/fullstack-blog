import { z } from "zod";

export const subscribeSchema = z.object({
  email: z.string().email("请输入合法邮箱"),
});

export const unsubscribeSchema = z.object({
  email: z.string().email("请输入合法邮箱"),
});


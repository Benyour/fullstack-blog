import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "请填写姓名"),
  email: z.string().email("请填写合法邮箱"),
  message: z.string().min(10, "留言至少 10 个字符"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;


import type { output } from "zod";
import { email, object, string } from "zod";
export const RegisterBaseSchema = object({
  email: email("请输入正确的邮箱格式"),
  password: string("请输入密码")
    .min(6, "密码不能少于6位")
    .max(20, "密码不能超过20位"),
  name: string("请输入用户名")
    .min(2, "用户名不能少于2位")
    .max(20, "用户名不能超过20位"),
  confirmPassword: string("请确认密码")
    .min(6, "确认密码不能少于6位")
    .max(20, "确认密码不能超过20位"),
});

export const RegisterSchema = RegisterBaseSchema.refine(
  data => data.password === data.confirmPassword,
  {
    message: "两次输入的密码不一致，请确认密码",
    path: ["confirmPassword"],
  }
);

export type RegisterSchema = output<typeof RegisterSchema>;

export const LoginSchema = RegisterBaseSchema.pick({
  email: true,
  password: true,
});

export type LoginSchema = output<typeof LoginSchema>;

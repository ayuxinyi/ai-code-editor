import type { output } from "zod";
import { instanceof as instanceof_, object, string } from "zod";

export const BlogSchema = object({
  title: string("请输入博客标题")
    .min(2, "博客标题不能少于2位")
    .max(50, "博客标题不能超过50位"),
  content: string("请输入博客内容").min(10, "博客内容不能少于10位"),
  image: instanceof_(File, { message: "请上传博客图片" }),
});

export type BlogSchema = output<typeof BlogSchema>;

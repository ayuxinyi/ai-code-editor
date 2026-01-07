import type { output } from "zod";
import { custom, object, string } from "zod";

import type { Id } from "@/convex/_generated/dataModel";

export const CommentSchema = object({
  content: string("评论内容不能为空").min(1, "评论内容不能为空"),
  blogId: custom<Id<"blog">>(),
});

export type CommentSchema = output<typeof CommentSchema>;

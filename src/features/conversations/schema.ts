import { custom, object, string } from "zod";

import type { Id } from "../../../convex/_generated/dataModel";

export const MessageRequestSchema = object({
  conversationId: custom<Id<"conversations">>(
    val => typeof val === "string" && val.length > 0,
    {
      message: "很抱歉，请检查您是否选择了对话，若未选择，请先创建对话。",
    }
  ),
  message: string("很抱歉，请输入您的问题后再进行发送。").min(
    1,
    "很抱歉，请输入您的问题后再进行发送。"
  ),
});

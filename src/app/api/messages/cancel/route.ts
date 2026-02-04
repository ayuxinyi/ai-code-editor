import { type NextRequest, NextResponse } from "next/server";
import { custom, object } from "zod";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { AppError } from "@/lib/error-handler";
import { withErrorHandler } from "@/lib/with-error-handler";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
const requestSchema = object({
  projectId: custom<Id<"projects">>(
    val => typeof val === "string" && val.length > 0,
    { error: "无效的项目 ID" },
  ),
});

export const POST = withErrorHandler(async (req: NextRequest) => {
  const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    throw new AppError(
      "很抱歉，由于配置错误，无法进行该操作，请联系客服！",
      500,
      "INTERNAL_SERVER_ERROR",
    );
  }
  const body = await req.json();
  const { projectId } = requestSchema.parse(body);

  // 查找该项目中正在处理中的消息
  const processingMessages = await convex.query(
    api.system.conversation.getProcessingMessages,
    {
      projectId,
      internalKey,
    },
  );
  if (processingMessages.length === 0)
    return NextResponse.json({
      success: true,
      cancelled: false,
      message: "当前没有正在处理中的消息",
    });

  // 取消正在处理中的消息
  const cancelledIds = await Promise.all(
    processingMessages.map(async message => {
      // 取消正在运行的Inngest事件
      await inngest.send({
        name: "conversations/message-cancel",
        data: {
          messageId: message._id,
        },
      });
      // 更新消息状态为已取消
      await convex.mutation(api.system.conversation.updateMessageStatus, {
        internalKey,
        messageId: message._id,
        status: "cancelled",
      });
      return message._id;
    }),
  );

  return NextResponse.json({
    success: true,
    cancelled: true,
    messageIds: cancelledIds,
    message: `已取消 ${cancelledIds.length} 条正在处理中的消息`,
  });
});

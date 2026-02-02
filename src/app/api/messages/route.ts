import { type NextRequest, NextResponse } from "next/server";

import { MessageRequestSchema } from "@/features/conversations/schema";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import { AppError } from "@/lib/error-handler";
import { withErrorHandler } from "@/lib/with-error-handler";

import { api } from "../../../../convex/_generated/api";

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
  const validatedPayload = MessageRequestSchema.parse(body);
  const { conversationId, message } = validatedPayload;
  // 获取数据库中的对话
  const conversation = await convex.query(api.system.getConversationById, {
    conversationId,
    internalKey,
  });
  if (!conversation) {
    throw new AppError(
      "很抱歉，该对话不存在，请重新尝试或联系客服！",
      404,
      "NOT_FOUND",
    );
  }
  const projectId = conversation.projectId;

  // 在创建新的消息之前，我们需要将正在处理的消息状态更新为cancelled

  // 先获取所有正在处理的消息
  const processingMessages = await convex.query(
    api.system.getProcessingMessages,
    {
      projectId,
      internalKey,
    },
  );

  // 如果有正在处理的消息，我们需要将它们的状态更新为cancelled
  if (processingMessages.length > 0) {
    await Promise.all(
      processingMessages.map(async message => {
        // 变更数据库中的消息状态为cancelled
        await convex.mutation(api.system.updateMessageStatus, {
          internalKey,
          messageId: message._id,
          status: "cancelled",
        });
        // 发送取消消息事件到inngest
        await inngest.send({
          name: "conversations/message-cancel",
          data: {
            messageId: message._id,
          },
        });
      }),
    );
  }

  // 创建一个用户信息
  await convex.mutation(api.system.createMessage, {
    content: message,
    conversationId,
    projectId,
    role: "user",
    internalKey,
  });
  // 创建一个AI消息，其状态为processing，这主要是用于在前端展示一个占位符，
  // 以提示用户AI正在生成回复，后续inngest函数在生成AI回复后，会更新convex数据库中这条消息的内容及状态
  const assistantMessageId = await convex.mutation(api.system.createMessage, {
    content: "",
    projectId,
    conversationId,
    role: "assistant",
    internalKey,
    status: "processing",
  });
  // 调用inngest函数处理AI消息的生成
  const event = await inngest.send({
    name: "conversations/message-sent",
    data: {
      messageId: assistantMessageId,
      conversationId,
      projectId,
      message,
    },
  });
  return NextResponse.json({
    success: true,
    messageId: assistantMessageId,
    // 后面会更新成inngest事件的id
    eventId: event.ids[0],
  });
});

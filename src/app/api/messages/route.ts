import { type NextRequest, NextResponse } from "next/server";

import { MessageRequestSchema } from "@/features/conversations/schema";
import { inngest } from "@/inngest/client";
import { isAuthenticated } from "@/lib/auth-server";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../convex/_generated/api";

export async function POST(req: NextRequest) {
  const isAuthenticatedResult = await isAuthenticated();
  if (!isAuthenticatedResult) {
    return NextResponse.json(
      { error: "很抱歉，您尚未登录，无法进行该操作，请登录后再进行尝试" },
      { status: 403 }
    );
  }

  const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    return NextResponse.json(
      { error: "很抱歉，由于配置错误，无法进行该操作，请联系客服！" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const validatedPayload = MessageRequestSchema.parse(body);
    const { conversationId, message } = validatedPayload;
    // 获取数据库中的对话
    const conversation = await convex.query(api.system.getConversationById, {
      conversationId,
      internalKey,
    });
    if (!conversation) {
      return NextResponse.json(
        { error: "很抱歉，该对话不存在，请重新尝试或联系客服！" },
        { status: 404 }
      );
    }
    const projectId = conversation.projectId;
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
      name: "ai/message-sent",
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
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json(
      { error: "很抱歉，由于未知错误，无法进行该操作，请稍后再试或联系客服！" },
      { status: 500 }
    );
  }
}

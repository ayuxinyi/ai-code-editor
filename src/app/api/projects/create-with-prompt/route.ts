import { ConvexError } from "convex/values";
import { NonRetriableError } from "inngest";
import { type NextRequest, NextResponse } from "next/server";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { object, string, ZodError } from "zod";

import { DEFAULT_CONVERSATION_TITLE } from "@/features/conversations/constant";
import { inngest } from "@/inngest/client";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";

const requestSchema = object({
  prompt: string("请输入提示词").min(1, "提示词不能为空"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = requestSchema.parse(body);
    const hasAuth = await isAuthenticated();
    if (!hasAuth) {
      return NextResponse.json(
        { error: "很抱歉，您尚未登录无法进行导入操作，请先登录后重试" },
        { status: 401 },
      );
    }

    const { _id: userId } = await fetchAuthQuery(api.auth.getCurrentUser);
    if (!userId) {
      return NextResponse.json(
        { error: "很抱歉，您的用户信息不存在，请联系管理员" },
        { status: 500 },
      );
    }
    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      return NextResponse.json(
        {
          error:
            "很抱歉，您的环境变量中未配置POLARIS_CONVEX_INTERNAL_KEY，请联系管理员",
        },
        { status: 500 },
      );
    }

    // 随机生成项目名称
    const projectName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: "-",
      length: 3,
    });

    const { projectId, conversationId } = await convex.mutation(
      api.system.project.createProjectWithConversation,
      {
        projectName,
        ownerId: userId,
        internalKey,
        conversationTitle: DEFAULT_CONVERSATION_TITLE,
      },
    );

    await convex.mutation(api.system.conversation.createMessage, {
      conversationId,
      projectId,
      content: prompt,
      role: "user",
      internalKey,
    });

    const assistantMessageId = await convex.mutation(
      api.system.conversation.createMessage,
      {
        conversationId,
        projectId,
        content: "",
        role: "assistant",
        internalKey,
        status: "processing",
      },
    );
    await inngest.send({
      name: "conversations/message-sent",
      data: {
        messageId: assistantMessageId,
        conversationId,
        projectId,
        message: prompt,
      },
    });
    return NextResponse.json({ projectId });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", { error });
    let errorMessage = "很抱歉，由于未知错误导致github仓库导入失败";
    if (error instanceof ZodError) {
      errorMessage = error.issues[0].message;
    } else if (error instanceof ConvexError) {
      errorMessage = error.data;
    } else if (error instanceof Error || error instanceof NonRetriableError) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

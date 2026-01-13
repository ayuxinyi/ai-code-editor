import { NonRetriableError } from "inngest";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import env from "@/utils/env";

import { api } from "../../../../convex/_generated/api";

// 处理 AI 消息事件
export const processMessage = inngest.createFunction(
  {
    id: "ai-process-message",
    name: "AI Process Message",
    // 取消inngest函数的执行
    cancelOn: [
      {
        // 当收到取消消息事件时，取消当前函数的执行
        event: "ai/message-cancel",
        // 当取消消息事件中的 messageId 与当前处理的消息事件中的 messageId 匹配时，取消当前函数的执行
        if: "async.data.messageId == event.data.messageId",
      },
    ],
    // 当函数执行失败时，更新消息状态为失败
    onFailure: async ({ event, step }) => {
      const { messageId } = event.data.event.data;
      const internalKey = env.POLARIS_CONVEX_INTERNAL_KEY;
      if (!internalKey) {
        throw new NonRetriableError(
          "很抱歉，您的环境变量中没有设置 POLARIS_CONVEX_INTERNAL_KEY，无法继续处理消息，请配置后重试"
        );
      }
      await step.run("update-assistant-message-db-failure", async () => {
        await convex.mutation(api.system.updateMessageContent, {
          messageId,
          internalKey,
          content:
            "很抱歉，我在处理您的消息时遇到了一些问题，您还有其它需要我帮助的吗？",
        });
      });
    },
  },
  {
    event: "ai/message-sent",
  },
  async ({ event, step }) => {
    const { messageId } = event.data;
    const internalKey = env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError(
        "很抱歉，您的环境变量中没有设置 POLARIS_CONVEX_INTERNAL_KEY，无法继续处理消息，请配置后重试"
      );
    }

    await step.sleep("wait-for-ai-processing", "5s");

    await step.run("update-assistant-message-db", async () => {
      await convex.mutation(api.system.updateMessageContent, {
        messageId,
        internalKey,
        content: "AI助手已经完成了消息的处理",
      });
    });
  }
);

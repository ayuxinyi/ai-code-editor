import { createNetwork } from "@inngest/agent-kit";
import { NonRetriableError } from "inngest";

import { DEFAULT_CONVERSATION_TITLE } from "@/features/conversations/constant";
import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";
import env from "@/utils/env";

import { api } from "../../../../convex/_generated/api";
import { codingGenerateAgent, conversationTitleAgent } from "./ai/agents";
import { CODING_AGENT_SYSTEM_PROMPT } from "./constant";

// 处理 AI 消息事件
export const processMessage = inngest.createFunction(
  {
    id: "conversations-process-message",
    name: "Conversations Process Message",
    // 取消inngest函数的执行
    cancelOn: [
      {
        // 当收到取消消息事件时，取消当前函数的执行
        event: "conversations/message-cancel",
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
          "很抱歉，您的环境变量中没有设置 POLARIS_CONVEX_INTERNAL_KEY，无法继续处理消息，请配置后重试",
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
    event: "conversations/message-sent",
  },
  async ({ event, step }) => {
    const { messageId, conversationId, projectId, message } = event.data;
    const internalKey = env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError(
        "很抱歉，您的环境变量中没有设置 POLARIS_CONVEX_INTERNAL_KEY，无法继续处理消息，请配置后重试",
      );
    }

    // 等待数据库同步
    await step.sleep("wait-for-db-sync", "1s");

    // 1.更改对话的标题
    // 1.1 获取对话信息
    const conversation = await step.run("get-conversation", async () => {
      return await convex.query(api.system.getConversationById, {
        conversationId,
        internalKey,
      });
    });

    // 1.2 检查对话是否存在
    if (!conversation) {
      throw new NonRetriableError(
        `很抱歉，我们无法找到您的对话，请联系管理员处理或稍后重试。`,
      );
    }

    // 1.3 获取当前对话的最近消息，这些消息将被作为AI助手的上下文
    const recentMessages = await step.run("get-recent-messages", async () => {
      return await convex.query(api.agent.getRecentMessages, {
        conversationId,
        internalKey,
        limit: 10,
      });
    });

    // 1.4 构建上下文增强的系统提示词 (Context-Aware System Prompt)
    // 利用历史消息来约束 AI 行为，确保其回复具有连续性且符合预期
    let systemPrompt = CODING_AGENT_SYSTEM_PROMPT;

    // 1.4.1 数据清洗：排除当前正在处理的消息以及无效的空内容
    const contextMessages = recentMessages.filter(
      msg => msg._id !== messageId && msg.content.trim() !== "",
    );

    if (contextMessages.length > 0) {
      const historyText = contextMessages
        .map(msg => `${msg.role.toUpperCase()}：${msg.content}`)
        .join("\n\n");

      // 注入历史对话上下文
      // 注意：这里建议将提示词也统一为中文，以便模型更好地遵循指令
      systemPrompt += `\n\n## 历史对话 (仅作背景参考 - 请勿重复以下内容):\n${historyText}\n\n## 当前请求:\n请仅针对用户下方的最新消息进行回复。不要重复或直接引用你之前的回答。`;
    }

    // 1.4.5 如果对话标题依然是默认标题，那需要生成对话标题
    if (conversation.title === DEFAULT_CONVERSATION_TITLE) {
      // 1.4.5.1 调用 AI 代理 生成对话标题
      // - message: 当前消息内容,agent会将message与代理的system prompt拼接起来，发送给AI模型
      // - step: 用于运行 AI 代理的步骤，这里是inngest的step，用于记录函数执行的状态，方便调试
      // - output: 模型生成的对话标题
      const { output } = await conversationTitleAgent.run(message, { step });
      // 找到第一个助手角色的文本消息
      const textMessage = output.find(
        msg => msg.role === "assistant" && msg.type === "text",
      );
      // 1.4.5.2 检查是否成功生成对话标题
      if (textMessage?.type === "text") {
        const title =
          typeof textMessage.content === "string"
            ? textMessage.content.trim()
            : textMessage.content
                .map(c => c.text)
                .join("")
                .trim();
        // 1.4.5.3 更新对话标题
        if (title) {
          await step.run("update-conversation-title", async () => {
            await convex.mutation(api.agent.updateConversationTitle, {
              conversationId,
              internalKey,
              title,
            });
          });
        }
      }
    }
    const codingAgent = codingGenerateAgent(
      systemPrompt,
      internalKey,
      projectId,
    );
    // 2. 生成代码
    // 2.1 创建网络，网络可以包含多个代理,它会循环调用每个代理，直到所有代理都完成任务
    const network = createNetwork({
      // 网络名称，用于日志记录或调试标识
      name: "Coding Generate Network",
      // 初始注册的智能体列表
      // 这里初始化了一个负责代码生成的智能体，传入了系统提示词、密钥和项目ID
      agents: [codingAgent],
      // 最大迭代次数（安全护栏）
      // 防止模型陷入死循环（比如反复调用同一个工具），默认限制为 20 次交互
      maxIter: 20,
      /**
       * 路由器函数 (Router)
       * 作用：根据当前网络的状态（state），决定下一步该做什么。
       * 返回值：返回下一个要执行的智能体；如果返回 undefined，则表示流程结束。
       */
      router: ({ network }) => {
        // 1. 获取上下文：拿到最近一次迭代（上一步）的执行结果
        const lastResult = network.state.results.at(-1);
        // 2. 状态检查：判断上一步输出中是否包含“文本回复”
        // (role === "assistant" 确保是 AI 的回复，而不是工具的返回值)
        const hasTextResponse = lastResult?.output.some(
          m => m.type === "text" && m.role === "assistant",
        );
        // 3. 状态检查：判断上一步输出中是否包含“工具调用请求”
        // (tool_call 表示模型想要执行某个操作，比如读文件、运行代码)
        const hasToolCalls = lastResult?.output.some(
          m => m.type === "tool_call",
        );

        // 4. 终止条件判断 (核心逻辑)
        // 如果模型回复了文本 (hasTextResponse 为真),并且模型没有要求继续调用工具 (!hasToolCalls 为真),说明任务已完成，可以输出最终结果。
        if (hasTextResponse && !hasToolCalls) {
          // 返回 undefined 告知网络停止运行
          return undefined;
        }
        // 5. 继续循环
        // 如果不满足终止条件（例如：没有回复文本，或者虽然有文本但还需要调用工具），
        // 则再次调用 codingGenerateAgent，将结果传回给它继续处理。
        return codingAgent;
      },
    });

    // 2.2 运行网络
    const result = await network.run(message);
    // 2.3 提取最终结果
    const lastResult = result.state.results.at(-1);
    const textMessage = lastResult?.output.find(
      m => m.type === "text" && m.role === "assistant",
    );
    let assistantDefaultResponse =
      "我已经处理了您的请求。如果您需要进一步的帮助，请随时告诉我。";
    if (textMessage?.type === "text") {
      assistantDefaultResponse =
        typeof textMessage.content === "string"
          ? textMessage.content.trim()
          : textMessage.content
              .map(c => c.text)
              .join("")
              .trim();
    }

    // 2.4 更新AI助手的回复，将最终结果写入数据库，并同时将消息状态设置为已完成
    await step.run("update-assistant-message-db", async () => {
      await convex.mutation(api.system.updateMessageContent, {
        messageId,
        internalKey,
        content: assistantDefaultResponse,
      });
    });

    return {
      success: true,
      messageId,
      conversationId,
    };
  },
);

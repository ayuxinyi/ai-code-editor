/**
 * Agent 用于生成对话标题
 *
 */

import { createAgent } from "@inngest/agent-kit";

import { TITLE_GENERATOR_SYSTEM_PROMPT } from "../../constant";
import { openAIModel } from "../openai-model";

/**
 * 创建对话标题 Agent
 */
export const conversationTitleAgent = createAgent({
  name: "conversation-title-agent",
  description: "一个用于生成对话标题的 AI Agent",
  system: TITLE_GENERATOR_SYSTEM_PROMPT,
  model: openAIModel(),
});

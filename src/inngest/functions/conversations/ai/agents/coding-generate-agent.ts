/**
 * 编码生成 Agent
 */

import { createAgent } from "@inngest/agent-kit";

import type { Id } from "../../../../../../convex/_generated/dataModel";
import { openAIModel } from "../openai-model";
import { createReadFilesTool } from "../tools";
import { createListFilesTools } from "../tools/list-files-tools";

/**
 * 创建编码生成 Agent
 * @param systemPrompt 系统提示，这会作为 AI 模型的基础提示，这会约束AI模型的行为
 * @param internalKey 内部密钥，用于访问 Convex API
 * @param projectId 项目ID，用于指定要操作的项目
 * @returns 编码生成 Agent
 */
export const codingGenerateAgent = (
  systemPrompt: string,
  internalKey: string,
  projectId: Id<"projects">,
) =>
  createAgent({
    // 代理名称
    name: "Coding Generate Agent",
    // 代理描述，这很关键，AI 模型会根据这个描述来判断是否调用这个代理
    description: "一个根据用户需求生成代码的 AI Agent",
    // 系统提示，这会作为 AI 模型的基础提示，这会约束AI模型的行为
    system: systemPrompt,
    // 模型配置，这里使用 Deepseek 模型
    model: openAIModel(0.3, 16000),
    // 工具列表
    tools: [
      createListFilesTools({ internalKey, projectId }),
      createReadFilesTool({ internalKey }),
    ],
  });

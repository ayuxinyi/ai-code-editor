/**
 * @file AI 建议 API 路由
 * - 接收 POST 请求，包含代码上下文信息
 * - 调用 OpenRouter 生成 AI 建议
 * - 返回包含建议的 JSON 响应
 */

import { deepseek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

import { SUGGESTION_PROMPT, SYSTEM_PROMPT } from "@/constants";
import { SuggestionRequestSchema } from "@/features/editor/extensions/suggestion/schema";
import { AppError } from "@/lib/error-handler";
import { withErrorHandler } from "@/lib/with-error-handler";
// import { SuggestionSchema } from "@/features/editor/extensions/suggestion/schema";
// import { openrouter } from "@/lib/openrouter";

export const POST = withErrorHandler(async (req: NextRequest) => {
  const body = await req.json();
  const validatedPayload = SuggestionRequestSchema.parse(body);
  // 解析请求体
  const {
    fileName,
    code,
    currentLine,
    previousLines,
    textBeforeCursor,
    textAfterCursor,
    nextLines,
    lineNumber,
  } = validatedPayload;

  // 确保代码不为空
  if (!code.trim()) {
    throw new AppError("代码不能为空", 400, "BAD_REQUEST");
  }
  // 替换提示语句中变量占位符
  const prompt = SUGGESTION_PROMPT.replace("{fileName}", fileName)
    .replace("{code}", code)
    .replace("{currentLine}", currentLine)
    .replace("{previousLines}", previousLines ?? "")
    .replace("{textBeforeCursor}", textBeforeCursor)
    .replace("{textAfterCursor}", textAfterCursor)
    .replace("{nextLines}", nextLines ?? "")
    .replace("{lineNumber}", lineNumber.toString());

  // 调用openrouter 生成AI建议
  const { text } = await generateText({
    // 选择模型
    model: deepseek("deepseek-chat"),
    // 定义AI的提示语句，并约束AI的行为
    system: SYSTEM_PROMPT,
    temperature: 0.1,
    // 防止 AI 生成过多无关内容,遇到换行符或特定的结束符就停止
    stopSequences: ["\n", "```"],
    prompt,
    // 定义AI的输出格式，其返回结果为{suggestion: string}
    // output: Output.object({ schema: SuggestionSchema }),
    // temperature: 0.1,
  });

  // 有时模型会带上 Markdown 的代码块标签，需要剔除
  const suggestion = text
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trimEnd();
  return NextResponse.json({ suggestion });
});

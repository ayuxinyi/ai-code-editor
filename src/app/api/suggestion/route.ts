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
import { isAuthenticated } from "@/lib/auth-server";
// import { SuggestionSchema } from "@/features/editor/extensions/suggestion/schema";
// import { openrouter } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const isAuthenticatedResult = await isAuthenticated();

    if (!isAuthenticatedResult) {
      return NextResponse.json(
        { error: "很抱歉，您尚未登录，无法进行该操作，请登录后再进行尝试" },
        { status: 403 }
      );
    }
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
    if (!code) {
      return NextResponse.json({ error: "代码不能为空" }, { status: 400 });
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
      prompt,
      // 定义AI的输出格式，其返回结果为{suggestion: string}
      // output: Output.object({ schema: SuggestionSchema }),
      // temperature: 0.1,
    });
    return NextResponse.json({ suggestion: text });
  } catch (error) {
    console.error("生成AI建议失败:", { error });
    return NextResponse.json({ error: "AI建议生成失败" }, { status: 500 });
  }
}

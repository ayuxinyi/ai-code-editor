import type { output } from "zod";
import { number, object, string } from "zod";

// import { suggestion } from ".";

export const SuggestionSchema = object({
  suggestion: string().describe(
    "需要插入到光标位置的代码，如果当前不需要补全则返回空字符串"
  ),
});

export type SuggestionSchema = output<typeof SuggestionSchema>;

export const SuggestionRequestSchema = object({
  fileName: string("文件名不能为空").min(1, "文件名不能为空"),
  code: string("代码不能为空").min(1, "代码不能为空"),
  currentLine: string("当前行不能为空").min(1, "当前行不能为空"),
  previousLines: string()
    .optional()
    .transform(value => value ?? ""),
  nextLines: string()
    .optional()
    .transform(value => value ?? ""),
  textAfterCursor: string(),
  textBeforeCursor: string(),
  lineNumber: number(),
});

export type SuggestionRequestSchema = output<typeof SuggestionRequestSchema>;

export const SuggestionResponseSchema = object({
  suggestion: string("AI生成的代码建议不能为空")
    .transform(value => value ?? "")
    .optional(),
});

export type SuggestionResponseSchema = output<typeof SuggestionResponseSchema>;

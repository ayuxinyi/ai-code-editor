import type { output } from "zod";
import { object, string } from "zod";

// import { suggestion } from ".";

export const QuickEditSchema = object({
  editCode: string().describe("根据指令编辑用户选中的代码"),
});

export type QuickEditSchema = output<typeof QuickEditSchema>;

export const QuickEditRequestSchema = object({
  selectCode: string("选中的代码不能为空").min(1, "选中的代码不能为空"),
  fullCode: string("完整代码不能为空").min(1, "完整代码不能为空"),
  instruction: string("指令不能为空").min(1, "指令不能为空"),
});

export type QuickEditRequestSchema = output<typeof QuickEditRequestSchema>;

export const QuickEditResponseSchema = object({
  editCode: string("").describe("AI根据用户指令编辑过后的代码").optional(),
});

export type QuickEditResponseSchema = output<typeof QuickEditResponseSchema>;

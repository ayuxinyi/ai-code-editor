import { createTool } from "@inngest/agent-kit";
import { object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface UpdateFileToolOptions {
  internalKey: string;
}

const UpdateFileParamsSchema = object({
  fileId: string()
    .min(1, "文件ID不能为空") // 验证规则
    .describe("要更新的文件ID"), // AI 描述
  content: string().describe("要更新的文件内容"),
});

export const createUpdateFileTool = ({ internalKey }: UpdateFileToolOptions) =>
  createTool({
    name: "updateFile",
    description: "更新指定文件的内容",
    parameters: UpdateFileParamsSchema,
    async handler(input, { step: toolStep }) {
      const { success, data, error } = UpdateFileParamsSchema.safeParse(input);
      if (!success) {
        return `updateFileTool-参数校验失败：${error.issues[0].message}`;
      }
      const { fileId, content } = data;
      try {
        const file = await convex.query(api.agent.getFileById, {
          fileId: fileId as Id<"files">,
          internalKey,
        });
        if (!file) {
          return `updateFileTool-更新文件失败：并未找到文件ID为 ${fileId} 的文件。使用 listFiles 工具去获取有效的文件ID。`;
        }

        if (file.type === "folder") {
          return `updateFileTool-更新文件失败：${fileId} 是一个文件夹，你只能更新文件的内容。`;
        }

        await toolStep?.run("update-file", async () => {
          await convex.mutation(api.agent.updateFile, {
            fileId: fileId as Id<"files">,
            internalKey,
            content,
          });
        });
        return `文件"${file.name}"已成功更新`;
      } catch (error) {
        return createToolError(error, "updateFile");
      }
    },
  });

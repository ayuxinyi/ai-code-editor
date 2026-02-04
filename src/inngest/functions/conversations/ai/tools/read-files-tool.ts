import { createTool } from "@inngest/agent-kit";
import { array, object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface ReadFilesToolOptions {
  internalKey: string;
}

const ReadFilesToolParamsSchema = object({
  fileIds: array(
    // 核心修改：将 custom 替换为 string()
    // AI 模型需要知道这仅仅是一个字符串
    string().describe("文件ID (Convex ID)"),
  )
    .min(1, "至少需要提供一个文件ID")
    .describe("要读取的文件ID列表"),
});
/**
 * 读取文件内容工具
 * @param param0 工具选项
 * @returns 工具函数
 */

export const createReadFilesTool = ({ internalKey }: ReadFilesToolOptions) =>
  createTool({
    name: "readFiles",
    description: "阅读给定的项目的文件内容，返回文件内容的文本",
    parameters: ReadFilesToolParamsSchema,
    async handler(input, { step: toolStep }) {
      // 1. 校验参数
      const { success, data, error } =
        ReadFilesToolParamsSchema.safeParse(input);
      if (!success) {
        return `readFilesTool-参数校验失败：${error.issues[0].message}`;
      }
      const { fileIds } = data;

      try {
        // 2. 执行读取文件内容操作
        return await toolStep?.run("read-files", async () => {
          const results: Array<{
            name: string;
            id: Id<"files">;
            content: string;
          }> = [];
          for (const fileId of fileIds) {
            const file = await convex.query(api.system.files.getFileById, {
              fileId: fileId as Id<"files">,
              internalKey,
            });
            if (file && file.content) {
              results.push({
                name: file.name,
                id: file._id,
                content: file.content,
              });
            }
          }
          if (results.length === 0) {
            return `readFilesTool-读取文件失败：操作完成，但未找到任何文件内容。请确认文件 ID 是否正确。尝试过的 ID: ${fileIds.join(", ")}。使用 listFiles 工具去获取有效的文件ID。`;
          }
          return JSON.stringify(results);
        });
      } catch (error) {
        return createToolError(error, "readFiles");
      }
    },
  });

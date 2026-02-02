import { createTool } from "@inngest/agent-kit";
import { ConvexError } from "convex/values";
import { array, object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

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
            const file = await convex.query(api.agent.getFileById, {
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
            return "readFilesTool-读取文件失败：很抱歉，根据您提供的文件ID，并没有找到对应的文件内容。请使用有效的文件ID重试。";
          }
          return JSON.stringify(results);
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : error instanceof ConvexError
              ? error.data.message
              : "未知错误";
        return `readFilesTool-读取文件失败：操作失败，${errorMessage}`;
      }
    },
  });

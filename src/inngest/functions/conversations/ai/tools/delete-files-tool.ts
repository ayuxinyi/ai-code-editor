import { createTool } from "@inngest/agent-kit";
import { array, object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface CreateDeleteFileToolOptions {
  internalKey: string;
}

const DeleteFileToolParamsSchema = object({
  fileIds: array(
    string().min(1, "文件ID不能为空").describe("要删除的文件或文件夹的ID"),
  )
    .min(1, "至少删除一个文件或文件夹")
    .describe("要删除的文件或文件夹的ID列表"),
});

export const createDeleteFilesTool = ({
  internalKey,
}: CreateDeleteFileToolOptions) =>
  createTool({
    name: "deleteFiles",
    description:
      "从项目中删除文件或文件夹。注意：如果删除文件夹，该文件夹内的所有内容（子文件和子文件夹）都将被一并强制删除（递归删除）。",
    parameters: DeleteFileToolParamsSchema,
    async handler(input, { step: toolStep }) {
      const { success, data, error } =
        DeleteFileToolParamsSchema.safeParse(input);
      if (!success) {
        return `deleteFilesTool-参数校验失败:${error.issues[0].message}`;
      }
      const { fileIds } = data;
      const filesToDelete: Array<{
        id: Id<"files">;
        name: string;
        type: string;
      }> = [];
      for (const fileId of fileIds) {
        const file = await convex.query(api.agent.getFileById, {
          fileId: fileId as Id<"files">,
          internalKey,
        });

        if (!file) {
          return `deleteFilesTool-删除文件失败：根据文件ID ${fileId}，并未找到对应的文件。请使用 listFiles 工具获取有效的文件ID。`;
        }

        filesToDelete.push({
          id: file._id,
          name: file.name,
          type: file.type,
        });
      }
      try {
        return await toolStep?.run("delete-files", async () => {
          const results: Array<string> = [];
          for (const file of filesToDelete) {
            await convex.mutation(api.agent.deleteFile, {
              fileId: file.id,
              internalKey,
            });
            results.push(
              `删除 ${file.type === "folders" ? "文件夹" : "文件"} "${file.name}" (ID: ${file.id}) 成功`,
            );
          }
          return results.join("\n");
        });
      } catch (error) {
        return createToolError(error, "deleteFiles");
      }
    },
  });

import { createTool } from "@inngest/agent-kit";
import { object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface CreateRenameFileToolOptions {
  internalKey: string;
}

const RenameFileToolParamsSchema = object({
  fileId: string()
    .min(1, "文件ID不能为空")
    .describe("需要重命名的文件或文件夹的ID"),
  name: string().min(1, "文件名不能为空").describe("文件或文件夹的新名称"),
});

export const createRenameFileTool = ({
  internalKey,
}: CreateRenameFileToolOptions) =>
  createTool({
    name: "renameFile",
    description: "重命名指定文件或文件夹",
    parameters: RenameFileToolParamsSchema,
    async handler(input, { step: toolStep }) {
      const { success, data, error } =
        RenameFileToolParamsSchema.safeParse(input);
      if (!success) {
        return `renameFileTool-参数校验失败:${error.issues[0].message}`;
      }
      const { fileId, name } = data;
      try {
        const file = await convex.query(api.system.files.getFileById, {
          fileId: fileId as Id<"files">,
          internalKey,
        });
        if (!file) {
          return `renameFileTool-重命名文件失败：根据文件ID ${fileId}，并未找到对应的文件。请使用 listFiles 工具获取有效的文件ID。`;
        }
        await toolStep?.run("rename-file", async () => {
          await convex.mutation(api.system.files.renameFile, {
            fileId: fileId as Id<"files">,
            internalKey,
            name,
          });
        });
        return `renameFileTool-重命名文件成功：文件 ${file.name} 已成功重命名为 ${name}`;
      } catch (error) {
        return createToolError(error, "renameFile");
      }
    },
  });

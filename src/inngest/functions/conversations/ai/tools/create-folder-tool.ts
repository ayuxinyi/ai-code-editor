import { createTool } from "@inngest/agent-kit";
import { object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface CreateFolderToolParams {
  projectId: Id<"projects">;
  internalKey: string;
}

const CreateFolderToolParamsSchema = object({
  name: string()
    .min(1, "文件夹名称不能为空")
    .describe("将要创建的文件夹的名称"),
  parentId: string().describe(
    "父文件夹的 ID（注意：是 ID，不是名称！），该 ID 需来自 listFiles工具。若是根目录，请使用空字符串。",
  ),
});

export const createCreateFolderTool = ({
  projectId,
  internalKey,
}: CreateFolderToolParams) =>
  createTool({
    name: "createFolder",
    description: "在项目中创建一个新文件夹",
    parameters: CreateFolderToolParamsSchema,
    async handler(input, { step: toolStep }) {
      const { success, data, error } =
        CreateFolderToolParamsSchema.safeParse(input);
      if (!success) {
        return `createFolderTool-参数校验失败:${error.issues[0].message}`;
      }
      const { name, parentId } = data;
      try {
        const project = await convex.query(api.agent.getProjectById, {
          projectId,
          internalKey,
        });
        if (!project) {
          return `createFolderTool-创建文件失败:很抱歉，根据您提供的项目ID ${projectId}，无法找到对应的项目，请检查项目ID是否正确。`;
        }
        return await toolStep?.run("create-folder", async () => {
          if (parentId) {
            try {
              const parentFile = await convex.query(api.agent.getFileById, {
                internalKey,
                fileId: parentId as Id<"files">,
              });
              if (!parentFile) {
                return `createFolderTool-创建文件夹失败:根据父目录ID "${parentId}"，无法找到对应的目录，使用 listFiles 工具去获取有效的父目录ID。`;
              }
              if (parentFile.type !== "folder") {
                return `createFolderTool-创建文件夹失败:ID "${parentId}" 指向的是文件，并非文件夹。parentId 参数必须使用文件夹的 ID`;
              }
            } catch {
              return `createFolderTool-创建文件夹失败:无效的父目录ID "${parentId}"，使用 listFiles 工具去获取有效的父目录ID，或者使用空字符串 "" 作为根目录。`;
            }
          }
          const folderId = await convex.mutation(api.agent.createFolder, {
            internalKey,
            parentId: parentId ? (parentId as Id<"files">) : undefined,
            name,
            projectId,
          });
          return `createFolderTool-创建文件夹成功:文件夹 ${name} 已成功创建，ID 为 ${folderId}`;
        });
      } catch (error) {
        return createToolError(error, "createFolder");
      }
    },
  });

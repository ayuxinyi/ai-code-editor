import { createTool } from "@inngest/agent-kit";
import { array, object, string } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface CreateFilesToolParams {
  internalKey: string;
  projectId: Id<"projects">;
}

const CreateFilesParamsSchema = object({
  parentId: string()
    .optional()
    .describe(
      "父目录 ID。若要指定根目录，请传入空字符串。该 ID 必须要能从 listFiles 工具的结果中找到。",
    ),
  files: array(
    object({
      name: string()
        .min(1, "文件名不能为空")
        .describe(
          "文件的完整名称，必须包含文件扩展名（例如：App.tsx, utils.ts）。",
        ),

      content: string().describe("文件的完整代码内容或文本内容。"),
    }),
  )
    .min(1, "至少创建一个文件")
    .describe("要创建的文件列表"),
});

export const createCreateFilesTool = ({
  internalKey,
  projectId,
}: CreateFilesToolParams) =>
  createTool({
    name: "createFiles",
    description:
      "在同一文件夹内批量创建多个文件。当需要创建的多个文件都位于同一个父级目录时，请使用此工具。相比单独创建每个文件，此方式更高效。",
    parameters: CreateFilesParamsSchema,
    async handler(input, { step: toolStep }) {
      const { success, data, error } = CreateFilesParamsSchema.safeParse(input);
      if (!success) {
        return `createFilesTool-参数校验失败:${error.issues[0].message}`;
      }
      const { files, parentId } = data;
      try {
        const project = await convex.query(api.agent.getProjectById, {
          internalKey,
          projectId,
        });
        if (!project) {
          return `createFilesTool-创建文件失败:很抱歉，根据您提供的项目ID ${projectId}，无法找到对应的项目，请检查项目ID是否正确。`;
        }
        return await toolStep?.run("create-files", async () => {
          let resolvedParentId: Id<"files"> | undefined;
          if (parentId && parentId !== "") {
            try {
              resolvedParentId = parentId as Id<"files">;
              const parentFolder = await convex.query(api.agent.getFileById, {
                fileId: resolvedParentId,
                internalKey,
              });
              if (!parentFolder) {
                return `createFilesTool-创建文件失败:根据父目录ID "${parentId}"，无法找到对应的目录，使用 listFiles 工具去获取有效的父目录ID。`;
              }
              if (parentFolder.type !== "folder") {
                return `createFilesTool-创建文件失败:ID "${parentId}" 指向的是文件，并非文件夹。parentId 参数必须使用文件夹的 ID`;
              }
            } catch {
              return `createFilesTool-创建文件失败:无效的父目录ID "${parentId}"，使用 listFiles 工具去获取有效的父目录ID，或者使用空字符串 "" 作为根目录。`;
            }
          }
          const results = await convex.mutation(api.agent.createFiles, {
            files,
            parentId: resolvedParentId,
            projectId,
            internalKey,
          });
          const created = results.filter(f => !f.error);
          const failed = results.filter(f => f.error);
          let response = `成功创建 ${created.length} 个文件`;
          if (created.length > 0) {
            response += `: ${created.map(f => f.name).join(", ")}`;
          }
          if (failed.length > 0) {
            response += `。失败了 ${failed.length} 个文件：${failed.map(f => `${f.name} (${f.error})`).join(", ")}`;
          }
          return response;
        });
      } catch (error) {
        return createToolError(error, "createFiles");
      }
    },
  });

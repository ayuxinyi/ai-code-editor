import { createTool } from "@inngest/agent-kit";
import { object } from "zod";

import { convex } from "@/lib/convex-client";

import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";
import { createToolError } from "./tool-helper";

interface ListFilesToolOptions {
  internalKey: string;
  projectId: Id<"projects">;
}

/**
 * 列表文件工具
 * @param param0 工具选项
 * @returns 列表文件工具
 */
export const createListFilesTools = ({
  internalKey,
  projectId,
}: ListFilesToolOptions) =>
  createTool({
    // 工具名称
    name: "listFiles",
    // 工具描述，这很关键，AI 模型会根据这个描述来判断是否调用这个工具
    description:
      "列出项目中的所有文件和文件夹。返回每一项的名称、ID、类型以及父级 ID (parentId)。parentId 为 null 的项位于根目录。请利用 parentId 来解析文件夹结构——具有相同 parentId 的项属于同一个文件夹。",
    // 工具参数，这里没有参数
    parameters: object({}),
    // 工具处理函数
    async handler(_, { step: toolStep }) {
      try {
        return await toolStep?.run("list-files", async () => {
          const files = await convex.query(api.agent.getProjectFiles, {
            projectId,
            internalKey,
          });
          if (files.length === 0) {
            return `listFilesTool-列出项目文件失败：根据项目ID ${projectId}，并没有找到任何文件或文件夹。请确认项目ID是否正确。`;
          }
          // 对文件进行排序，文件夹优先显示
          const sorted = files.sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "folder" ? -1 : 1;
            }
            // localeCompare: 对字符串进行本地化排序，考虑语言环境差异
            return a.name.localeCompare(b.name);
          });
          // 转换为工具需要的格式
          const fileList = sorted.map(file => ({
            id: file._id,
            name: file.name,
            type: file.type,
            parentId: file.parentId ?? null,
          }));
          return JSON.stringify(fileList);
        });
      } catch (error) {
        return createToolError(error, "listFiles");
      }
    },
  });

import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type IdProps = {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
};

/**
 * 获取项目下的所有文件
 * @param projectId 项目id
 * @returns 文件列表
 */
export const useFiles = (projectId: Id<"projects"> | null) =>
  useQuery(api.files.getFiles, projectId ? { projectId } : "skip");

/**
 * 创建文件
 * @returns void
 */
export const useFileCreate = () => useMutation(api.files.createFile);
/**
 * 创建文件夹
 * @returns void
 */
export const useFolderCreate = () => useMutation(api.files.createFolder);
/**
 * 获取文件夹内容
 * @param projectId 项目id
 * @param parentId 文件夹id
 * @param enabled 是否启用查询
 * @returns 文件夹内容
 */
export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: IdProps & { enabled?: boolean }) =>
  useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip",
  );

/**
 * 删除文件
 * @returns void
 */
export const useDeleteFile = () => useMutation(api.files.deleteFile);

/**
 * 重命名文件
 * @returns void
 */
export const useRenameFile = () => useMutation(api.files.renameFile);

/**
 * 获取文件详情
 * @param fileId 文件id
 * @returns 文件详情
 */
export const useFileById = (fileId: Id<"files"> | null) =>
  useQuery(api.files.getFile, fileId ? { fileId } : "skip");

/**
 * 获取文件路径
 * @param fileId 文件id
 * @returns 文件路径
 */
export const useFilePath = (fileId: Id<"files"> | null) =>
  useQuery(api.files.getFilePath, fileId ? { fileId } : "skip");

/**
 * 更新文件
 * @returns void
 */
export const useUpdateFile = () => useMutation(api.files.updateFile);

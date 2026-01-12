import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type IdProps = {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
};

// 创建文件
export const useFileCreate = () => useMutation(api.files.createFile);

// 创建文件夹
export const useFolderCreate = () => useMutation(api.files.createFolder);

// 获取文件夹内容
export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: IdProps & { enabled?: boolean }) =>
  useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip"
  );

// 删除文件
export const useDeleteFile = () => useMutation(api.files.deleteFile);

// 重命名文件
export const useRenameFile = () => useMutation(api.files.renameFile);

// 获取文件详情
export const useFileById = (fileId: Id<"files"> | null) =>
  useQuery(api.files.getFile, fileId ? { fileId } : "skip");

// 获取文件路径
export const useFilePath = (fileId: Id<"files"> | null) =>
  useQuery(api.files.getFilePath, fileId ? { fileId } : "skip");

// 更新文件
export const useUpdateFile = () => useMutation(api.files.updateFile);

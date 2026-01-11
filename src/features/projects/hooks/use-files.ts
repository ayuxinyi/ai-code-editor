import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

type IdProps = {
  projectId: Id<"projects">;
  parentId?: Id<"files">;
};

// 创建文件
export const useFileCreate = () => {
  return useMutation(api.files.createFile);
};

// 创建文件夹
export const useFolderCreate = () => {
  return useMutation(api.files.createFolder);
};

export const useFolderContents = ({
  projectId,
  parentId,
  enabled = true,
}: IdProps & { enabled?: boolean }) => {
  return useQuery(
    api.files.getFolderContents,
    enabled ? { projectId, parentId } : "skip"
  );
};

export const useDeleteFile = () => {
  return useMutation(api.files.deleteFile);
};

export const useRenameFile = () => {
  return useMutation(api.files.renameFile);
};

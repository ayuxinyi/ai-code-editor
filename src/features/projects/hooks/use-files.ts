import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { sortFiles } from "../utils/project-helper";

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
export const useFileCreate = () =>
  useMutation(api.files.createFile).withOptimisticUpdate(
    (localStore, { name, projectId, content, parentId }) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });
      if (existingFiles !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- 使用 Date.now() 生成时间戳，属于有意的非纯函数调用
        const now = Date.now();
        existingFiles.push({
          projectId,
          parentId,
          name,
          type: "file",
          content,
          _creationTime: now,
          _id: crypto.randomUUID() as Id<"files">,
          updatedAt: now,
        });
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          sortFiles(existingFiles),
        );
      }
    },
  );
/**
 * 创建文件夹
 * @returns void
 */
export const useFolderCreate = () =>
  useMutation(api.files.createFolder).withOptimisticUpdate(
    (localStore, { name, projectId, parentId }) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });
      if (existingFiles !== undefined) {
        // eslint-disable-next-line react-hooks/purity -- 使用 Date.now() 生成时间戳，属于有意的非纯函数调用
        const now = Date.now();
        existingFiles.push({
          projectId,
          parentId,
          name,
          type: "folder",
          _creationTime: now,
          _id: crypto.randomUUID() as Id<"files">,
          updatedAt: now,
        });
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          sortFiles(existingFiles),
        );
      }
    },
  );
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
export const useDeleteFile = ({ projectId, parentId }: IdProps) =>
  useMutation(api.files.deleteFile)
    // 乐观更新
    .withOptimisticUpdate((localStore, { id }) => {
      // 从本地存储中获取当前文件夹的内容
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });
      // 如果当前文件夹的内容存在，则更新文件夹内容
      if (existingFiles !== undefined) {
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          // 从当前文件夹内容中过滤出删除的文件
          existingFiles.filter(item => item._id !== id),
        );
      }
    });

/**
 * 重命名文件
 * @returns void
 */
export const useRenameFile = ({ projectId, parentId }: IdProps) =>
  useMutation(api.files.renameFile).withOptimisticUpdate(
    (localStore, { id, name }) => {
      const existingFiles = localStore.getQuery(api.files.getFolderContents, {
        projectId,
        parentId,
      });
      if (existingFiles !== undefined) {
        localStore.setQuery(
          api.files.getFolderContents,
          { projectId, parentId },
          sortFiles(
            existingFiles.map(item => ({
              ...item,
              name: item._id === id ? name : item.name,
            })),
          ),
        );
      }
    },
  );

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

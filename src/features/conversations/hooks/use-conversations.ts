import { useMutation, useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

// 创建对话
export const useCreateConversation = () =>
  useMutation(api.conversations.create).withOptimisticUpdate(
    (localStore, { projectId, title }) => {
      const existingConversations = localStore.getQuery(
        api.conversations.getByProjectId,
        { projectId },
      );
      if (existingConversations) {
        // eslint-disable-next-line react-hooks/purity -- 使用 Date.now() 生成时间戳，属于有意的非纯函数调用
        const now = Date.now();
        localStore.setQuery(api.conversations.getByProjectId, { projectId }, [
          {
            _id: crypto.randomUUID() as Id<"conversations">,
            projectId,
            title,
            _creationTime: now,
            updatedAt: now,
          },
          ...existingConversations,
        ]);
      }
    },
  );

// 获取对话详情
export const useConversationById = (
  conversationId: Id<"conversations"> | null,
) =>
  useQuery(
    api.conversations.getById,
    conversationId ? { conversationId } : "skip",
  );

// 获取项目下的所有对话
export const useConversationByProject = (projectId: Id<"projects"> | null) =>
  useQuery(
    api.conversations.getByProjectId,
    projectId ? { projectId } : "skip",
  );

// 获取对话下的所有消息
export const useMessages = (conversationId: Id<"conversations"> | null) =>
  useQuery(
    api.conversations.getMessages,
    conversationId ? { conversationId } : "skip",
  );

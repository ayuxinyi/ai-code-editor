import { v } from "convex/values";

import { mutation } from "../_generated/server";
import { validateInternalKey } from "../utils/auth_helper";

/**
 * 创建项目并初始化一个对话
 * @description
 * 在创建项目的同时，初始化一个对话，用于后续的交互
 * @param internalKey 项目的内部密钥，用于验证权限
 * @param projectName 项目名称
 * @param conversationTitle 对话标题
 * @param ownerId 项目所有者id
 * @returns 项目id和对话id
 */
export const createProjectWithConversation = mutation({
  args: {
    internalKey: v.string(),
    projectName: v.string(),
    conversationTitle: v.string(),
    ownerId: v.string(),
  },
  async handler(ctx, { internalKey, projectName, conversationTitle, ownerId }) {
    validateInternalKey(internalKey);
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      name: projectName,
      ownerId,
      updatedAt: now,
    });

    const conversationId = await ctx.db.insert("conversations", {
      title: conversationTitle,
      projectId,
      updatedAt: now,
    });

    return { projectId, conversationId };
  },
});

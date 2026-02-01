/**
 * @file 通过第三方API调用convex函数
 */

import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { validateInternalKey } from "./utils/auth_helper";

export const getConversationById = query({
  args: {
    conversationId: v.id("conversations"),
    internalKey: v.string(),
  },
  async handler(ctx, { conversationId, internalKey }) {
    validateInternalKey(internalKey);
    return ctx.db.get("conversations", conversationId);
  },
});

// 创建一条消息
export const createMessage = mutation({
  args: {
    internalKey: v.string(),
    conversationId: v.id("conversations"),
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
  },
  async handler(
    ctx,
    { internalKey, conversationId, projectId, role, content, status },
  ) {
    validateInternalKey(internalKey);
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      projectId,
      role,
      content,
      status,
    });
    // 更新对话表的更新时间
    await ctx.db.patch("conversations", conversationId, {
      updatedAt: Date.now(),
    });
    return messageId;
  },
});

// 更新AI助手消息的内容
export const updateMessageContent = mutation({
  args: {
    internalKey: v.string(),
    messageId: v.id("messages"),
    content: v.optional(v.string()),
  },
  async handler(ctx, { internalKey, messageId, content }) {
    validateInternalKey(internalKey);
    await ctx.db.patch("messages", messageId, {
      content,
      status: "completed" as const,
    });
    return messageId;
  },
});

// 更新消息状态
export const updateMessageStatus = mutation({
  args: {
    internalKey: v.string(),
    messageId: v.id("messages"),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  async handler(ctx, { internalKey, messageId, status }) {
    validateInternalKey(internalKey);
    await ctx.db.patch("messages", messageId, {
      status,
    });
    return messageId;
  },
});
// 获取项目中正在处理中的消息
export const getProcessingMessages = query({
  args: {
    projectId: v.id("projects"),
    internalKey: v.string(),
  },
  async handler(ctx, { projectId, internalKey }) {
    validateInternalKey(internalKey);
    return ctx.db
      .query("messages")
      .withIndex("by_project_status", q =>
        q.eq("projectId", projectId).eq("status", "processing"),
      )
      .collect();
  },
});

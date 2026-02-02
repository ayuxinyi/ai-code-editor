/**
 * @file 通过第三方API调用convex函数
 */

import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { validateInternalKey } from "./utils/auth_helper";

/**
 * 根据 ID 获取对话详情
 * @description
 * 用于检索特定对话的元数据。
 */
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

/**
 * 创建新消息
 * @description
 * 在对话中插入一条新消息（用户发送或 AI 初始响应）。
 * 插入后会自动更新所属对话的 `updatedAt` 字段，以确保对话列表的活跃排序。
 */
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

    // 联动更新对话表的最后活跃时间
    await ctx.db.patch("conversations", conversationId, {
      updatedAt: Date.now(),
    });
    return messageId;
  },
});

/**
 * 更新消息文本内容
 * @description
 * 通常用于 AI 完成流式输出后同步最终内容。
 * 执行此操作会将消息状态自动标记为 `completed`（已完成）。
 */
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

/**
 * 更新消息生命周期状态
 * @description
 * 手动控制消息的状态流转（如从 processing 变更为 cancelled）。
 * 用于处理生成异常或用户手动中断任务的场景。
 */
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

/**
 * 获取项目中正在处理的消息
 * @description
 * 检索指定项目下所有状态为 `processing` 的消息。
 */
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

import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./utils/auth_helper";
import { requireProject } from "./utils/project.helper";

// 创建对话
export const create = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
  },
  async handler(ctx, { projectId, title }) {
    const identity = await verifyAuth(ctx);

    await requireProject(ctx, projectId, identity.subject);
    const conversationId = await ctx.db.insert("conversations", {
      projectId,
      title,
      updatedAt: Date.now(),
    });
    return conversationId;
  },
});

// 获取对话详情
export const getById = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, { conversationId }) {
    const identity = await verifyAuth(ctx);
    const conversation = await ctx.db.get("conversations", conversationId);
    if (!conversation) {
      throw new ConvexError(
        "很抱歉，您要查看的对话记录不存在，请检查后重试或联系客服。"
      );
    }
    await requireProject(ctx, conversation.projectId, identity.subject);
    return conversation;
  },
});

// 获取项目下的所有对话
export const getByProjectId = query({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, { projectId }) {
    const identity = await verifyAuth(ctx);
    await requireProject(ctx, projectId, identity.subject);
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_projectId", q => q.eq("projectId", projectId))
      .order("desc")
      .collect();

    return conversations;
  },
});

// 获取对话下的所有消息
export const getMessages = query({
  args: {
    conversationId: v.id("conversations"),
  },
  async handler(ctx, { conversationId }) {
    const identity = await verifyAuth(ctx);
    const conversation = await ctx.db.get("conversations", conversationId);
    if (!conversation) {
      throw new ConvexError(
        "很抱歉，您要查看的对话记录不存在，请检查后重试或联系客服。"
      );
    }
    await requireProject(ctx, conversation.projectId, identity.subject);
    return ctx.db
      .query("messages")
      .withIndex("by_conversationId", q =>
        q.eq("conversationId", conversationId)
      )
      .order("asc")
      .collect();
  },
});

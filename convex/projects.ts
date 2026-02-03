import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./utils/auth_helper";
import { requireProject } from "./utils/project.helper";

/**
 * 创建项目
 * @param name 项目名称
 * @returns 项目ID
 */
export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, { name }) {
    const identity = await verifyAuth(ctx);
    const projectId = await ctx.db.insert("projects", {
      name,
      ownerId: identity.subject,
      updatedAt: Date.now(),
    });
    return projectId;
  },
});

/**
 * 获取用户部分项目
 * @param limit 项目数量，默认10
 * @returns 项目列表
 */
export const getPartial = query({
  args: {
    limit: v.optional(v.number()),
  },
  async handler(ctx, { limit = 10 }) {
    const identity = await verifyAuth(ctx);
    if (!identity) {
      return [];
    }
    return ctx.db
      .query("projects")
      .withIndex("by_ownerId", q => q.eq("ownerId", identity.subject))
      .order("desc")
      .take(limit);
  },
});

/**
 * 获取用户所有项目
 */
export const get = query({
  args: {},
  async handler(ctx) {
    const identity = await verifyAuth(ctx);
    if (!identity) {
      return [];
    }
    return ctx.db
      .query("projects")
      .withIndex("by_ownerId", q => q.eq("ownerId", identity.subject))
      .order("desc")
      .collect();
  },
});

/**
 * 根据项目ID获取项目详情
 * @param projectId 项目ID
 * @returns 项目详情
 */
export const getProjectById = query({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, { projectId }) {
    const identity = await verifyAuth(ctx);
    const project = await requireProject(ctx, projectId, identity.subject);
    return project;
  },
});

/**
 * 重命名项目
 * @param projectId 项目ID
 * @param name 新的项目名称
 * @returns 项目ID
 */
export const rename = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.string(),
  },
  async handler(ctx, { projectId, name }) {
    const identity = await verifyAuth(ctx);
    await requireProject(ctx, projectId, identity.subject);
    await ctx.db.patch("projects", projectId, {
      name,
      updatedAt: Date.now(),
    });
  },
});

/**
 * 更新项目设置
 * @param id 项目ID
 * @param devCommand 开发命令
 * @param installCommand 安装命令
 */
export const updateSettings = mutation({
  args: {
    id: v.id("projects"),
    settings: v.object({
      devCommand: v.optional(v.string()),
      installCommand: v.optional(v.string()),
    }),
  },
  async handler(ctx, { id, settings }) {
    const identity = await verifyAuth(ctx);
    await requireProject(ctx, id, identity.subject);
    await ctx.db.patch("projects", id, {
      settings,
      updatedAt: Date.now(),
    });
  },
});

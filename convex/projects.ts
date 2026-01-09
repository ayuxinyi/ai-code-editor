import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./utils/auth_helper";

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

// 获取用户部分项目
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

// 获取用户所有项目
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

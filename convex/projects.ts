import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    name: v.string(),
  },
  async handler(ctx, { name }) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("很抱歉，您需要先登录才能创建项目");
    }
    await ctx.db.insert("projects", { name, ownerId: identity.subject });
  },
});

export const get = query({
  args: {},
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    return await ctx.db
      .query("projects")
      .withIndex("by_ownerId", q => q.eq("ownerId", identity.subject))
      .collect();
  },
});

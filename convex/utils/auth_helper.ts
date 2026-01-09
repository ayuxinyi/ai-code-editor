import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "./_generated/server";

// 验证用户身份
export const verifyAuth = async (ctx: MutationCtx | QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("很抱歉，您当前尚未登录，请登录后继续操作。");
  }
  return identity;
};

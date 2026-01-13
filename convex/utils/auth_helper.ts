import { ConvexError } from "convex/values";

import type { MutationCtx, QueryCtx } from "../_generated/server";

// 验证用户身份
export const verifyAuth = async (ctx: MutationCtx | QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("很抱歉，您当前尚未登录，请登录后继续操作。");
  }
  return identity;
};

// 验证内部密钥，这可以保护我们的函数在第三方调用时，只有当内部密钥匹配时才会执行，保护我们的数据
export const validateInternalKey = (key: string) => {
  const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
  if (!internalKey) {
    throw new ConvexError(
      "很抱歉，您未配置POLARIS_CONVEX_INTERNAL_KEY环境变量，请配置后再进行操作，这可以防止您的数据外泄。"
    );
  }
  if (key !== internalKey) {
    throw new ConvexError(
      "很抱歉，您提供的POLARIS_CONVEX_INTERNAL_KEY密钥无效，您无权进行该操作，请检查后再进行操作。"
    );
  }
};

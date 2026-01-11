import { ConvexError } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = MutationCtx | QueryCtx;

/** 校验项目存在 + 属于当前用户 */
export const requireProject = async (
  ctx: Ctx,
  projectId: Id<"projects">,
  subject: string
) => {
  const project = await ctx.db.get("projects", projectId);

  if (!project) {
    throw new ConvexError("很抱歉，您要访问的项目不存在，请检查项目ID是否正确");
  }

  if (project.ownerId !== subject) {
    throw new ConvexError("很抱歉，您没有权限访问该项目");
  }

  return project;
};

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    ownerId: v.string(),
    importStatus: v.optional(
      v.union(
        v.literal("importing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  })
    // 定义一个索引，用于根据ownerId查询项目，可以根据ownerId快速查询用户所有的项目
    .index("by_ownerId", ["ownerId"]),
});

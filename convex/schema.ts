import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  projects: defineTable({
    name: v.string(),
    ownerId: v.string(),
    updatedAt: v.number(),
    importStatus: v.optional(
      v.union(
        v.literal("importing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    exportStatus: v.optional(
      v.union(
        v.literal("exporting"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
    exportRepoUrl: v.optional(v.string()),
  })
    // 定义一个索引，用于根据ownerId查询项目，可以根据ownerId快速查询用户所有的项目
    .index("by_ownerId", ["ownerId"]),
  files: defineTable({
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    type: v.union(v.literal("folder"), v.literal("file")),
    // 仅适用于文本文件
    content: v.optional(v.string()),
    // 用于保存图片，文件等二进制数据，我们会将这些二进制数据保存在convex的存储中
    storageId: v.optional(v.id("_storage")),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_parentId", ["parentId"])
    .index("by_project_parent", ["projectId", "parentId"]),
  // 对话表，用于存储用户与AI的对话记录
  conversations: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    updatedAt: v.number(),
  }).index("by_projectId", ["projectId"]),
  // 消息表，用于存储对话记录
  messages: defineTable({
    conversationId: v.id("conversations"),
    projectId: v.id("projects"),
    // 用户角色，用于区分用户和AI
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    // 消息状态，用于区分消息是否处理完成
    status: v.optional(
      v.union(
        v.literal("processing"),
        v.literal("completed"),
        v.literal("cancelled")
      )
    ),
  })
    .index("by_conversationId", ["conversationId"])
    .index("by_project_status", ["projectId", "status"]),
});

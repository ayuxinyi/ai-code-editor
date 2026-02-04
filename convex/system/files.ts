/**
 * AI Agent 相关 API，这些 API 主要用于与 AI 助手交互，处理用户请求、生成回复、更新对话状态等。
 */

import { ConvexError, v } from "convex/values";

import { mutation, query } from "../_generated/server";
import { validateInternalKey } from "../utils/auth_helper";
import { deleteRecursive } from "../utils/file.helper";

/**
 * 获取项目文件结构
 * * @description
 * 获取指定项目下的所有文件列表。
 * 这些文件元数据将注入 AI 助手的上下文，使其具备项目感知能力，从而生成更符合当前代码库逻辑的回复。
 */
export const getProjectFiles = query({
  args: {
    projectId: v.id("projects"),
    internalKey: v.string(),
  },
  async handler(ctx, { projectId, internalKey }) {
    validateInternalKey(internalKey);
    return ctx.db
      .query("files")
      .withIndex("by_projectId", q => q.eq("projectId", projectId))
      .collect();
  },
});

/**
 * 根据文件ID获取文件详情
 * * @description
 * 用于检索特定文件的详细信息。
 * 通常在需要展示文件内容或进行文件操作（如编辑、删除）时调用。
 */
export const getFileById = query({
  args: {
    fileId: v.id("files"),
    internalKey: v.string(),
  },
  async handler(ctx, { fileId, internalKey }) {
    validateInternalKey(internalKey);
    return ctx.db.get("files", fileId);
  },
});

/**
 * 更新文件内容
 * * @description
 * 用于修改指定文件的内容。
 * 通常在用户编辑文件内容后调用，确保文件内容与最新状态保持同步。
 */
export const updateFile = mutation({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
    content: v.string(),
  },
  async handler(ctx, { internalKey, fileId, content }) {
    validateInternalKey(internalKey);
    const file = await ctx.db.get("files", fileId);
    if (!file) {
      throw new ConvexError(
        `很抱歉，我们无法找到文件 ${fileId}，请确定文件是否存在`,
      );
    }
    await ctx.db.patch("files", fileId, {
      content,
      updatedAt: Date.now(),
    });
    return fileId;
  },
});

/**
 * 创建文件
 * * @description
 * 用于在指定项目下创建一个新文件。
 * 确保文件名在当前文件夹下不重复，避免冲突。
 */
export const createFile = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    content: v.string(),
    parentId: v.optional(v.id("files")),
  },
  async handler(ctx, { internalKey, projectId, name, content, parentId }) {
    validateInternalKey(internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId),
      )
      .collect();
    if (
      files.length > 0 &&
      files.some(file => file.name === name && file.type === "file")
    ) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名文件，无法创建文件，请修改文件名后重试。`,
      );
    }

    const fileId = await ctx.db.insert("files", {
      projectId,
      name,
      content,
      parentId,
      type: "file",
      updatedAt: Date.now(),
    });

    // 更新项目的更新时间
    await ctx.db.patch("projects", projectId, {
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

// 批量创建文件
export const createFiles = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    files: v.array(
      v.object({
        name: v.string(),
        content: v.string(),
      }),
    ),
  },
  async handler(ctx, { internalKey, projectId, files, parentId }) {
    validateInternalKey(internalKey);
    const existingFiles = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId),
      )
      .collect();

    const results: Array<{
      name: string;
      fileId: string;
      error?: string;
    }> = [];
    for (const file of files) {
      const existing = existingFiles.find(
        f => f.name === file.name && f.type === "file",
      );
      if (existing) {
        results.push({
          name: file.name,
          fileId: existing._id,
          error: "文件名已存在，无法创建重复文件",
        });
        continue;
      }

      const fileId = await ctx.db.insert("files", {
        projectId,
        name: file.name,
        content: file.content,
        parentId,
        type: "file",
        updatedAt: Date.now(),
      });
      results.push({
        name: file.name,
        fileId,
      });
    }
    await ctx.db.patch("projects", projectId, {
      updatedAt: Date.now(),
    });
    return results;
  },
});

export const createFolder = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    parentId: v.optional(v.id("files")),
  },
  async handler(ctx, { internalKey, projectId, name, parentId }) {
    validateInternalKey(internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId),
      )
      .collect();
    if (
      files.length > 0 &&
      files.some(file => file.name === name && file.type === "folder")
    ) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名文件夹，无法创建文件夹，请修改文件夹名后重试。`,
      );
    }

    const fileId = await ctx.db.insert("files", {
      projectId,
      name,
      parentId,
      type: "folder",
      updatedAt: Date.now(),
    });

    // 更新项目的更新时间
    await ctx.db.patch("projects", projectId, {
      updatedAt: Date.now(),
    });

    return fileId;
  },
});

// 批量创建文件夹
export const createFolders = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    folders: v.array(
      v.object({
        name: v.string(),
      }),
    ),
  },
  async handler(ctx, { internalKey, projectId, folders, parentId }) {
    validateInternalKey(internalKey);

    const existingFiles = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId),
      )
      .collect();

    const results: Array<{
      name: string;
      folderId: string;
      error?: string;
    }> = [];

    for (const folder of folders) {
      const existing = existingFiles.find(
        f => f.name === folder.name && f.type === "folder",
      );
      if (existing) {
        results.push({
          name: folder.name,
          folderId: existing._id,
          error: "文件夹名已存在，无法创建重复文件夹",
        });
        continue;
      }
      const folderId = await ctx.db.insert("files", {
        projectId,
        name: folder.name,
        parentId,
        type: "folder",
        updatedAt: Date.now(),
      });
      results.push({
        name: folder.name,
        folderId,
      });
    }
    await ctx.db.patch("projects", projectId, {
      updatedAt: Date.now(),
    });
    return results;
  },
});

export const renameFile = mutation({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
    name: v.string(),
  },
  async handler(ctx, { internalKey, fileId, name }) {
    validateInternalKey(internalKey);
    const file = await ctx.db.get("files", fileId);
    if (!file) {
      throw new ConvexError(`很抱歉，文件不存在，无法重命名。`);
    }
    // 获取当前文件夹下的所有文件和文件夹
    const siblings = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId),
      )
      .collect();
    // 检查当前文件夹下是否存在同名文件
    if (
      siblings.some(
        f => f.name === name && f.type === "file" && f._id !== fileId,
      )
    ) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名文件，无法重命名，请修改文件名后重试。`,
      );
    }
    await ctx.db.patch("files", fileId, {
      name,
      updatedAt: Date.now(),
    });
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
    return fileId;
  },
});

export const deleteFile = mutation({
  args: {
    internalKey: v.string(),
    fileId: v.id("files"),
  },
  async handler(ctx, { internalKey, fileId }) {
    validateInternalKey(internalKey);
    const file = await ctx.db.get("files", fileId);
    if (!file) {
      throw new ConvexError(`很抱歉，文件不存在，无法删除。`);
    }

    await deleteRecursive(ctx, fileId);

    // 更新项目的更新时间
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
    return fileId;
  },
});

export const getProjectById = query({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
  },
  async handler(ctx, { internalKey, projectId }) {
    validateInternalKey(internalKey);
    const project = await ctx.db.get("projects", projectId);
    if (!project) {
      throw new ConvexError(
        `很抱歉，根据您提供的项目ID ${projectId}，无法找到对应的项目，请检查项目ID是否正确。`,
      );
    }
    return project;
  },
});

import { ConvexError, v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./utils/auth_helper";
import { requireProject } from "./utils/project.helper";

// 获取项目下的所有文件
export const getFiles = query({
  args: {
    projectId: v.id("projects"),
  },
  async handler(ctx, { projectId }) {
    const identity = await verifyAuth(ctx);

    await requireProject(ctx, projectId, identity.subject);

    return ctx.db
      .query("files")
      .withIndex("by_projectId", q => q.eq("projectId", projectId))
      .collect();
  },
});

// 获取某个文件的详情
export const getFile = query({
  args: {
    fileId: v.id("files"),
  },
  async handler(ctx, { fileId }) {
    const identity = await verifyAuth(ctx);

    const file = await ctx.db.get("files", fileId);
    if (!file) {
      throw new ConvexError(
        "很抱歉，您要访问的文件不存在，请检查文件ID是否正确"
      );
    }
    await requireProject(ctx, file.projectId, identity.subject);

    return file;
  },
});

// 获取某个文件夹的内容
export const getFolderContents = query({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
  },
  async handler(ctx, { projectId, parentId }) {
    const identity = await verifyAuth(ctx);

    await requireProject(ctx, projectId, identity.subject);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId)
      )
      .collect();

    // 对文件进行排序，文件夹优先，然后按照文件的字母排序排列
    return files.sort((a, b) => {
      if (a.type === "folder" && b.type === "file") return -1;
      if (a.type === "file" && b.type === "folder") return 1;
      return a.name.localeCompare(b.name);
    });
  },
});

// 创建文件
export const createFile = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
    content: v.optional(v.string()),
  },
  async handler(ctx, { projectId, parentId, name, content }) {
    const identity = await verifyAuth(ctx);

    await requireProject(ctx, projectId, identity.subject);

    // 在同一个项目的同一个文件夹下，文件名不能重复
    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId)
      )
      .collect();
    if (files.some(file => file.name === name && file.type === "file")) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名文件，无法创建文件，请修改文件名后重试。`
      );
    }

    const now = Date.now();
    await ctx.db.insert("files", {
      projectId,
      parentId,
      name,
      content,
      updatedAt: now,
      type: "file",
    });
    // 更新项目的更新时间
    await ctx.db.patch("projects", projectId, {
      updatedAt: now,
    });
  },
});

// 创建文件夹
export const createFolder = mutation({
  args: {
    projectId: v.id("projects"),
    parentId: v.optional(v.id("files")),
    name: v.string(),
  },
  async handler(ctx, { projectId, parentId, name }) {
    const identity = await verifyAuth(ctx);

    await requireProject(ctx, projectId, identity.subject);

    // 在同一个项目的同一个文件夹下，文件夹名称不能重复
    const folders = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId)
      )
      .collect();
    if (
      folders.some(folder => folder.name === name && folder.type === "folder")
    ) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名文件夹，无法创建文件夹，请修改文件夹名称后重试。`
      );
    }
    const now = Date.now();
    await ctx.db.insert("files", {
      projectId,
      parentId,
      name,
      updatedAt: now,
      type: "folder",
    });
    // 更新项目的更新时间
    await ctx.db.patch("projects", projectId, {
      updatedAt: now,
    });
  },
});

export const renameFile = mutation({
  args: {
    id: v.id("files"),
    name: v.string(),
  },
  async handler(ctx, { id, name }) {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", id);
    if (!file) {
      throw new ConvexError(
        "很抱歉，您要访问的文件不存在，请检查文件ID是否正确"
      );
    }
    await requireProject(ctx, file.projectId, identity.subject);

    const siblings = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", file.projectId).eq("parentId", file.parentId)
      )
      .collect();

    // 需要确保重命名后的文件名在当前文件夹下不存在重复
    if (
      siblings.some(
        sibling =>
          sibling.name === name &&
          sibling.type === file.type &&
          sibling._id !== id
      )
    ) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名${file.type === "file" ? "文件" : "文件夹"}，无法重命名，请修改名称后重试。`
      );
    }

    const now = Date.now();
    await ctx.db.patch("files", id, {
      name,
      updatedAt: now,
    });

    // 更新项目的更新时间
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: now,
    });
  },
});

export const deleteFile = mutation({
  args: {
    id: v.id("files"),
  },
  async handler(ctx, { id }) {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", id);
    if (!file) {
      throw new ConvexError(
        "很抱歉，您要访问的文件不存在，请检查文件ID是否正确"
      );
    }
    await requireProject(ctx, file.projectId, identity.subject);

    // 递归删除文件夹下的所有文件和子文件夹
    const deleteRecursive = async (fileId: typeof id) => {
      // 找到文件
      const item = await ctx.db.get("files", fileId);
      // 文件不存在，直接返回
      if (!item) return;
      // 如果是文件夹，递归删除子文件夹下的所有文件和子文件夹
      if (item.type === "folder") {
        const children = await ctx.db
          .query("files")
          .withIndex("by_project_parent", q =>
            q.eq("projectId", item.projectId).eq("parentId", fileId)
          )
          .collect();
        // 遍历所有的子文件夹和文件，递归删除
        for (const child of children) {
          await deleteRecursive(child._id);
        }
      }
      // 删除文件及二进制数据
      if (item.storageId) {
        await ctx.storage.delete(item.storageId);
      }
      await ctx.db.delete("files", fileId);
    };

    // 开始递归删除
    await deleteRecursive(id);

    // 更新项目的更新时间
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: Date.now(),
    });
  },
});

// 更新文件的内容
export const updateFile = mutation({
  args: {
    id: v.id("files"),
    content: v.string(),
  },
  async handler(ctx, { id, content }) {
    const identity = await verifyAuth(ctx);
    const file = await ctx.db.get("files", id);
    if (!file) {
      throw new ConvexError(
        "很抱歉，您要访问的文件不存在，请检查文件ID是否正确"
      );
    }
    await requireProject(ctx, file.projectId, identity.subject);

    const now = Date.now();

    // 更新文件的内容
    await ctx.db.patch("files", id, {
      content,
      updatedAt: now,
    });

    // 更新项目的更新时间
    await ctx.db.patch("projects", file.projectId, {
      updatedAt: now,
    });
  },
});

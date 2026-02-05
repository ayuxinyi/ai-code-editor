/**
 * github 相关操作
 * @file 用于与github进行交互，比如导入github仓库中的代码到项目中
 */

import { ConvexError, v } from "convex/values";

import { mutation, query } from "../_generated/server";
import { authComponent, createAuth } from "../auth";
import { validateInternalKey } from "../utils/auth_helper";

/**
 * 清理项目中的所有文件
 * @description
 * 在导入github仓库中的代码到项目中时，需要先清理项目中的所有文件
 * @param projectId 项目id
 * @param internalKey 项目的内部密钥，用于验证权限
 * @returns 清理的文件数量
 */
export const cleanup = mutation({
  args: {
    projectId: v.id("projects"),
    internalKey: v.string(),
  },
  async handler(ctx, { projectId, internalKey }) {
    validateInternalKey(internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_projectId", q => q.eq("projectId", projectId))
      .collect();
    for (const file of files) {
      if (file.storageId) {
        await ctx.storage.delete(file.storageId);
      }
      await ctx.db.delete("files", file._id);
    }

    return { deleted: files.length };
  },
});

/**
 * 生成上传文件的url
 * @description
 * 用于生成上传文件的url，用于后续的文件上传操作
 * @param internalKey 项目的内部密钥，用于验证权限
 * @returns 上传文件的url
 */
export const generateUploadUrl = mutation({
  args: {
    internalKey: v.string(),
  },
  async handler(ctx, { internalKey }) {
    validateInternalKey(internalKey);
    // 在convex中如果要上传文件，需要从storage中生成上传url
    const uploadUrl = await ctx.storage.generateUploadUrl();
    return uploadUrl;
  },
});

/**
 * 创建二进制文件
 * @description
 * 用于创建一个二进制文件，比如图片、文件等
 * @param internalKey 项目的内部密钥，用于验证权限
 * @param projectId 项目id
 * @param name 文件名
 * @param storageId 存储id，用于存储文件的二进制数据
 * @param parentId 父文件夹id，用于指定文件的存储位置
 * @returns 文件id
 */
export const createBinaryFile = mutation({
  args: {
    internalKey: v.string(),
    projectId: v.id("projects"),
    name: v.string(),
    storageId: v.id("_storage"),
    parentId: v.optional(v.id("files")),
  },
  async handler(ctx, { internalKey, projectId, name, storageId, parentId }) {
    validateInternalKey(internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", projectId).eq("parentId", parentId),
      )
      .collect();

    const existingFile = files.find(
      file => file.name === name && file.type === "file",
    );

    if (existingFile) {
      throw new ConvexError(
        `很抱歉，在当前文件夹下，已经存在一个同名文件，无法创建文件，请修改文件名后重试。`,
      );
    }

    const fileId = await ctx.db.insert("files", {
      projectId,
      parentId,
      name,
      updatedAt: Date.now(),
      type: "file",
      storageId,
    });

    await ctx.db.patch("projects", projectId, { updatedAt: Date.now() });

    return fileId;
  },
});

/**
 * 更新项目的导入状态
 * @description
 * 在导入github仓库中的代码到项目中时，需要更新项目的导入状态
 * @param projectId 项目id
 * @param internalKey 项目的内部密钥，用于验证权限
 * @param status 导入状态，可选值为importing、completed、failed
 * @returns void
 */
export const updateProjectImportStatus = mutation({
  args: {
    projectId: v.id("projects"),
    internalKey: v.string(),
    status: v.optional(
      v.union(
        v.literal("importing"),
        v.literal("completed"),
        v.literal("failed"),
      ),
    ),
  },
  async handler(ctx, { projectId, internalKey, status }) {
    validateInternalKey(internalKey);

    await ctx.db.patch("projects", projectId, {
      importStatus: status,
      updatedAt: Date.now(),
    });
  },
});

/**
 * 更新项目的导出状态
 * @description
 * 在导出项目中的代码到github仓库时，需要更新项目的导出状态
 * @param projectId 项目id
 * @param internalKey 项目的内部密钥，用于验证权限
 * @param status 导出状态，可选值为exporting、completed、failed、cancelled
 * @param repoUrl 导出的github仓库url
 * @returns void
 */
export const updateProjectExportStatus = mutation({
  args: {
    projectId: v.id("projects"),
    internalKey: v.string(),
    status: v.optional(
      v.union(
        v.literal("exporting"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled"),
      ),
    ),
    repoUrl: v.optional(v.string()),
  },
  async handler(ctx, { projectId, internalKey, status, repoUrl }) {
    validateInternalKey(internalKey);

    await ctx.db.patch("projects", projectId, {
      exportStatus: status,
      updatedAt: Date.now(),
      exportRepoUrl: repoUrl,
    });
  },
});

/**
 * 获取项目中的所有文件，包括文件的url
 * @description
 * 对于二进制文件，需要获取文件的url，用于后续的展示
 * @param projectId 项目id
 * @param internalKey 项目的内部密钥，用于验证权限
 * @returns 文件列表(包含二进制文件在convex storage中的url)
 */
export const getProjectFilesWithUrls = query({
  args: {
    projectId: v.id("projects"),
    internalKey: v.string(),
  },
  async handler(ctx, { projectId, internalKey }) {
    validateInternalKey(internalKey);

    const files = await ctx.db
      .query("files")
      .withIndex("by_projectId", q => q.eq("projectId", projectId))
      .collect();

    return await Promise.all(
      files.map(async file => {
        if (file.type === "file" && file.storageId) {
          const url = await ctx.storage.getUrl(file.storageId);
          return { ...file, storageUrl: url };
        }
        return { ...file, storageUrl: null };
      }),
    );
  },
});

/**
 * 创建一个github项目
 * @description
 * 在导入github仓库中的代码到项目中时，需要先创建一个项目
 * @param name 项目名称
 * @param internalKey 项目的内部密钥，用于验证权限
 * @param ownerId 项目的所有者id
 * @returns 项目id
 */
export const createGithubProject = mutation({
  args: {
    name: v.string(),
    internalKey: v.string(),
    ownerId: v.string(),
  },
  async handler(ctx, { name, internalKey, ownerId }) {
    validateInternalKey(internalKey);

    const projectId = await ctx.db.insert("projects", {
      importStatus: "importing",
      name,
      updatedAt: Date.now(),
      ownerId,
    });

    return projectId;
  },
});

/**
 * 获取github项目的访问令牌
 * @description
 * 在导入github仓库中的代码到项目中时，需要获取github项目的访问令牌
 * @returns 访问令牌
 */
export const getGithubAccessToken = query({
  args: {},
  handler: async ctx => {
    try {
      // 从组件拿到 Better Auth 的实例和带 session cookie 的 headers
      const { auth, headers } = await authComponent.getAuth(createAuth, ctx);

      // providerId 要和你 Better Auth 配置里的 provider key 对上，一般是 "github"
      const token = await auth.api.getAccessToken({
        body: {
          providerId: "github",
        },
        headers,
      });

      // Better Auth 通常会返回 { accessToken, refreshToken, expiresAt, scopes, ... }
      return {
        // github 访问令牌
        accessToken: token.accessToken,
        scopes: token.scopes,
        expiresAt: token.accessTokenExpiresAt,
      };
    } catch {
      return {
        accessToken: null,
        scopes: null,
        expiresAt: null,
      };
    }
  },
});

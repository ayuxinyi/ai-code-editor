import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server"; // 仅导入 MutationCtx

/**
 * 递归删除文件或文件夹
 * @param ctx 必须是 MutationCtx，因为涉及写操作
 * @param fileId 要删除的目标 ID
 */
export const deleteRecursive = async (
  ctx: MutationCtx,
  fileId: Id<"files">,
) => {
  const file = await ctx.db.get("files", fileId);
  if (!file) return;

  if (file.type === "folder") {
    // 查找当前文件夹下的所有子项
    const children = await ctx.db
      .query("files")
      .withIndex("by_project_parent", q =>
        q.eq("projectId", file.projectId).eq("parentId", fileId),
      )
      .collect();

    // 递归删除子项
    for (const child of children) {
      await deleteRecursive(ctx, child._id);
    }
  }

  // 删除文件及二进制数据
  if (file.storageId) {
    await ctx.storage.delete(file.storageId);
  }
  // 删除文件或文件夹记录
  await ctx.db.delete("files", fileId);
};

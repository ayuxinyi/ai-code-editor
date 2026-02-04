import { NonRetriableError } from "inngest";
import { isBinaryFile } from "isbinaryfile";
import ky from "ky";
import { Octokit } from "octokit";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";

export const importGithubRepo = inngest.createFunction(
  {
    id: "import-github-repo",
    name: "Import Github Repo",
    description: "该任务用于实现从github仓库导入代码到项目中",
    // inngest事件失败时，更新项目的导入状态为失败
    onFailure: async ({ event, step }) => {
      const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
      if (!internalKey) return;
      const { projectId } = event.data.event.data;
      await step.run("set-project-status-failed", async () => {
        await convex.mutation(api.system.github.updateProjectImportStatus, {
          projectId,
          status: "failed",
          internalKey,
        });
      });
    },
  },
  {
    event: "github/import.repo",
  },
  async ({ event, step }) => {
    const { githubAccessToken, owner, repo, projectId } = event.data;
    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError(
        "很抱歉，您的环境变量中未配置POLARIS_CONVEX_INTERNAL_KEY，无法连接到Convex数据库",
      );
    }

    // 1. 初始化octokit，用于调用github api
    const octokit = new Octokit({ auth: githubAccessToken });
    // 2. 先清理项目中的现有文件
    await step.run("cleanup-project-files", async () => {
      await convex.mutation(api.system.github.cleanup, {
        projectId,
        internalKey,
      });
    });
    // 3. 获取仓库的文件树
    const tree = await step.run("fetch-repo-tree", async () => {
      try {
        const { data } = await octokit.rest.git.getTree({
          // owner 仓库的所有者
          owner,
          // repo 仓库的名称
          repo,
          // tree_sha 要获取的树的SHA值，默认是main分支
          tree_sha: "main",
          // recursive 是否递归获取子目录，默认是0不递归
          recursive: "1",
        });
        return data;
      } catch {
        const { data } = await octokit.rest.git.getTree({
          // owner 仓库的所有者
          owner,
          // repo 仓库的名称
          repo,
          // tree_sha 要获取的树的SHA值，默认是main分支
          // - 旧版本的github仓库默认分支是master
          tree_sha: "master",
          // recursive 是否递归获取子目录，默认是0不递归
          recursive: "1",
        });
        return data;
      }
    });
    // 4. 在得到文件树后，我们需要按照深度对文件树进行排序
    // - 例如得到的内容：[{path:"src/components"},{path:"src"},{path:"src/components/ui"}]
    // - 我们需要输出：[{path:"src"},{path:"src/components"},{path:"src/components/ui"}]
    const folders = tree.tree
      .filter(item => item.type === "tree" && item.path)
      .sort((a, b) => {
        const aDepth = a.path ? a.path.split("/").length : 0;
        const bDepth = b.path ? b.path.split("/").length : 0;
        return aDepth - bDepth;
      });
    // 5. 遍历排序后的文件夹列表，创建文件夹
    const folderIdMap = await step.run("create-folders", async () => {
      // 5.1 初始化一个空的map，用于存储文件夹路径到文件夹id的映射
      const map: Record<string, Id<"files">> = {};
      // 5.2 遍历文件夹列表，创建文件夹
      for (const folder of folders) {
        // 5.2.1 如果文件夹路径为空，跳过
        if (!folder.path) continue;
        // 5.2.2 从路径中提取文件夹名称和父路径
        const pathParts = folder.path.split("/");
        const name = pathParts.pop()!;
        const parentPath = pathParts.join("/");
        // 5.2.3 如果父路径存在，从map中获取父文件夹id，否则为undefined
        const parentId = parentPath ? map[parentPath] : undefined;
        // 5.2.4 创建文件夹并将其id存储到map中
        const folderId = await convex.mutation(api.system.files.createFolder, {
          projectId,
          parentId,
          name,
          internalKey,
        });
        map[folder.path] = folderId;
      }
      // 5.3 返回文件夹路径到文件夹id的映射
      // - 例如：{"src": "folderId1", "src/components": "folderId2", "src/components/ui": "folderId3"}
      // - 这样当我们在创建子文件时，就可以根据路径快速找到对应的父文件夹id
      return map;
    });
    // 6.从树中获取所有的二进制文件
    const allFiles = tree.tree.filter(
      item => item.type === "blob" && item.path && item.sha,
    );
    // 7.创建所有的文件
    await step.run("create-files", async () => {
      // 7.1 遍历所有文件，创建文件
      for (const file of allFiles) {
        // 7.1.1 如果文件路径为空或者文件sha为空，跳过
        if (!file.path || !file.sha) continue;
        try {
          // 7.1.2 从github获取文件内容
          const { data: blobData } = await octokit.rest.git.getBlob({
            owner,
            repo,
            file_sha: file.sha,
          });
          // 7.1.3 将blob数据转换为buffer
          const buffer = Buffer.from(blobData.content, "base64");
          // 7.1.4 判断文件是否是二进制文件
          const isBinary = await isBinaryFile(buffer);
          // 7.1.5 获取文件名称以及文件所处的文件夹ID
          const pathParts = file.path.split("/");
          const name = pathParts.pop()!;
          const parentPath = pathParts.join("/");
          const parentId = parentPath ? folderIdMap[parentPath] : undefined;

          // 7.1.6 根据文件的类型去创建文件
          if (isBinary) {
            // 如果是二进制文件，我们需要上传到convex的storage中
            // 7.1.6.1 生成上传文件的url
            const uploadUrl = await convex.mutation(
              api.system.github.generateUploadUrl,
              {
                internalKey,
              },
            );
            // 7.1.6.2 上传文件到convex的storage中
            const { storageId } = await ky
              .post(uploadUrl, {
                headers: {
                  "Content-Type": "application/octet-stream",
                },
                body: buffer,
              })
              .json<{ storageId: Id<"_storage"> }>();
            // 7.1.6.3 创建文件记录
            await convex.mutation(api.system.github.createBinaryFile, {
              projectId,
              internalKey,
              parentId,
              name,
              storageId,
            });
          } else {
            // 如果不是二进制文件，我们只需要将内容转换为utf-8编码的字符串
            const content = buffer.toString("utf-8");
            // 7.1.6.4 创建文件记录
            await convex.mutation(api.system.files.createFile, {
              projectId,
              internalKey,
              parentId,
              name,
              content,
            });
          }
        } catch (error) {
          console.error(`导入文件${file.path}失败`, error);
        }
      }
    });

    // 8. 更改项目状态为已导入
    await convex.mutation(api.system.github.updateProjectImportStatus, {
      projectId,
      status: "completed",
      internalKey,
    });
    // 9. 返回成功响应
    return {
      success: true,
      message: "项目导入完成",
      projectId,
    };
  },
);

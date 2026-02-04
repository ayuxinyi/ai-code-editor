import { NonRetriableError } from "inngest";
import ky from "ky";
import { Octokit } from "octokit";

import { inngest } from "@/inngest/client";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../convex/_generated/api";
import type { Doc, Id } from "../../../../convex/_generated/dataModel";

type FileWithUrl = Doc<"files"> & {
  storageUrl: string | null;
};

export const exportToGithub = inngest.createFunction(
  {
    id: "export-to-github",
    name: "Export to Github",
    description: "将项目导出到Github仓库",
    cancelOn: [
      {
        event: "github/export.cancel",
        if: "event.data.projectId == async.data.projectId",
      },
    ],
    onFailure: async ({ event, step }) => {
      const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
      if (!internalKey) return;
      const { projectId } = event.data.event.data;
      await step.run("set-project-export-status-failed", async () => {
        await convex.mutation(api.system.github.updateProjectExportStatus, {
          projectId,
          internalKey,
          status: "failed",
        });
      });
    },
  },
  {
    event: "github/export.repo",
  },
  async ({ event, step }) => {
    const { description, projectId, githubAccessToken, repoName, visibility } =
      event.data;
    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      throw new NonRetriableError(
        "很抱歉，您的环境变量中未配置POLARIS_CONVEX_INTERNAL_KEY，无法连接到Convex数据库",
      );
    }

    // 1. 将项目导出状态设置为导出中
    await step.run("set-project-export-status-exporting", async () => {
      await convex.mutation(api.system.github.updateProjectExportStatus, {
        projectId,
        internalKey,
        status: "exporting",
      });
    });

    // 2. 定义Octokit客户端，用于与Github API交互
    const octokit = new Octokit({ auth: githubAccessToken });

    // 3. 获取github用户信息
    const { data: user } = await step.run("get-github-user", async () => {
      return await octokit.rest.users.getAuthenticated();
    });

    // 4. 创建github仓库
    const { data: repo } = await step.run("create-github-repo", async () => {
      return await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: description || "从Polaris中导入的项目",
        private: visibility === "private",
        auto_init: true,
      });
    });

    // 5. 等到github 初始化仓库
    await step.sleep("wait-for-repo-initialized", "4s");

    // 6. 获得初始提交
    const initialCommitSha = await step.run(
      "get-initial-commit-sha",
      async () => {
        const { data: ref } = await octokit.rest.git.getRef({
          owner: user.login,
          repo: repoName,
          ref: "heads/main",
        });
        return ref.object.sha;
      },
    );

    // 7. 获得项目所有文件
    const files: Array<FileWithUrl> = await step.run(
      "fetch-project-files",
      async () => {
        return await convex.query(api.system.github.getProjectFilesWithUrls, {
          projectId,
          internalKey,
        });
      },
    );

    // 8. 构建文件路径映射
    const buildFilePaths = (files: Array<FileWithUrl>) => {
      const fileMap = new Map<Id<"files">, FileWithUrl>();
      files.forEach(file => fileMap.set(file._id, file));
      const getFullPath = (file: FileWithUrl): string => {
        if (!file.parentId) return file.name;
        const parent = fileMap.get(file.parentId);
        if (!parent) return file.name;
        return `${getFullPath(parent)}/${file.name}`;
      };
      const paths: Record<string, FileWithUrl> = {};
      files.forEach(file => {
        paths[getFullPath(file)] = file;
      });
      return paths;
    };
    const filePaths = buildFilePaths(files);

    // 9. 获得所有文件，过滤掉目录
    const fileEntries = Object.entries(filePaths).filter(
      ([_, file]) => file.type === "file",
    );

    if (fileEntries.length === 0) {
      throw new NonRetriableError("很抱歉，该项目中没有检测到有效文件。");
    }

    // 10. 创建所有文件的blob对象
    const treeItems = await step.run("create-blobs", async () => {
      const items: Array<{
        path: string;
        mode: "100644";
        type: "blob";
        sha: string;
      }> = [];
      for (const [path, file] of fileEntries) {
        let content: string;
        let encoding: "utf-8" | "base64" = "utf-8";
        if (file.content !== undefined) {
          // 文本内容
          content = file.content;
        } else if (file.storageUrl) {
          // 二进制文件
          const response = await ky.get(file.storageUrl);
          const buffer = Buffer.from(await response.arrayBuffer());
          content = buffer.toString("base64");
          encoding = "base64";
        } else {
          // 未知类型文件，跳过
          continue;
        }
        const { data: blob } = await octokit.rest.git.createBlob({
          owner: user.login,
          repo: repoName,
          content,
          encoding,
        });
        items.push({
          path,
          mode: "100644",
          type: "blob",
          sha: blob.sha,
        });
      }
      return items;
    });
    if (treeItems.length === 0) {
      throw new NonRetriableError(
        "很抱歉，创建blob对象失败，可能是文件内容为空或存储链接失效。",
      );
    }

    // 11. 创建git树对象
    const { data: tree } = await step.run("create-tree", async () => {
      return await octokit.rest.git.createTree({
        owner: user.login,
        repo: repoName,
        tree: treeItems,
      });
    });

    // 12. 创建git提交对象
    const { data: commit } = await step.run("create-commit", async () => {
      return await octokit.rest.git.createCommit({
        owner: user.login,
        repo: repoName,
        message: `Initial commit from Polaris project ${projectId}`,
        tree: tree.sha,
        parents: [initialCommitSha],
      });
    });

    // 13. 更新分支引用
    await step.run("update-branch-ref", async () => {
      await octokit.rest.git.updateRef({
        owner: user.login,
        repo: repoName,
        ref: "heads/main",
        sha: commit.sha,
        force: true,
      });
    });

    await step.run("set-project-export-status-complete", async () => {
      await convex.mutation(api.system.github.updateProjectExportStatus, {
        projectId,
        internalKey,
        status: "completed",
        repoUrl: repo.html_url,
      });
    });

    return {
      success: true,
      repoUrl: repo.html_url,
      filesExported: treeItems.length,
    };
  },
);

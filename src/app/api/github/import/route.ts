import { ConvexError } from "convex/values";
import { NonRetriableError } from "inngest";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { object, url, ZodError } from "zod";

import { GITHUB_UNAUTHORIZED_CODE } from "@/constants";
import { inngest } from "@/inngest/client";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";

const requestSchema = object({
  url: url("请输入一个有效的github仓库url"),
});

function parseGithubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("请输入一个有效的github仓库url");
  }
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, ""),
  };
}

/**
 * 导入github仓库中的代码到项目中
 * @param req 请求体，包含github仓库url
 * @returns 导入成功的项目id
 */
export async function POST(req: NextRequest) {
  try {
    // 1. 检查用户是否已登录
    const hasAuth = await isAuthenticated();
    if (!hasAuth) {
      return NextResponse.json(
        { error: "很抱歉，您尚未登录无法进行导入操作，请先登录后重试" },
        { status: 401 },
      );
    }

    const { _id: userId } = await fetchAuthQuery(api.auth.getCurrentUser);
    if (!userId) {
      return NextResponse.json(
        { error: "很抱歉，您的用户信息不存在，请联系管理员" },
        { status: 500 },
      );
    }
    // 2. 解析请求体
    const body = await req.json();
    const { url } = requestSchema.parse(body);
    const { owner, repo } = parseGithubUrl(url);

    // 3. 获取github access token
    const { accessToken } = await fetchAuthQuery(
      api.system.github.getGithubAccessToken,
    );
    if (!accessToken) {
      return NextResponse.json(
        {
          error: "很抱歉，您的github授权已过期或无效，请重新登录",
          code: GITHUB_UNAUTHORIZED_CODE,
        },
        { status: 401 },
      );
    }
    // 5. 获取内部配置的访问convex的内部key，确保数据安全
    const internalKey = process.env.POLARIS_CONVEX_INTERNAL_KEY;
    if (!internalKey) {
      return NextResponse.json(
        {
          error:
            "很抱歉，您的环境变量中未配置POLARIS_CONVEX_INTERNAL_KEY，请联系管理员",
        },
        { status: 500 },
      );
    }

    // 6. 创建github项目
    const projectId = await convex.mutation(
      api.system.github.createGithubProject,
      {
        internalKey,
        ownerId: userId,
        name: repo,
      },
    );

    // 7.触发后台任务导入项目代码
    await inngest.send({
      name: "github/import.repo",
      data: {
        owner,
        repo,
        projectId,
        githubAccessToken: accessToken,
      },
    });

    return NextResponse.json({ success: true, projectId });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", { error });
    let errorMessage = "很抱歉，由于未知错误导致github仓库导入失败";
    if (error instanceof ZodError) {
      errorMessage = error.issues[0].message;
    } else if (error instanceof ConvexError) {
      errorMessage = error.data;
    } else if (error instanceof Error || error instanceof NonRetriableError) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

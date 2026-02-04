import { ConvexError } from "convex/values";
import { NonRetriableError } from "inngest";
import { type NextRequest, NextResponse } from "next/server";
import { enum as enum_, object, string, ZodError } from "zod";

import { inngest } from "@/inngest/client";
import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = object({
  projectId: string("请输入项目id").min(1, "请输入项目id"),
  repoName: string("请输入仓库名")
    .min(1, "请输入仓库名")
    .max(100, "仓库名不能超过100个字符"),
  visibility: enum_(["public", "private"]).default("public"),
  description: string("请输入仓库描述")
    .max(350, "仓库描述不能超过350个字符")
    .optional(),
});

/**
 * 导出项目到github仓库
 * @param req 请求体，包含项目id、仓库名、可见性和描述
 * @returns 导出成功的项目id和事件id
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

    const { userId } = await fetchAuthQuery(api.auth.getCurrentUser);
    if (!userId) {
      return NextResponse.json(
        { error: "很抱歉，您的用户信息不存在，请联系管理员" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const { projectId, repoName, visibility, description } =
      requestSchema.parse(body);

    const { accessToken, expiresAt } = await fetchAuthQuery(
      api.system.github.getGithubAccessToken,
    );
    if (!accessToken || !expiresAt || expiresAt.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "很抱歉，您的github授权已过期或无效，请重新登录" },
        { status: 401 },
      );
    }

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

    const event = await inngest.send({
      name: "github/export.repo",
      data: {
        repoName,
        description,
        visibility,
        internalKey,
        projectId: projectId as Id<"projects">,
        githubAccessToken: accessToken,
      },
    });

    return NextResponse.json({
      success: true,
      eventId: event.ids[0],
      projectId,
    });
  } catch (error) {
    console.error("🚀 ~ POST ~ error:", error);
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

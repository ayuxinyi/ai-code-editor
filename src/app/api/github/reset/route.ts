import { ConvexError } from "convex/values";
import { NonRetriableError } from "inngest";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { object, string, ZodError } from "zod";

import { fetchAuthQuery, isAuthenticated } from "@/lib/auth-server";
import { convex } from "@/lib/convex-client";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = object({
  projectId: string("请输入项目id").min(1, "项目id不能为空"),
});

/**
 * 重置项目的导出状态
 * @param req 请求体，包含项目id
 * @returns 重置成功的项目id
 */
export async function POST(req: NextRequest) {
  try {
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
    const { projectId } = requestSchema.parse(body);

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

    await convex.mutation(api.system.github.updateProjectExportStatus, {
      projectId: projectId as Id<"projects">,
      internalKey,
      status: undefined,
      repoUrl: undefined,
    });

    return NextResponse.json({ success: true, projectId });
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

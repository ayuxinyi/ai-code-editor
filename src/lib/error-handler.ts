import { NextResponse } from "next/server";
import { ZodError } from "zod";

// 自定义业务错误类，用于手动 throw
export class AppError extends Error {
  constructor(
    public message: string,
    public status: number = 400,
    public code?: string, // 错误码，方便前端做多语言或特定逻辑
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(error: unknown) {
  // 打印详细日志（在生产环境中可以接入 Sentry 或 Axiom）
  console.error("❌ [API_ERROR_TRACE]:", {
    name: error instanceof Error ? error.name : "Unknown",
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });

  // 1. 自定义业务错误 (AppError)
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.status },
    );
  }

  // 2. Zod 参数校验错误
  if (error instanceof ZodError) {
    // 将 Zod 错误平铺，方便前端对应到具体的输入框
    const fieldErrors = error.flatten().fieldErrors;
    const firstMessage = error.issues[0]?.message || "请求参数校验失败";

    return NextResponse.json(
      {
        success: false,
        error: firstMessage,
        details: fieldErrors,
        code: "VALIDATION_ERROR",
      },
      { status: 400 },
    );
  }

  // 3. JSON 解析错误
  if (error instanceof SyntaxError && error.message.includes("JSON")) {
    return NextResponse.json(
      {
        success: false,
        error: "请求体格式错误，请发送合法的 JSON 数据",
        code: "PARSE_ERROR",
      },
      { status: 400 },
    );
  }

  // 4. Convex 或其他数据库错误 (特定字符串匹配)
  const errorMessage = error instanceof Error ? error.message : String(error);
  if (errorMessage.includes("ConvexError")) {
    return NextResponse.json(
      {
        success: false,
        error: "数据库操作失败，请稍后重试",
        code: "DATABASE_ERROR",
      },
      { status: 500 },
    );
  }

  // 5. 最终兜底 (不向前端暴露具体的系统崩溃信息，保护安全)
  return NextResponse.json(
    {
      success: false,
      error: "服务器由于未知原因导致操作失败，请联系客服或稍后再试",
      code: "INTERNAL_SERVER_ERROR",
    },
    { status: 500 },
  );
}

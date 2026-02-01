import type { NextRequest, NextResponse } from "next/server";

import { isAuthenticated } from "./auth-server";
import { AppError, handleApiError } from "./error-handler";

type ApiHandler = (req: NextRequest) => Promise<NextResponse>;

// 用于处理API路由中的错误,不用每个路由都写try-catch
export function withErrorHandler(handler: ApiHandler) {
  return async (req: NextRequest) => {
    try {
      // 检查用户是否已登录
      const isAuthenticatedResult = await isAuthenticated();
      if (!isAuthenticatedResult) {
        throw new AppError("您尚未登录，请登录后再尝试", 401, "UNAUTHORIZED");
      }
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

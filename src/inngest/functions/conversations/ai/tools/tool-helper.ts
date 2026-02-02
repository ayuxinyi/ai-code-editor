import { ConvexError } from "convex/values";

export const createToolError = (error: unknown, toolName: string) => {
  const errorMessage =
    error instanceof Error
      ? error.message
      : error instanceof ConvexError
        ? error.data.message
        : "未知错误";
  return `${toolName}Tool-操作失败，${errorMessage}`;
};

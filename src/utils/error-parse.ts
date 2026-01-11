import { ConvexError } from "convex/values";

export const errorParse = (error: unknown) => {
  if (error instanceof ConvexError) {
    return error.message;
  }
  return "未知错误";
};

/**
 * @file API 函数
 */

// axios的轻量替代
import ky from "ky";
import { toast } from "sonner";

import { SuggestionRequestSchema, SuggestionResponseSchema } from "./schema";

export const fetcher = async (
  payload: SuggestionRequestSchema,
  signal: AbortSignal
) => {
  try {
    const validatedPayload = SuggestionRequestSchema.parse(payload);
    const response = await ky
      .post("/api/suggestion", {
        json: validatedPayload,
        signal,
        timeout: 10000,
        retry: 0,
      })
      .json<SuggestionResponseSchema>();
    const validatedResponse = SuggestionResponseSchema.parse(response);
    return validatedResponse.suggestion || null;
  } catch (error) {
    console.error("🚀 ~ fetcher ~ error:", { error });
    // 如果是手动取消请求，返回null
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    toast.error("获取代码建议失败");
    return null;
  }
};

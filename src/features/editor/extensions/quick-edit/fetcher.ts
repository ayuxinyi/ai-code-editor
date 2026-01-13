/**
 * @file API 函数
 */

// axios的轻量替代
import ky from "ky";
import { toast } from "sonner";

import { QuickEditRequestSchema, QuickEditResponseSchema } from "./schema";

export const fetcher = async (
  payload: QuickEditRequestSchema,
  signal: AbortSignal
) => {
  try {
    const validatedPayload = QuickEditRequestSchema.parse(payload);
    const response = await ky
      .post("/api/quick-edit", {
        json: validatedPayload,
        signal,
        timeout: 30000,
        retry: 0,
      })
      .json<QuickEditResponseSchema>();
    const validatedResponse = QuickEditResponseSchema.parse(response);
    return validatedResponse.editCode || null;
  } catch (error) {
    console.error("🚀 ~ fetcher ~ error:", { error });
    // 如果是手动取消请求，返回null
    if (error instanceof Error && error.name === "AbortError") {
      return null;
    }
    toast.error("AI编辑代码失败");
    return null;
  }
};

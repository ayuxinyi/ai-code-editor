import { createOpenAI } from "@ai-sdk/openai";

import env from "@/utils/env";

export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
  name: "openrouter",
});

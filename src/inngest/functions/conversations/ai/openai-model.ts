import { openai } from "@inngest/agent-kit";

/**
 * 创建一个 OpenAI 模型实例
 * @param temperature 温度参数，用于控制生成文本的随机性，默认值为0
 * @param max_completion_tokens 最大完成令牌数，用于限制生成文本的长度，默认值为100
 * @returns OpenAI 模型实例
 */
export const openAIModel = (temperature = 0, max_completion_tokens = 100) =>
  openai({
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
    apiKey: process.env.DEEPSEEK_API_KEY,
    defaultParameters: {
      // 温度设置为0，以确保生成的标题是 deterministic 的
      temperature,
      max_completion_tokens,
    },
  });

import { generateText } from "ai";

import { firecrawl } from "@/lib/firecrawl";
import { openrouter } from "@/lib/openrouter";

import { inngest } from "../client";

// URL 正则
const URL_REGEX = /https?:\/\/[^\s]+/g;

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate", name: "Generate Text" },
  { event: "demo/generate" },
  async ({ step, event }) => {
    const { prompt } = event.data;

    // 从用户的prompt中提取所有的URL
    const urls = await step.run("extract-urls", async () => {
      return prompt.match(URL_REGEX) ?? [];
    });

    // 通过firecrawl读取所有URL的内容
    const scrapedContent = await step.run("scrape-urls", async () => {
      const results = await Promise.all(
        urls
          .filter(url => url !== null)
          .map(async url => {
            const result = await firecrawl.scrape(url, {
              formats: ["markdown"],
            });
            return result.markdown ?? null;
          }),
      );
      return results.filter(Boolean).join("\n\n");
    });

    const finalPrompt = scrapedContent
      ? `内容为:\n${scrapedContent}\n\n问题是:\n${prompt}`
      : prompt;

    // 调用openrouter的模型生成文本
    await step.run("generate-text", async () => {
      return await generateText({
        model: openrouter("tngtech/deepseek-r1t2-chimera:free"),
        prompt: finalPrompt,
        temperature: 0.2,
        // 开启实验性的遥测功能，用于监控模型的调用
        experimental_telemetry: {
          // 开启实验性的遥测功能，用于监控模型的调用
          isEnabled: true,
          // 记录模型的输入
          recordInputs: true,
          // 记录模型的输出
          recordOutputs: true,
        },
      });
    });
  },
);

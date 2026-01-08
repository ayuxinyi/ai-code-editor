import { generateText } from "ai";

import { openrouter } from "@/lib/openrouter";

import { inngest } from "../client";

export const demoGenerate = inngest.createFunction(
  { id: "demo-generate" },
  { event: "demo/generate" },
  async ({ step }) => {
    await step.run("generate-text", async () => {
      return await generateText({
        model: openrouter("xiaomi/mimo-v2-flash:free"),
        prompt:
          "你是一个专业的成语生成器，每次都会随机生成四个成语，每个成语之间用逗号隔开，例如：高山流水,水火不容...",
      });
    });
  }
);

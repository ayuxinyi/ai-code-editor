import { createTool } from "@inngest/agent-kit";
import { array, object, url } from "zod";

import { firecrawl } from "@/lib/firecrawl";

import { createToolError } from "./tool-helper";

const ScrapeUrlsToolParamsSchema = object({
  urls: array(
    url("无效的URL").min(1, "URL不能为空").describe("要爬取的URL列表"),
  )
    .min(1, "至少要提供一个URL")
    .describe("要爬取的URL列表"),
});

export const createScrapeUrls = () =>
  createTool({
    name: "scrapeUrls",
    description:
      "从指定的 URL 抓取内容以获取文档或参考资料。适用于用户提供网址或需要参考外部文档的场景。执行后返回抓取页面的 Markdown 内容。",
    parameters: ScrapeUrlsToolParamsSchema,
    async handler(input, { step: toolStep }) {
      const { success, data, error } =
        ScrapeUrlsToolParamsSchema.safeParse(input);
      if (!success) {
        return `scrapeUrlsTool-参数校验失败:${error.issues[0].message}`;
      }
      const { urls } = data;
      try {
        return await toolStep?.run("scrape-urls", async () => {
          const results: Array<{ url: string; content: string }> = [];
          for (const url of urls) {
            try {
              const data = await firecrawl.scrape(url, {
                formats: ["markdown"],
              });

              if (data.markdown) {
                results.push({
                  url,
                  content: data.markdown,
                });
              }
            } catch (error) {
              results.push({
                url,
                content: `网站${url}内容抓取失败:${error}`,
              });
            }
            if (results.length === 0) {
              return "无法从提供的URL列表中抓取到任何内容";
            }
            return JSON.stringify(results);
          }
        });
      } catch (error) {
        return createToolError(error, "scrapeUrls");
      }
    },
  });

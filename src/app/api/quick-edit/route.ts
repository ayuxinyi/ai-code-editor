import { deepseek } from "@ai-sdk/deepseek";
import { generateText } from "ai";
import { type NextRequest, NextResponse } from "next/server";

import { QUICK_EDIT_PROMPT, QUICK_EDIT_SYSTEM } from "@/constants";
import { QuickEditRequestSchema } from "@/features/editor/extensions/quick-edit/schema";
import { firecrawl } from "@/lib/firecrawl";
import { withErrorHandler } from "@/lib/with-error-handler";

const URL_REGEX = /https?:\/\/[^\s]+/g;
export const POST = withErrorHandler(async (req: NextRequest) => {
  // 验证请求体
  const body = await req.json();
  const validatedPayload = QuickEditRequestSchema.parse(body);
  const { selectCode, fullCode, instruction } = validatedPayload;

  // 从上下文中提取URL
  const urls: string[] = instruction.match(URL_REGEX) || [];

  let documentationContext = "";
  // 从URL中提取文档上下文
  if (urls.length > 0) {
    const scrapedResults = await Promise.all(
      urls.filter(Boolean).map(async url => {
        try {
          // 通过Firecrawl API提取文档上下文
          const result = await firecrawl.scrape(url, {
            formats: ["markdown"],
          });
          // return result.markdown ?? null;
          if (result.markdown) {
            return `<doc url="${url}">\n${result.markdown}\n</doc>`;
          }
          return null;
        } catch (error) {
          console.error(`Error scraping ${url}:`, error);
          return null;
        }
      }),
    );
    const validateResults = scrapedResults.filter(Boolean);
    if (validateResults.length > 0) {
      documentationContext = `<documentation>\n${validateResults.join("\n\n")}\n</documentation>`;
    }
  }
  const quickPrompt = QUICK_EDIT_PROMPT.replace("{fullCode}", fullCode)
    .replace("{selectedCode}", selectCode)
    .replace("{documentation}", documentationContext)
    .replace("{instruction}", instruction);

  const { text } = await generateText({
    model: deepseek("deepseek-chat"),
    prompt: quickPrompt,
    system: QUICK_EDIT_SYSTEM,
  });

  return NextResponse.json({ editCode: text });
});

import type { ZodObject, ZodRawShape } from "zod";
import { ZodError } from "zod";
/**
 * 尝试解析环境变量并返回类型安全的对象，
 * 如果环境变量缺失或解析失败，则抛出错误。
 */
export default function tryParseEnv<T extends ZodRawShape>(
  EnvSchema: ZodObject<T>,
  buildEnv: Record<string, string | undefined> = process.env
) {
  try {
    EnvSchema.parse(buildEnv);
  } catch (error) {
    if (error instanceof ZodError) {
      let message = ".env文件中环境变量缺少:\n";
      error.issues.forEach(issue => {
        message += `${issue.path[0] as string}\n`;
      });
      const e = new Error(message);
      throw e;
    } else {
      console.error(error);
    }
  }
}

/**
 * 定义环境变量的 schema，用于确保项目中所需的环境变量被正确设置。
 */

import type { output } from "zod";
import { string, z } from "zod";

import tryParseEnv from "./type-parse-env";
export const EnvSchema = z.object({
  NODE_ENV: string(),
  DATABASE_URL: string(),
  BETTER_AUTH_SECRET: string(),
  BETTER_AUTH_URL: string(),
  // GitHub 认证配置
  GITHUB_CLIENT_ID: string(),
  GITHUB_CLIENT_SECRET: string(),
  // Convex 配置
  NEXT_PUBLIC_CONVEX_URL: string(),
  NEXT_PUBLIC_CONVEX_SITE_URL: string(),
  // AI 相关环境变量
  OPENROUTER_API_KEY: string(),
  DEEPSEEK_API_KEY: string(),
});
export type EnvSchema = output<typeof EnvSchema>;

// 尝试解析环境变量并返回类型安全的对象
tryParseEnv(EnvSchema);

// 解析环境变量并返回类型安全的对象，这里我们需要禁用 eslint 规则 node/no-process-env，因为
// 我们就是想要只在这里使用 process.env，在其它地方需要通过 EnvSchema.parse(process.env) 来获取环境变量
export default EnvSchema.parse(process.env);

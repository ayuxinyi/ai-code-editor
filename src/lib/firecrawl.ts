import Firecrawl from "@mendable/firecrawl-js";

import env from "@/utils/env";

// 创建 Firecrawl 实例，Firecrawl 可以帮助AI读取指定地址的内容，例如我们给他Next.js的官方文档地址，
// 他就可以读取Next.js的官方文档内容，然后我们就可以根据Next.js的官方文档内容，来帮助AI生成Next.js的代码。
export const firecrawl = new Firecrawl({ apiKey: env.FIRECRAWL_API_KEY });

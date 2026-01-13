import { ConvexHttpClient } from "convex/browser";

import env from "@/utils/env";

export const convex = new ConvexHttpClient(env.NEXT_PUBLIC_CONVEX_URL);

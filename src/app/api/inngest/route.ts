import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { demoGenerate, sentryInngestDemoError } from "@/inngest/functions";
import { processMessage } from "@/inngest/functions/ai/process-message";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [demoGenerate, sentryInngestDemoError, processMessage],
});

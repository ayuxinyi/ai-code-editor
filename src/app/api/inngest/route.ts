import { serve } from "inngest/next";

import { inngest } from "@/inngest/client";
import { demoGenerate, sentryInngestDemoError } from "@/inngest/functions";
import { processMessage } from "@/inngest/functions/conversations/process-message";
import { exportToGithub } from "@/inngest/functions/github/export-to-github";
import { importGithubRepo } from "@/inngest/functions/github/import-github-repo";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    demoGenerate,
    sentryInngestDemoError,
    processMessage,
    importGithubRepo,
    exportToGithub,
  ],
});

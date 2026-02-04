import { sentryMiddleware } from "@inngest/middleware-sentry";
import { EventSchemas, Inngest } from "inngest";

import type { Id } from "../../convex/_generated/dataModel";

type Events = {
  "demo/generate": {
    data: {
      prompt: string;
    };
  };
  "demo/sentry-inngest": {
    data: undefined;
  };
  "conversations/message-sent": {
    data: {
      messageId: Id<"messages">;
      conversationId: Id<"conversations">;
      projectId: Id<"projects">;
      message: string;
    };
  };
  "conversations/message-cancel": {
    data: {
      messageId: Id<"messages">;
    };
  };
  "github/import.repo": {
    data: {
      owner: string;
      repo: string;
      projectId: Id<"projects">;
      githubAccessToken: string;
    };
  };
  "github/export.repo": {
    data: {
      repoName: string;
      description: string | undefined;
      visibility: "public" | "private";
      projectId: Id<"projects">;
      githubAccessToken: string;
    };
  };
  "github/export.cancel": {
    data: {
      projectId: Id<"projects">;
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "polaris",
  schemas: new EventSchemas().fromRecord<Events>(),
  middleware: [sentryMiddleware()],
});

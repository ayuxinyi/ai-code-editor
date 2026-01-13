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
  "ai/message-sent": {
    data: {
      messageId: Id<"messages">;
      conversationId: Id<"conversations">;
      projectId: Id<"projects">;
      message: string;
    };
  };
  "ai/message-cancel": {
    data: {
      messageId: Id<"messages">;
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "polaris",
  schemas: new EventSchemas().fromRecord<Events>(),
  middleware: [sentryMiddleware()],
});

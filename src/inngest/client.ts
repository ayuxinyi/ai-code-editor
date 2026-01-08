import { sentryMiddleware } from "@inngest/middleware-sentry";
import { EventSchemas, Inngest } from "inngest";

type Events = {
  "demo/generate": {
    data: {
      prompt: string;
    };
  };
  "demo/sentry-inngest": {
    data: undefined;
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "polaris",
  schemas: new EventSchemas().fromRecord<Events>(),
  middleware: [sentryMiddleware()],
});

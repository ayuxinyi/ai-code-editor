import { EventSchemas, Inngest } from "inngest";

type Events = {
  "demo/generate": {
    data: {
      prompt: string;
    };
  };
};

// Create a client to send and receive events
export const inngest = new Inngest({
  id: "polaris",
  schemas: new EventSchemas().fromRecord<Events>(),
});

import { inngest } from "../client";

export const sentryInngestDemoError = inngest.createFunction(
  {
    id: "sentry-inngest-demo-error",
    name: "Sentry Inngest Demo Error",
    retries: 3,
  },
  {
    event: "demo/sentry-inngest",
  },
  async ({ step }) => {
    await step.run("sentry-inngest-demo-error", async () => {
      throw new Error("Sentry Inngest Demo Error");
    });
  }
);

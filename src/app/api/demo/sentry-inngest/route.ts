import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";

export async function POST() {
  await inngest.send({ name: "demo/sentry-inngest", data: undefined });
  return NextResponse.json({ status: "started" });
}

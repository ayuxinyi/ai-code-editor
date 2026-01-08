// POST /api/demo/background
import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";

export async function POST() {
  await inngest.send({
    name: "demo/generate",
    data: {},
  });
  return NextResponse.json({ status: "started" });
}

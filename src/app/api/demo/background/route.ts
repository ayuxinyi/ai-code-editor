// POST /api/demo/background
import { NextResponse } from "next/server";

import { inngest } from "@/inngest/client";

export async function POST() {
  await inngest.send({
    name: "demo/generate",
    data: {
      prompt: "中国历史上最出名的皇帝是?",
    },
  });
  return NextResponse.json({ status: "started" });
}

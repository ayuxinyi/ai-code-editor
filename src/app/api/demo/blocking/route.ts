// localhost:3000/api/demo/blocking
import { generateText } from "ai";
import { NextResponse } from "next/server";

import { openrouter } from "@/lib/openrouter";

export async function POST() {
  const response = await generateText({
    model: openrouter("xiaomi/mimo-v2-flash:free"),
    prompt: "中国历史上最出名的皇帝是?",
  });
  return NextResponse.json({ response });
}

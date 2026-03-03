import { NextRequest, NextResponse } from "next/server";
import { summarizePost } from "@/lib/ai";

// POST /api/summarize - Generate a summary for post content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const summary = await summarizePost(content);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Error summarizing post:", error);
    return NextResponse.json({ error: "Failed to summarize post" }, { status: 500 });
  }
}

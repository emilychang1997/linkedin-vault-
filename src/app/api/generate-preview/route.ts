import { NextRequest, NextResponse } from "next/server";
import { generatePreview } from "@/lib/ai";

// POST /api/generate-preview - Generate preview for post content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, ogDescription } = body;

    if (!content && !ogDescription) {
      return NextResponse.json({ error: "Content or description required" }, { status: 400 });
    }

    const preview = await generatePreview(content, ogDescription);
    return NextResponse.json({ preview });
  } catch (error) {
    console.error("Error generating preview:", error);
    return NextResponse.json(
      { error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}

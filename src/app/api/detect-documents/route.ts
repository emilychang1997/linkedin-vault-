import { NextRequest, NextResponse } from "next/server";
import { detectDocuments } from "@/lib/ai";

// POST /api/detect-documents - Detect if post content references downloadable documents
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const result = await detectDocuments(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error detecting documents:", error);
    return NextResponse.json(
      { error: "Failed to detect documents" },
      { status: 500 }
    );
  }
}

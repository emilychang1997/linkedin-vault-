import { NextRequest, NextResponse } from "next/server";
import { suggestCategories } from "@/lib/ai";

// POST /api/suggest-categories - Suggest categories for post content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, categories } = body;

    if (!content || !categories) {
      return NextResponse.json(
        { error: "Content and categories are required" },
        { status: 400 }
      );
    }

    const suggestions = await suggestCategories(content, categories);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error suggesting categories:", error);
    return NextResponse.json(
      { error: "Failed to suggest categories" },
      { status: 500 }
    );
  }
}

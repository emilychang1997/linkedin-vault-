import { NextRequest, NextResponse } from "next/server";
import { extractOGMetadata } from "@/lib/og";

// POST /api/og-extract - Extract OG metadata from a URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const metadata = await extractOGMetadata(url);
    // Always return 200 so the client can read partial results + fetchError
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error extracting OG metadata:", error);
    return NextResponse.json(
      { error: "Failed to extract OG metadata" },
      { status: 500 }
    );
  }
}

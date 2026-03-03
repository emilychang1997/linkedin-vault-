import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { ne } from "drizzle-orm";

// POST /api/posts/[id]/duplicate-check - Check if a post is duplicate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { linkedinUrl, ogTitle, content } = body;

    // Get all other posts (excluding this one if it's an edit)
    const allPosts = await db
      .select()
      .from(posts)
      .where(ne(posts.id, parseInt(id) || 0));

    // Check for exact URL match
    const exactUrlMatch = allPosts.find((p) => p.linkedinUrl === linkedinUrl);
    if (exactUrlMatch) {
      return NextResponse.json({
        isDuplicate: true,
        matchType: "exact",
        matchedPost: exactUrlMatch,
        message: "This exact LinkedIn URL has already been saved.",
      });
    }

    // Check for similar title (fuzzy match)
    if (ogTitle) {
      const normalizedTitle = ogTitle.toLowerCase().trim();
      const similarTitle = allPosts.find((p) => {
        if (!p.ogTitle) return false;
        const normalizedExisting = p.ogTitle.toLowerCase().trim();

        // Check if titles are very similar (same words, possibly different order)
        const titleWords = normalizedTitle.split(/\s+/);
        const existingWords = normalizedExisting.split(/\s+/);
        const matchingWords = titleWords.filter((word: string) =>
          existingWords.includes(word)
        );

        // If 80% of words match, consider it similar
        return matchingWords.length / titleWords.length > 0.8;
      });

      if (similarTitle) {
        return NextResponse.json({
          isDuplicate: true,
          matchType: "similar",
          matchedPost: similarTitle,
          message: "A post with a very similar title already exists.",
        });
      }
    }

    // Check for similar content
    if (content && content.length > 50) {
      const normalizedContent = content.toLowerCase().substring(0, 200);
      const similarContent = allPosts.find((p) => {
        if (!p.content || p.content.length < 50) return false;
        const normalizedExisting = p.content.toLowerCase().substring(0, 200);

        // Check if first 200 chars are 70% similar
        const contentWords = normalizedContent.split(/\s+/);
        const existingWords = normalizedExisting.split(/\s+/);
        const matchingWords = contentWords.filter((word: string) =>
          existingWords.includes(word)
        );

        return matchingWords.length / contentWords.length > 0.7;
      });

      if (similarContent) {
        return NextResponse.json({
          isDuplicate: true,
          matchType: "similar",
          matchedPost: similarContent,
          message: "A post with very similar content already exists.",
        });
      }
    }

    return NextResponse.json({ isDuplicate: false });
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    return NextResponse.json(
      { error: "Failed to check for duplicates" },
      { status: 500 }
    );
  }
}

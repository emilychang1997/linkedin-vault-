import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { summarizePost } from "@/lib/ai";
import { eq } from "drizzle-orm";

// POST /api/posts/regenerate-previews - Regenerate summaries for all posts
export async function POST() {
  try {
    const allPosts = await db.select().from(posts);

    let updated = 0;
    let failed = 0;

    for (const post of allPosts) {
      try {
        if (post.content && post.content.length > 50) {
          const summary = await summarizePost(post.content);

          await db
            .update(posts)
            .set({ summary })
            .where(eq(posts.id, post.id));

          updated++;
        }
      } catch (error) {
        console.error(`Failed to generate summary for post ${post.id}:`, error);
        failed++;
      }
    }

    return NextResponse.json({
      message: "Summary regeneration complete",
      total: allPosts.length,
      updated,
      failed,
    });
  } catch (error) {
    console.error("Error regenerating summaries:", error);
    return NextResponse.json(
      { error: "Failed to regenerate summaries" },
      { status: 500 }
    );
  }
}

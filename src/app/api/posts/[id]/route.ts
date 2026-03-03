import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, postCategories, authors, categories, attachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { summarizePost } from "@/lib/ai";

// GET /api/posts/[id] - Get a single post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    const [result] = await db
      .select({
        post: posts,
        author: authors,
      })
      .from(posts)
      .leftJoin(authors, eq(posts.authorId, authors.id))
      .where(eq(posts.id, postId));

    if (!result) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postCats = await db
      .select({ category: categories })
      .from(postCategories)
      .leftJoin(categories, eq(postCategories.categoryId, categories.id))
      .where(eq(postCategories.postId, postId));

    const postAttachments = await db
      .select()
      .from(attachments)
      .where(eq(attachments.postId, postId));

    const enrichedPost = {
      ...result.post,
      author: result.author || null,
      categories: postCats.map((pc) => pc.category).filter((c): c is NonNullable<typeof c> => c !== null),
      attachments: postAttachments,
    };

    return NextResponse.json(enrichedPost);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

// PATCH /api/posts/[id] - Update a post
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const body = await request.json();
    const {
      content,
      summary,
      ogTitle,
      ogDescription,
      ogImageUrl,
      hasDocumentsCta,
      authorId,
      categoryIds,
    } = body;

    const now = new Date().toISOString();

    const [updatedPost] = await db
      .update(posts)
      .set({
        ...(content !== undefined && { content }),
        ...(summary !== undefined && { summary }),
        ...(ogTitle !== undefined && { ogTitle }),
        ...(ogDescription !== undefined && { ogDescription }),
        ...(ogImageUrl !== undefined && { ogImageUrl }),
        ...(hasDocumentsCta !== undefined && { hasDocumentsCta }),
        ...(authorId !== undefined && { authorId }),
        updatedAt: now,
      })
      .where(eq(posts.id, postId))
      .returning();

    // Update categories if provided
    if (categoryIds && Array.isArray(categoryIds)) {
      // Delete existing category associations
      await db.delete(postCategories).where(eq(postCategories.postId, postId));

      // Add new category associations
      if (categoryIds.length > 0) {
        await db.insert(postCategories).values(
          categoryIds.map((categoryId: number) => ({
            postId,
            categoryId,
          }))
        );
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// PUT /api/posts/[id] - Update a post (complete replacement)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);
    const body = await request.json();
    const {
      linkedinUrl,
      content,
      summary,
      ogTitle,
      ogDescription,
      ogImageUrl,
      hasDocumentsCta,
      authorId,
      categoryIds,
    } = body;

    // Generate summary if content is available and no summary provided
    let generatedSummary = summary;
    if (!generatedSummary && content && content.length > 50) {
      try {
        generatedSummary = await summarizePost(content);
      } catch (error) {
        console.error("Failed to generate summary:", error);
        // Fallback to truncated content or OG description
        generatedSummary = ogDescription?.substring(0, 200) || content?.substring(0, 200) || null;
      }
    }

    const now = new Date().toISOString();

    const [updatedPost] = await db
      .update(posts)
      .set({
        linkedinUrl,
        content: content || null,
        summary: generatedSummary || null,
        preview: null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImageUrl: ogImageUrl || null,
        hasDocumentsCta: hasDocumentsCta || false,
        authorId: authorId || null,
        updatedAt: now,
      })
      .where(eq(posts.id, postId))
      .returning();

    // Update categories if provided
    if (categoryIds && Array.isArray(categoryIds)) {
      // Delete existing category associations
      await db.delete(postCategories).where(eq(postCategories.postId, postId));

      // Add new category associations
      if (categoryIds.length > 0) {
        await db.insert(postCategories).values(
          categoryIds.map((categoryId: number) => ({
            postId,
            categoryId,
          }))
        );
      }
    }

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id);

    await db.delete(posts).where(eq(posts.id, postId));

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}

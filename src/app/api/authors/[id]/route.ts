import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authors, posts, attachments, categories, postCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/authors/[id] - Get a single author with their posts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorId = parseInt(id);

    const [author] = await db.select().from(authors).where(eq(authors.id, authorId));

    if (!author) {
      return NextResponse.json({ error: "Author not found" }, { status: 404 });
    }

    const authorPosts = await db.select().from(posts).where(eq(posts.authorId, authorId));

    const enrichedPosts = await Promise.all(
      authorPosts.map(async (post) => {
        const postCats = await db
          .select({ category: categories })
          .from(postCategories)
          .leftJoin(categories, eq(postCategories.categoryId, categories.id))
          .where(eq(postCategories.postId, post.id));

        const postAttachments = await db
          .select()
          .from(attachments)
          .where(eq(attachments.postId, post.id));

        return {
          ...post,
          author,
          categories: postCats
            .map((pc) => pc.category)
            .filter((c): c is NonNullable<typeof c> => c !== null),
          attachments: postAttachments,
        };
      })
    );

    const authorAttachments = await db
      .select()
      .from(attachments)
      .where(eq(attachments.authorId, authorId));

    return NextResponse.json({
      ...author,
      posts: enrichedPosts,
      attachments: authorAttachments,
    });
  } catch (error) {
    console.error("Error fetching author:", error);
    return NextResponse.json({ error: "Failed to fetch author" }, { status: 500 });
  }
}

// PATCH /api/authors/[id] - Update an author
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorId = parseInt(id);
    const body = await request.json();
    const { name, linkedinUrl, headline, avatarUrl, role } = body;

    const [updatedAuthor] = await db
      .update(authors)
      .set({
        ...(name !== undefined && { name }),
        ...(linkedinUrl !== undefined && { linkedinUrl }),
        ...(headline !== undefined && { headline }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(role !== undefined && { role }),
      })
      .where(eq(authors.id, authorId))
      .returning();

    return NextResponse.json(updatedAuthor);
  } catch (error) {
    console.error("Error updating author:", error);
    return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
  }
}

// DELETE /api/authors/[id] - Delete an author
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authorId = parseInt(id);

    await db.delete(authors).where(eq(authors.id, authorId));

    return NextResponse.json({ message: "Author deleted successfully" });
  } catch (error) {
    console.error("Error deleting author:", error);
    return NextResponse.json({ error: "Failed to delete author" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { posts, postCategories, authors, categories, attachments } from "@/lib/db/schema";
import { eq, like, or, desc } from "drizzle-orm";
import { summarizePost } from "@/lib/ai";

// GET /api/posts - List all posts with optional search and filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search");
  const categoryId = searchParams.get("categoryId");
  const authorId = searchParams.get("authorId");

  try {
    let query = db
      .select({
        post: posts,
        author: authors,
      })
      .from(posts)
      .leftJoin(authors, eq(posts.authorId, authors.id))
      .orderBy(desc(posts.createdAt));

    // Apply filters
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(posts.content, `%${search}%`),
          like(posts.ogTitle, `%${search}%`),
          like(posts.ogDescription, `%${search}%`)
        )
      );
    }

    if (authorId) {
      conditions.push(eq(posts.authorId, parseInt(authorId)));
    }

    // For category filter, we need a more complex query
    if (categoryId) {
      const postsInCategory = await db
        .select({ postId: postCategories.postId })
        .from(postCategories)
        .where(eq(postCategories.categoryId, parseInt(categoryId)));

      const postIds = postsInCategory.map((p) => p.postId);
      if (postIds.length > 0) {
        const filteredPosts = await db
          .select({
            post: posts,
            author: authors,
          })
          .from(posts)
          .leftJoin(authors, eq(posts.authorId, authors.id))
          .where(
            or(
              ...postIds.map((id) => eq(posts.id, id)),
              ...(conditions.length > 0 ? [or(...conditions)] : [])
            )
          )
          .orderBy(desc(posts.createdAt));

        // Fetch categories and attachments for each post
        const enrichedPosts = await Promise.all(
          filteredPosts.map(async ({ post, author }) => {
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
              author: author || null,
              categories: postCats.map((pc) => pc.category).filter((c): c is NonNullable<typeof c> => c !== null),
              attachments: postAttachments,
            };
          })
        );

        return NextResponse.json(enrichedPosts);
      }

      return NextResponse.json([]);
    }

    const result = await query;

    // Fetch categories and attachments for each post
    const enrichedPosts = await Promise.all(
      result.map(async ({ post, author }) => {
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
          author: author || null,
          categories: postCats.map((pc) => pc.category).filter((c): c is NonNullable<typeof c> => c !== null),
          attachments: postAttachments,
        };
      })
    );

    return NextResponse.json(enrichedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
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

    const [newPost] = await db
      .insert(posts)
      .values({
        linkedinUrl,
        content: content || null,
        summary: generatedSummary || null,
        preview: null,
        ogTitle: ogTitle || null,
        ogDescription: ogDescription || null,
        ogImageUrl: ogImageUrl || null,
        hasDocumentsCta: hasDocumentsCta || false,
        authorId: authorId || null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Add category associations
    if (categoryIds && Array.isArray(categoryIds) && categoryIds.length > 0) {
      await db.insert(postCategories).values(
        categoryIds.map((categoryId: number) => ({
          postId: newPost.id,
          categoryId,
        }))
      );
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

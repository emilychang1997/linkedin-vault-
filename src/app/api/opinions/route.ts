import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  opinionGroups,
  opinionGroupPosts,
  posts,
  postCategories,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { analyzeOpinions } from "@/lib/ai";

// GET /api/opinions?categoryId=X - Get opinion groups for a category
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  try {
    const groups = await db
      .select()
      .from(opinionGroups)
      .where(eq(opinionGroups.categoryId, parseInt(categoryId)));

    // Fetch posts for each opinion group
    const enrichedGroups = await Promise.all(
      groups.map(async (group) => {
        const groupPosts = await db
          .select({
            post: posts,
            stance: opinionGroupPosts.stance,
          })
          .from(opinionGroupPosts)
          .leftJoin(posts, eq(opinionGroupPosts.postId, posts.id))
          .where(eq(opinionGroupPosts.opinionGroupId, group.id));

        const agreeing = groupPosts
          .filter((gp) => gp.stance === "agrees")
          .map((gp) => gp.post)
          .filter((p): p is NonNullable<typeof p> => p !== null);

        const contradicting = groupPosts
          .filter((gp) => gp.stance === "contradicts")
          .map((gp) => gp.post)
          .filter((p): p is NonNullable<typeof p> => p !== null);

        return {
          ...group,
          agreeingPosts: agreeing,
          contradictingPosts: contradicting,
        };
      })
    );

    return NextResponse.json(enrichedGroups);
  } catch (error) {
    console.error("Error fetching opinion groups:", error);
    return NextResponse.json(
      { error: "Failed to fetch opinion groups" },
      { status: 500 }
    );
  }
}

// POST /api/opinions - Generate opinion analysis for a category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categoryId } = body;

    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    // Get all posts in the category
    const postsInCategory = await db
      .select({ postId: postCategories.postId })
      .from(postCategories)
      .where(eq(postCategories.categoryId, categoryId));

    const postIds = postsInCategory.map((p) => p.postId);

    if (postIds.length === 0) {
      return NextResponse.json(
        { error: "No posts found in this category" },
        { status: 400 }
      );
    }

    const categoryPosts = await db.select().from(posts);
    const filteredPosts = categoryPosts.filter((post) => postIds.includes(post.id));

    // Only analyze posts that have content
    const postsWithContent = filteredPosts
      .filter((post) => post.content)
      .map((post) => ({
        id: post.id,
        content: post.content!,
      }));

    if (postsWithContent.length < 2) {
      return NextResponse.json(
        { error: "At least 2 posts with content are required for analysis" },
        { status: 400 }
      );
    }

    // Analyze opinions using AI
    const groups = await analyzeOpinions(postsWithContent);

    // Delete existing opinion groups for this category
    await db.delete(opinionGroups).where(eq(opinionGroups.categoryId, categoryId));

    // Save new opinion groups
    const savedGroups = await Promise.all(
      groups.map(async (group) => {
        const [newGroup] = await db
          .insert(opinionGroups)
          .values({
            categoryId,
            topic: group.topic,
            summary: group.summary,
          })
          .returning();

        // Save agreeing posts
        if (group.agreeing_posts && group.agreeing_posts.length > 0) {
          await db.insert(opinionGroupPosts).values(
            group.agreeing_posts.map((postId) => ({
              opinionGroupId: newGroup.id,
              postId,
              stance: "agrees" as const,
            }))
          );
        }

        // Save contradicting posts
        if (group.contradicting_posts && group.contradicting_posts.length > 0) {
          await db.insert(opinionGroupPosts).values(
            group.contradicting_posts.map((postId) => ({
              opinionGroupId: newGroup.id,
              postId,
              stance: "contradicts" as const,
            }))
          );
        }

        return newGroup;
      })
    );

    return NextResponse.json(savedGroups, { status: 201 });
  } catch (error) {
    console.error("Error generating opinion analysis:", error);
    return NextResponse.json(
      { error: "Failed to generate opinion analysis" },
      { status: 500 }
    );
  }
}

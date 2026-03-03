import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  attachments,
  attachmentFileCategories,
  fileCategories,
  authors,
  posts,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET /api/files - List all files with optional filters
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authorId = searchParams.get("authorId");
  const postId = searchParams.get("postId");
  const fileCategoryId = searchParams.get("fileCategoryId");

  try {
    // Build where conditions
    const whereConditions = [];
    if (authorId) {
      whereConditions.push(eq(attachments.authorId, parseInt(authorId)));
    }
    if (postId) {
      whereConditions.push(eq(attachments.postId, parseInt(postId)));
    }

    // Execute query with or without filters
    let result;
    if (whereConditions.length > 0) {
      result = await db
        .select({
          attachment: attachments,
          author: authors,
          post: posts,
        })
        .from(attachments)
        .leftJoin(authors, eq(attachments.authorId, authors.id))
        .leftJoin(posts, eq(attachments.postId, posts.id))
        .where(whereConditions.length === 1 ? whereConditions[0] : undefined);
    } else {
      result = await db
        .select({
          attachment: attachments,
          author: authors,
          post: posts,
        })
        .from(attachments)
        .leftJoin(authors, eq(attachments.authorId, authors.id))
        .leftJoin(posts, eq(attachments.postId, posts.id));
    }

    // If file category filter is provided, filter by category
    if (fileCategoryId) {
      const filesInCategory = await db
        .select({ attachmentId: attachmentFileCategories.attachmentId })
        .from(attachmentFileCategories)
        .where(eq(attachmentFileCategories.fileCategoryId, parseInt(fileCategoryId)));

      const fileIds = filesInCategory.map((f) => f.attachmentId);
      const filtered = result.filter((r) => fileIds.includes(r.attachment.id));

      // Fetch file categories for each attachment
      const enrichedFiles = await Promise.all(
        filtered.map(async ({ attachment, author, post }) => {
          const fileCats = await db
            .select({ fileCategory: fileCategories })
            .from(attachmentFileCategories)
            .leftJoin(
              fileCategories,
              eq(attachmentFileCategories.fileCategoryId, fileCategories.id)
            )
            .where(eq(attachmentFileCategories.attachmentId, attachment.id));

          return {
            ...attachment,
            author: author || null,
            post: post || null,
            fileCategories: fileCats.map((fc) => fc.fileCategory).filter((c): c is NonNullable<typeof c> => c !== null),
          };
        })
      );

      return NextResponse.json(enrichedFiles);
    }

    // Fetch file categories for each attachment
    const enrichedFiles = await Promise.all(
      result.map(async ({ attachment, author, post }) => {
        const fileCats = await db
          .select({ fileCategory: fileCategories })
          .from(attachmentFileCategories)
          .leftJoin(
            fileCategories,
            eq(attachmentFileCategories.fileCategoryId, fileCategories.id)
          )
          .where(eq(attachmentFileCategories.attachmentId, attachment.id));

        return {
          ...attachment,
          author: author || null,
          post: post || null,
          fileCategories: fileCats.map((fc) => fc.fileCategory).filter((c): c is NonNullable<typeof c> => c !== null),
        };
      })
    );

    return NextResponse.json(enrichedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}

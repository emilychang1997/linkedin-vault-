import { db } from "@/lib/db";
import { posts, authors, categories, postCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PostForm } from "@/components/post-form";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseInt(id);

  // Fetch the post
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post) {
    notFound();
  }

  // Fetch all authors
  const allAuthors = await db.select().from(authors);

  // Fetch all categories
  const allCategories = await db.select().from(categories);

  // Fetch post's categories
  const postCats = await db
    .select({ categoryId: postCategories.categoryId })
    .from(postCategories)
    .where(eq(postCategories.postId, postId));

  const categoryIds = postCats.map((pc) => pc.categoryId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-zinc-600 mt-2">Update your saved LinkedIn post</p>
      </div>

      <PostForm
        authors={allAuthors}
        categories={allCategories}
        existingPost={{
          id: post.id,
          linkedinUrl: post.linkedinUrl,
          content: post.content,
          summary: post.summary,
          ogTitle: post.ogTitle,
          ogDescription: post.ogDescription,
          ogImageUrl: post.ogImageUrl,
          authorId: post.authorId,
          categoryIds,
        }}
      />
    </div>
  );
}

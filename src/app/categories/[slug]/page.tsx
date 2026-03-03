import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { db } from "@/lib/db";
import {
  categories,
  postCategories,
  posts,
  authors,
  attachments,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

async function getCategoryBySlug(slug: string) {
  const [category] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug));

  return category;
}

async function getPostsInCategory(categoryId: number) {
  const postsInCategory = await db
    .select({ postId: postCategories.postId })
    .from(postCategories)
    .where(eq(postCategories.categoryId, categoryId));

  const postIds = postsInCategory.map((p) => p.postId);

  if (postIds.length === 0) return [];

  const categoryPosts = await db
    .select({
      post: posts,
      author: authors,
    })
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .orderBy(desc(posts.createdAt));

  const filteredPosts = categoryPosts.filter((p) => postIds.includes(p.post.id));

  return Promise.all(
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
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const categoryPosts = await getPostsInCategory(category.id);

  return (
    <div className="space-y-8">
      <Link href="/categories">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        {category.description && (
          <p className="text-zinc-600 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-zinc-500 mt-1">
          {categoryPosts.length} {categoryPosts.length === 1 ? "post" : "posts"}
        </p>
      </div>

      {categoryPosts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600">No posts in this category yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {categoryPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

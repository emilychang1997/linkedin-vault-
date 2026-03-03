import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PostCard } from "@/components/post-card";
import { PrimaryButton } from "@/components/primary-button";
import { CategoryPieChart } from "@/components/CategoryPieChart";
import { db } from "@/lib/db";
import { posts, categories, postCategories, authors, attachments } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

async function getRecentPosts() {
  const recentPosts = await db
    .select({
      post: posts,
      author: authors,
    })
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .orderBy(desc(posts.createdAt))
    .limit(5);

  return Promise.all(
    recentPosts.map(async ({ post, author }) => {
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

async function getCategoryStats() {
  const allCategories = await db.select().from(categories);

  const stats = await Promise.all(
    allCategories.map(async (cat) => {
      const count = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.categoryId, cat.id));

      return {
        category: cat,
        count: count.length,
      };
    })
  );

  return stats;
}

export default async function Home() {
  const recentPosts = await getRecentPosts();
  const categoryStats = await getCategoryStats();
  const totalPosts = await db.select().from(posts);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/posts/new">
          <PrimaryButton>
            Add Post
            <Plus className="h-5 w-5" />
          </PrimaryButton>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-600">
              Total Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPosts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-600">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-600">
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentPosts.length}</div>
            <p className="text-xs text-zinc-500">last 5 posts</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
        <CategoryPieChart categoryStats={categoryStats} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Posts</h2>
        {recentPosts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-zinc-600 mb-4">No posts yet. Get started by adding your first post!</p>
              <Link href="/posts/new">
                <PrimaryButton>
                  Add Your First Post
                  <Plus className="h-5 w-5" />
                </PrimaryButton>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-wrap gap-6">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import { db } from "@/lib/db";
import { authors, categories } from "@/lib/db/schema";
import { PostForm } from "@/components/post-form";

export const dynamic = "force-dynamic";

async function getAuthorsAndCategories() {
  const allAuthors = await db.select().from(authors);
  const allCategories = await db.select().from(categories);
  return { authors: allAuthors, categories: allCategories };
}

export default async function NewPostPage() {
  const { authors, categories } = await getAuthorsAndCategories();

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Add New Post</h1>
      <PostForm authors={authors} categories={categories} />
    </div>
  );
}

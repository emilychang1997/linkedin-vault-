import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { categories, postCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCategoriesWithCounts() {
  const allCategories = await db.select().from(categories);

  return Promise.all(
    allCategories.map(async (cat) => {
      const count = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.categoryId, cat.id));

      return {
        ...cat,
        postCount: count.length,
      };
    })
  );
}

export default async function CategoriesPage() {
  const categoriesWithCounts = await getCategoriesWithCounts();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Categories</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {category.description && (
                  <p className="text-sm text-zinc-600">{category.description}</p>
                )}
                <div className="text-2xl font-bold text-blue-600">
                  {category.postCount}
                </div>
                <p className="text-xs text-zinc-500">
                  {category.postCount === 1 ? "post" : "posts"}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

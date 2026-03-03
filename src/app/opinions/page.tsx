import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { categories, postCategories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

async function getCategoriesWithPostCounts() {
  const allCategories = await db.select().from(categories);

  return Promise.all(
    allCategories.map(async (cat) => {
      const postsInCategory = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.categoryId, cat.id));

      return {
        ...cat,
        postCount: postsInCategory.length,
      };
    })
  );
}

export default async function OpinionsPage() {
  const categoriesWithCounts = await getCategoriesWithPostCounts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Opinion Analysis</h1>
        <p className="text-zinc-600 mt-2">
          Select a category to analyze and group opinions across posts
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categoriesWithCounts.map((category) => (
          <Card
            key={category.id}
            className={`hover:shadow-md transition-shadow ${
              category.postCount < 2 ? "opacity-50" : "cursor-pointer"
            }`}
          >
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

              {category.postCount >= 2 ? (
                <div className="pt-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                    Ready for analysis
                  </Badge>
                </div>
              ) : (
                <div className="pt-2">
                  <Badge variant="outline" className="text-zinc-500">
                    Need 2+ posts
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> Opinion analysis requires at least 2 posts with
            content in a category. The AI will group similar opinions and highlight
            contradicting viewpoints.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

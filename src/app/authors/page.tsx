import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { authors, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

async function getAuthorsWithCounts() {
  const allAuthors = await db.select().from(authors);

  return Promise.all(
    allAuthors.map(async (author) => {
      const authorPosts = await db
        .select()
        .from(posts)
        .where(eq(posts.authorId, author.id));

      return {
        ...author,
        postCount: authorPosts.length,
      };
    })
  );
}

export default async function AuthorsPage() {
  const authorsWithCounts = await getAuthorsWithCounts();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Authors</h1>

      {authorsWithCounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600">
            No authors yet. Authors are added when you create posts.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {authorsWithCounts.map((author) => (
            <Link key={author.id} href={`/authors/${author.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {author.avatarUrl ? (
                      <img
                        src={author.avatarUrl}
                        alt={author.name}
                        className="w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-semibold">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{author.name}</CardTitle>
                      {author.headline && (
                        <p className="text-sm text-zinc-600 mt-1">
                          {author.headline}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">
                    {author.postCount}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {author.postCount === 1 ? "post" : "posts"}
                  </p>
                  {author.linkedinUrl && (
                    <a
                      href={author.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      LinkedIn Profile
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

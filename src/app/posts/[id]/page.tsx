import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/lib/db";
import { posts, authors, categories, postCategories, attachments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ArrowLeft, User, Linkedin } from "lucide-react";
import { getCategoryColor, cleanLinkedInTitle } from "@/lib/category-colors";
import { AISummaryButton } from "@/components/ai-summary-button";
import { FileLightbox } from "@/components/file-lightbox";

export const dynamic = "force-dynamic";

async function getPost(id: number) {
  const [result] = await db
    .select({
      post: posts,
      author: authors,
    })
    .from(posts)
    .leftJoin(authors, eq(posts.authorId, authors.id))
    .where(eq(posts.id, id));

  if (!result) return null;

  const postCats = await db
    .select({ category: categories })
    .from(postCategories)
    .leftJoin(categories, eq(postCategories.categoryId, categories.id))
    .where(eq(postCategories.postId, id));

  const postAttachments = await db
    .select()
    .from(attachments)
    .where(eq(attachments.postId, id));

  return {
    ...result.post,
    author: result.author || null,
    categories: postCats.map((pc) => pc.category).filter((c): c is NonNullable<typeof c> => c !== null),
    attachments: postAttachments,
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(parseInt(id));

  if (!post) {
    notFound();
  }

  const title = cleanLinkedInTitle(post.ogTitle, post.content);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm font-medium transition-all hover:gap-3"
          style={{ color: '#0B66C2' }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Posts
        </Link>
        <Link
          href={`/posts/${post.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: '#0B66C2', color: 'white' }}
        >
          Edit Post
        </Link>
      </div>

      {/* Title with LinkedIn icon */}
      <div>
        <a
          href={post.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-3xl font-bold transition-opacity hover:opacity-70 inline-flex items-center gap-3"
          style={{ color: '#0B66C2' }}
        >
          {title}
          <Linkedin className="h-7 w-7" />
        </a>
      </div>

      {/* Topic tags and author */}
      <div className="flex flex-wrap items-center gap-3">
        {post.categories && post.categories.length > 0 && (
          <>
            {post.categories.map((cat) => {
              const colors = getCategoryColor(cat.slug);
              return (
                <span
                  key={cat.id}
                  className="rounded-full"
                  style={{
                    backgroundColor: colors.bg,
                    color: colors.text,
                    padding: "6px 12px",
                    fontFamily: "Source Sans 3",
                    fontSize: "18px",
                    fontWeight: 500,
                  }}
                >
                  {cat.name}
                </span>
              );
            })}
          </>
        )}

        {post.author && (
          <div className="flex items-center gap-2 ml-2">
            <User className="h-5 w-5" style={{ color: '#6B7280' }} />
            {post.author.linkedinUrl ? (
              <a
                href={post.author.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium hover:opacity-70 transition-opacity"
                style={{ color: '#0B66C2' }}
              >
                {post.author.name}
              </a>
            ) : (
              <span className="text-base font-medium text-zinc-600">{post.author.name}</span>
            )}
          </div>
        )}
      </div>

      {/* Post Preview (Summary) */}
      {post.summary && (
        <Card className="border-l-4" style={{ borderLeftColor: '#0B66C2' }}>
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-zinc-500 mb-2">POST PREVIEW</p>
            <p className="text-zinc-700 leading-relaxed">{post.summary}</p>
          </CardContent>
        </Card>
      )}

      {!post.summary && post.content && (
        <Card className="border-l-4" style={{ borderLeftColor: '#0B66C2' }}>
          <CardContent className="pt-6 flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-zinc-500 mb-2">POST PREVIEW</p>
              <p className="text-zinc-600 italic">
                No preview yet. Generate a summary to create one.
              </p>
            </div>
            <AISummaryButton postId={post.id} content={post.content} />
          </CardContent>
        </Card>
      )}

      {/* Full Post Content */}
      {post.content ? (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Full Post</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap text-zinc-700 leading-relaxed">
                {post.content}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : post.ogDescription ? (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Post Content</h2>
            <p className="text-zinc-700 leading-relaxed">{post.ogDescription}</p>
            <p className="text-sm text-zinc-500 mt-4 italic">
              This is a preview from LinkedIn. For the full post, visit the original link.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-zinc-600">
              No content available. Visit the LinkedIn post to read the full text.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Attachments</h2>
            <FileLightbox attachments={post.attachments} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

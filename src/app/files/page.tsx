import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/db";
import { attachments, authors, posts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { FileLightbox } from "@/components/file-lightbox";

export const dynamic = "force-dynamic";

async function getAllFiles() {
  const allFiles = await db
    .select({
      attachment: attachments,
      author: authors,
      post: posts,
    })
    .from(attachments)
    .leftJoin(authors, eq(attachments.authorId, authors.id))
    .leftJoin(posts, eq(attachments.postId, posts.id));

  return allFiles.map(({ attachment, author, post }) => ({
    ...attachment,
    author: author || null,
    post: post || null,
  }));
}

export default async function FilesPage() {
  const files = await getAllFiles();

  const imageFiles = files.filter((f) => f.fileType.startsWith("image/"));
  const documentFiles = files.filter((f) => !f.fileType.startsWith("image/"));

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">File Library</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-600">
              Total Files
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-600">
              Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{imageFiles.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-zinc-600">
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentFiles.length}</div>
          </CardContent>
        </Card>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-600">
            No files yet. Upload files when creating or editing posts.
          </p>
        </div>
      ) : (
        <FileLightbox attachments={files} />
      )}
    </div>
  );
}

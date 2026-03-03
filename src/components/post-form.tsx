"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Trash2 } from "lucide-react";
import type { Author, Category } from "@/types";
import { DuplicateDialog } from "@/components/duplicate-dialog";
import { PrimaryButton } from "@/components/primary-button";
import { getCategoryColor } from "@/lib/category-colors";

interface PostFormProps {
  authors: Author[];
  categories: Category[];
  existingPost?: {
    id: number;
    linkedinUrl: string;
    content: string | null;
    summary: string | null;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
    authorId: number | null;
    categoryIds: number[];
  };
}

function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  return (
    <button
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "8px",
        fontFamily: "Source Sans 3",
        fontSize: "18px",
        fontWeight: 400,
        cursor: "pointer",
        transition: "all 200ms ease-in-out",
        border: isPressed ? "none" : "1px solid #0b66c2",
        backgroundColor: isPressed ? "#0b66c2" : isHovered ? "#deefff" : "transparent",
        color: isPressed ? "white" : "#0b66c2",
      }}
    >
      {children}
    </button>
  );
}

function TertiaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  return (
    <button
      {...props}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "8px",
        fontFamily: "Source Sans 3",
        fontSize: "18px",
        fontWeight: isPressed ? 500 : 400,
        cursor: "pointer",
        transition: "all 200ms ease-in-out",
        border: "none",
        backgroundColor: isPressed ? "#deefff" : isHovered ? "#eeeeee" : "transparent",
        color: isPressed ? "#0b66c2" : "#9c9c9c",
      }}
    >
      {children}
    </button>
  );
}

export function PostForm({ authors, categories, existingPost }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState(existingPost?.linkedinUrl || "");
  const [content, setContent] = useState(existingPost?.content || "");
  const [title, setTitle] = useState(
    existingPost?.ogTitle?.replace(/\s*\|.*$/, "") || ""
  );
  const [summary, setSummary] = useState(existingPost?.summary || "");
  const [ogTitle, setOgTitle] = useState(existingPost?.ogTitle || "");
  const [ogDescription, setOgDescription] = useState(existingPost?.ogDescription || "");
  const [ogImageUrl, setOgImageUrl] = useState(existingPost?.ogImageUrl || "");
  const [authorName, setAuthorName] = useState("");
  const [selectedAuthorId, setSelectedAuthorId] = useState<number | null>(existingPost?.authorId || null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(existingPost?.categoryIds || []);
  const [files, setFiles] = useState<File[]>([]);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [suggestingCategories, setSuggestingCategories] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<{
    id: number;
    ogTitle: string | null;
    linkedinUrl: string;
    matchType: "exact" | "similar";
    message: string;
  } | null>(null);
  const [existingAttachments, setExistingAttachments] = useState<Array<{
    id: number;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
  }>>([]);

  useEffect(() => {
    if (existingPost) {
      fetch(`/api/posts/${existingPost.id}/attachments`)
        .then((res) => res.json())
        .then((data) => setExistingAttachments(data))
        .catch((error) => console.error("Failed to fetch attachments:", error));
    }
  }, [existingPost]);

  const doExtract = async (url: string) => {
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/og-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      // Bug fix: set BOTH ogTitle and the displayed title field
      if (data.title) {
        setOgTitle(data.title);
        setTitle(data.title.replace(/\s*\|.*$/, "").trim());
      }
      if (data.description) setOgDescription(data.description);
      if (data.image) setOgImageUrl(data.image);
      if (data.author) setAuthorName(data.author);

      if (data.fetchError) {
        setExtractError(`Couldn't fetch page metadata: ${data.fetchError}. Fill in the fields manually.`);
      }
    } catch (error) {
      console.error("Failed to extract OG metadata:", error);
      setExtractError("Network error while fetching metadata.");
    } finally {
      setExtracting(false);
    }
  };

  const handleUrlChange = (url: string) => {
    setLinkedinUrl(url);
    setExtractError(null);

    // Clear any pending debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Only fetch if it looks like a full URL
    if (!url || !url.startsWith("http")) return;

    // Debounce: wait 600ms after the user stops typing/pasting
    debounceRef.current = setTimeout(() => doExtract(url), 600);
  };

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSuggestCategories = async () => {
    if (!content) return;

    setSuggestingCategories(true);
    try {
      const categoryNames = categories.map((c) => c.name);
      const res = await fetch("/api/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, categories: categoryNames }),
      });

      const { suggestions } = await res.json();

      // Map category names back to IDs
      const suggestedIds = categories
        .filter((cat) => suggestions.includes(cat.name))
        .map((cat) => cat.id);

      setSelectedCategoryIds(suggestedIds);
    } catch (error) {
      console.error("Failed to suggest categories:", error);
    } finally {
      setSuggestingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check for duplicates only if creating a new post (not editing)
      if (!existingPost) {
        const duplicateRes = await fetch(`/api/posts/0/duplicate-check`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            linkedinUrl,
            ogTitle,
            content,
          }),
        });

        const duplicateData = await duplicateRes.json();
        if (duplicateData.isDuplicate) {
          setDuplicateMatch({
            id: duplicateData.matchedPost.id,
            ogTitle: duplicateData.matchedPost.ogTitle,
            linkedinUrl: duplicateData.matchedPost.linkedinUrl,
            matchType: duplicateData.matchType,
            message: duplicateData.message,
          });
          setDuplicateDialogOpen(true);
          setLoading(false);
          return;
        }
      }

      await savePost();
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Failed to save post. Please try again.");
      setLoading(false);
    }
  };

  const savePost = async () => {
    try {
      // Create or find author if we have author name
      let authorId = selectedAuthorId;
      if (authorName && !authorId) {
        // Check if author already exists
        const authorsRes = await fetch("/api/authors");
        const existingAuthors = await authorsRes.json();
        const existingAuthor = existingAuthors.find(
          (a: Author) => a.name.toLowerCase() === authorName.toLowerCase()
        );

        if (existingAuthor) {
          authorId = existingAuthor.id;
        } else {
          // Create new author
          const newAuthorRes = await fetch("/api/authors", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: authorName }),
          });
          const newAuthor = await newAuthorRes.json();
          authorId = newAuthor.id;
        }
      }

      // Detect documents if content is provided
      let hasDocuments = false;
      if (content) {
        try {
          const docRes = await fetch("/api/detect-documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
          });
          const docData = await docRes.json();
          hasDocuments = docData.hasDocuments;
        } catch (error) {
          console.error("Failed to detect documents:", error);
        }
      }

      // Create or update the post
      const postRes = await fetch(
        existingPost ? `/api/posts/${existingPost.id}` : "/api/posts",
        {
          method: existingPost ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            linkedinUrl,
            content: content || null,
            ogTitle: title || ogTitle || null,
            ogDescription: ogDescription || null,
            ogImageUrl: ogImageUrl || null,
            summary: summary || null,
            hasDocumentsCta: hasDocuments,
            authorId: authorId,
            categoryIds: selectedCategoryIds,
          }),
        }
      );

      const savedPost = await postRes.json();

      // Upload files if any
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("postId", savedPost.id.toString());
        if (authorId) {
          formData.append("authorId", authorId.toString());
        }

        await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
      }

      router.push("/posts");
      router.refresh();
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Failed to save post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeepDuplicate = () => {
    setDuplicateDialogOpen(false);
    setLoading(true);
    savePost();
  };

  const handleSkipDuplicate = () => {
    setDuplicateDialogOpen(false);
    setDuplicateMatch(null);
    router.push("/posts");
  };

  const handleDelete = async () => {
    if (!existingPost) return;

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      await fetch(`/api/posts/${existingPost.id}`, {
        method: "DELETE",
      });
      router.push("/posts");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LinkedIn URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="url"
              placeholder="https://linkedin.com/posts/..."
              value={linkedinUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              required
            />
            {extracting && (
              <p className="text-sm text-zinc-500 mt-2 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Fetching page metadata...
              </p>
            )}
            {!extracting && extractError && (
              <p className="text-sm mt-2" style={{ color: "#b45309" }}>
                ⚠ {extractError}
              </p>
            )}
            {!extracting && !extractError && ogTitle && (
              <p className="text-sm text-green-700 mt-2">
                ✓ Metadata fetched successfully
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              type="text"
              placeholder="Post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium">AI-Generated Summary</label>
            <Textarea
              placeholder="AI-generated summary (editable)"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={4}
            />
          </div>

          {authorName && (
            <div>
              <label className="text-sm font-medium">Author</label>
              <p className="text-sm text-zinc-600">{authorName}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Post Content (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Paste the full LinkedIn post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categories</CardTitle>
          {content && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestCategories}
              disabled={suggestingCategories}
            >
              {suggestingCategories ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Suggest
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              const colors = getCategoryColor(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  style={{
                    backgroundColor: isSelected ? colors.bg : "#efefef",
                    color: isSelected ? colors.text : "#9c9c9c",
                    borderRadius: "20px",
                    padding: "2px 8px",
                    fontFamily: "Source Sans 3",
                    fontSize: "14px",
                    fontWeight: 500,
                    border: "none",
                    cursor: "pointer",
                    transition: "all 200ms ease-in-out",
                  }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {existingAttachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Attachments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingAttachments.map((attachment) => (
                <div key={attachment.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{attachment.fileName}</p>
                    <a
                      href={attachment.filePath}
                      download
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Download
                    </a>
                  </div>
                  {attachment.fileType === "application/pdf" && (
                    <iframe
                      src={attachment.filePath}
                      className="w-full h-[600px] border rounded"
                      title={attachment.fileName}
                    />
                  )}
                  {attachment.fileType.startsWith("image/") && (
                    <img
                      src={attachment.filePath}
                      alt={attachment.fileName}
                      className="w-full max-w-2xl rounded"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Add New Attachments (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              type="file"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            {files.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Selected files:</p>
                <ul className="text-sm text-zinc-600">
                  {files.map((file, idx) => (
                    <li key={idx}>
                      {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {/* Primary CTA: Update / Create */}
          <PrimaryButton type="submit" disabled={loading || !linkedinUrl}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {existingPost ? "Update Post" : "Create Post"}
          </PrimaryButton>

          {/* Secondary CTA: Cancel */}
          <SecondaryButton type="button" onClick={() => router.back()}>
            Cancel
          </SecondaryButton>
        </div>

        {/* Tertiary CTA: Delete */}
        {existingPost && (
          <TertiaryButton type="button" onClick={handleDelete} disabled={loading}>
            <Trash2 style={{ width: "18px", height: "18px" }} />
            Delete Post
          </TertiaryButton>
        )}
      </div>

      {duplicateMatch && (
        <DuplicateDialog
          open={duplicateDialogOpen}
          onOpenChange={setDuplicateDialogOpen}
          matchedPost={duplicateMatch}
          matchType={duplicateMatch.matchType}
          message={duplicateMatch.message}
          onKeep={handleKeepDuplicate}
          onSkip={handleSkipDuplicate}
        />
      )}
    </form>
  );
}

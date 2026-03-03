"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, ArrowLeft, Download, Pencil, Check, X } from "lucide-react";
import type { PostWithRelations } from "@/types";

const ROLE_OPTIONS = ["Founder", "SWE", "Product Manager", "Product Designer", "Other"] as const;

interface Author {
  id: number;
  name: string;
  linkedinUrl?: string | null;
  headline?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
}

interface Attachment {
  id: number;
  fileName: string;
  filePath: string;
  fileSize: number;
  source?: string | null;
}

interface AuthorWithDetails extends Author {
  posts: PostWithRelations[];
  attachments: Attachment[];
}

export default function AuthorPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [author, setAuthor] = useState<AuthorWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingRole, setEditingRole] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/authors/${id}`)
      .then((res) => {
        if (!res.ok) {
          router.push("/404");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setAuthor(data);
          setSelectedRole(data.role || "");
          setLoading(false);
        }
      });
  }, [id, router]);

  const handleSaveRole = async () => {
    if (!author) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/authors/${author.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole || null }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAuthor((prev) => prev ? { ...prev, role: updated.role } : prev);
        setEditingRole(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelRole = () => {
    setSelectedRole(author?.role || "");
    setEditingRole(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-600">Loading author...</p>
      </div>
    );
  }

  if (!author) return null;

  return (
    <div className="space-y-8">
      <Link href="/authors">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Authors
        </Button>
      </Link>

      <div className="flex items-start gap-6">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt={author.name}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-3xl">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{author.name}</h1>
          {author.headline && (
            <p className="text-zinc-600 mt-2">{author.headline}</p>
          )}
          {author.linkedinUrl && (
            <a
              href={author.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-2 mt-2"
            >
              View LinkedIn Profile
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {/* Role field */}
          <div className="mt-3 flex items-center gap-2">
            {editingRole ? (
              <>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No role</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveRole}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  Save
                </button>
                <button
                  onClick={handleCancelRole}
                  className="flex items-center gap-1 rounded-md border border-zinc-300 px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span className="text-sm text-zinc-500">
                  Role:{" "}
                  <span className="font-medium text-zinc-700">
                    {author.role || "Not set"}
                  </span>
                </span>
                <button
                  onClick={() => setEditingRole(true)}
                  className="flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {author.attachments && author.attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files by {author.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {author.attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-zinc-600">
                      {(file.fileSize / 1024).toFixed(1)} KB
                    </p>
                    {file.source && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Source: {file.source}
                      </p>
                    )}
                  </div>
                  <a
                    href={file.filePath}
                    download
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-4">
          Posts by {author.name} ({author.posts?.length ?? 0})
        </h2>
        {!author.posts || author.posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600">No posts from this author yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {author.posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Files, MessageSquare, ChevronDown, ChevronRight, Users, FolderOpen } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Author {
  id: number;
  name: string;
  role?: string | null;
}

const PREDEFINED_ROLES = ["Founder", "Software Engineer", "Product Manager", "Product Designer"] as const;

// Role colors sourced from Figma Primitives tokens
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  "Founder":            { bg: "#FEF1D8", text: "#A9721C" }, // papaya / cider
  "Software Engineer":  { bg: "#EBF6EE", text: "#095922" }, // mint / forest
  "Product Manager":    { bg: "#DEEFFF", text: "#0B66C2" }, // alice / ocean
  "Product Designer":   { bg: "#E8E0F5", text: "#6B466D" }, // lavender / plum
};

export function Sidebar() {
  const pathname = usePathname();
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [authorsOpen, setAuthorsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);

    fetch("/api/authors")
      .then((res) => res.json())
      .then(setAuthors);
  }, []);

  // Group authors by role
  const authorsByRole = PREDEFINED_ROLES.reduce<Record<string, Author[]>>((acc, role) => {
    acc[role] = [];
    return acc;
  }, {});

  for (const author of authors) {
    if (author.role && PREDEFINED_ROLES.includes(author.role as typeof PREDEFINED_ROLES[number])) {
      authorsByRole[author.role].push(author);
    }
    // Authors without a recognized role are not shown
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-zinc-200">
      <div className="flex h-16 items-center px-6 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900">LinkedIn Vault</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <Home className="h-5 w-5" />
          Dashboard
        </Link>

        <Link
          href="/posts"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname.startsWith("/posts")
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <FileText className="h-5 w-5" />
          Posts
        </Link>

        {/* Topics Dropdown */}
        <div>
          <button
            onClick={() => setTopicsOpen(!topicsOpen)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            <span className="flex items-center gap-3">
              <FolderOpen className="h-5 w-5" />
              Topics
            </span>
            {topicsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {topicsOpen && (
            <div className="ml-8 mt-1 space-y-1">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                    pathname === `/categories/${category.slug}`
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Authors Dropdown */}
        <div>
          <button
            onClick={() => setAuthorsOpen(!authorsOpen)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
          >
            <span className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              Creators
            </span>
            {authorsOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {authorsOpen && (
            <div className="ml-3 mt-1 space-y-3">
              {PREDEFINED_ROLES.map((role) => {
                const colors = ROLE_COLORS[role];
                return (
                  <div key={role}>
                    {/* Role chip — styled like topic chips */}
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        backgroundColor: colors.bg,
                        color: colors.text,
                        borderRadius: "20px",
                        padding: "2px 10px",
                        fontFamily: "Source Sans 3, sans-serif",
                        fontSize: "13px",
                        fontWeight: 500,
                        marginBottom: "4px",
                      }}
                    >
                      {role}
                    </span>
                    {/* Authors under this role */}
                    <div className="space-y-0.5 mt-1">
                      {authorsByRole[role].length === 0 ? (
                        <p className="text-xs text-zinc-400 px-3">No authors yet</p>
                      ) : (
                        authorsByRole[role].map((author) => (
                          <Link
                            key={author.id}
                            href={`/authors/${author.id}`}
                            className={`block rounded-lg px-3 py-1.5 text-sm transition-colors ${
                              pathname === `/authors/${author.id}`
                                ? "bg-zinc-100 text-zinc-900"
                                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            }`}
                          >
                            {author.name}
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Link
          href="/files"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/files"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <Files className="h-5 w-5" />
          Files
        </Link>

        <Link
          href="/opinions"
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            pathname === "/opinions"
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          Opinions
        </Link>
      </nav>
    </div>
  );
}

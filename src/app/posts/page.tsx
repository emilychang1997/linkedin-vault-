"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { getCategoryColor } from "@/lib/category-colors";
import { PrimaryButton } from "@/components/primary-button";
import { PostCard } from "@/components/post-card";
import { DraggablePostCard } from "@/components/draggable-post-card";
import { DroppableCategoryChip } from "@/components/droppable-category-chip";
import type { PostWithRelations, Category } from "@/types";

export default function PostsPage() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activePost, setActivePost] = useState<PostWithRelations | null>(null);
  const [overCategoryId, setOverCategoryId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require 8px of movement before drag starts, so clicks still work
        distance: 8,
      },
    })
  );

  const fetchPosts = () =>
    fetch("/api/posts")
      .then((res) => res.json())
      .then(setPosts);

  useEffect(() => {
    Promise.all([
      fetch("/api/posts").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ]).then(([postsData, categoriesData]) => {
      setPosts(postsData);
      setCategories(categoriesData);
      setLoading(false);
    });
  }, []);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const query = searchQuery.toLowerCase().trim();

  const filteredPosts = posts.filter((post) => {
    if (selectedCategories.length > 0) {
      if (!post.categories?.some((cat) => selectedCategories.includes(cat.id))) return false;
    }
    if (query) {
      const title = (post.ogTitle?.replace(/\s*\|.*$/, "") || post.content?.split("\n")[0] || "").toLowerCase();
      const content = (post.content || "").toLowerCase();
      const author = (post.author?.name || "").toLowerCase();
      if (!title.includes(query) && !content.includes(query) && !author.includes(query)) return false;
    }
    return true;
  });

  const handleDragStart = (event: DragStartEvent) => {
    const postId = event.active.id as number;
    const post = posts.find((p) => p.id === postId) || null;
    setActivePost(post);
  };

  const handleDragOver = (event: { over: { id: unknown } | null }) => {
    if (event.over) {
      setOverCategoryId(event.over.id as number);
    } else {
      setOverCategoryId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActivePost(null);
    setOverCategoryId(null);

    const { active, over } = event;
    if (!over) return;

    const postId = active.id as number;
    const categoryId = over.id as number;

    // Find the post and check if it already has this category
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const existingCategoryIds = post.categories?.map((c) => c.id) ?? [];
    if (existingCategoryIds.includes(categoryId)) return; // already assigned

    const newCategoryIds = [...existingCategoryIds, categoryId];

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const addedCategory = categories.find((c) => c.id === categoryId);
        return {
          ...p,
          categories: addedCategory
            ? [...(p.categories ?? []), addedCategory]
            : p.categories,
        };
      })
    );

    // Persist via API
    try {
      await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryIds: newCategoryIds }),
      });
      // Re-fetch to stay in sync
      await fetchPosts();
    } catch (err) {
      console.error("Failed to update post categories:", err);
      // Revert optimistic update on failure
      await fetchPosts();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-zinc-600">Loading posts...</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">All Posts</h1>
          <Link href="/posts/new">
            <PrimaryButton>
              Add New
              <Plus className="h-5 w-5" />
            </PrimaryButton>
          </Link>
        </div>

        {/* Search bar */}
        <div
          className="group/search flex items-center gap-2 transition-all duration-200"
          style={{
            background: "#FAFAFA",
            border: "1px solid #E5E5E5",
            borderRadius: "8px",
            padding: "8px 12px",
            maxWidth: "400px",
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.background = "#FFFFFF";
            e.currentTarget.style.borderColor = "#B9B9B9";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(11,102,194,0.08)";
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.background = "#FAFAFA";
            e.currentTarget.style.borderColor = "#E5E5E5";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <Search size={15} color="#8A8A8A" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search posts, authors…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontFamily: "Source Sans 3, sans-serif",
              fontSize: "14px",
              color: "#010101",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ color: "#8A8A8A", lineHeight: 1, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((category) => {
            const colors = getCategoryColor(category.slug);
            const isSelected = selectedCategories.includes(category.id);
            const isOver = overCategoryId === category.id;

            return (
              <DroppableCategoryChip
                key={category.id}
                category={category}
                colors={colors}
                isSelected={isSelected}
                isOver={isOver}
                isDragging={activePost !== null}
                onClick={() => toggleCategory(category.id)}
              />
            );
          })}
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600 mb-4">No posts found.</p>
            <Link href="/posts/new">
              <PrimaryButton>
                Add Your First Post
                <Plus className="h-5 w-5" />
              </PrimaryButton>
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6">
            {filteredPosts.map((post) => (
              <DraggablePostCard
                key={post.id}
                post={post}
                isDragging={activePost?.id === post.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Drag overlay — renders a ghost of the dragged card */}
      <DragOverlay dropAnimation={null}>
        {activePost ? (
          <div style={{ opacity: 0.85, pointerEvents: "none" }}>
            <PostCard post={activePost} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
import type { PostWithRelations } from "@/types";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<PostWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
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

  const filteredPosts =
    selectedCategories.length === 0
      ? posts
      : posts.filter((post) =>
          post.categories?.some((cat) => selectedCategories.includes(cat.id))
        );

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

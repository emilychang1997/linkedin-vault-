"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { PostCard } from "@/components/post-card";
import type { PostWithRelations } from "@/types";

interface DraggablePostCardProps {
  post: PostWithRelations;
  isDragging: boolean;
}

export function DraggablePostCard({ post, isDragging }: DraggablePostCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: post.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    transition: isDragging ? undefined : "opacity 0.15s ease",
    touchAction: "none",
    display: "flex",
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <PostCard post={post} />
    </div>
  );
}

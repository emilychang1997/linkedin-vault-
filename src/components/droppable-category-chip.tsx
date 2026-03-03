"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";

interface CategoryColors {
  bg: string;
  text: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface DroppableCategoryChipProps {
  category: Category;
  colors: CategoryColors;
  isSelected: boolean;
  isOver: boolean;
  isDragging: boolean;
  onClick: () => void;
}

// Exact states from Figma nodes 58-268 / 70-292 / 70-265 / 70-305:
//
//  Default       → transparent bg, border-radius: 0, text #010101 (text-palette), weight 400
//  Hover         → #E5E5E5 bg,     border-radius: 0, text #010101,                weight 400
//  Selected      → category light bg, border-radius: 0, border-bottom 2.5px solid category dark,
//                  text = category dark, weight 500
//  Selected Hover→ TWO-PART: fully rounded chip (radius 10px) + separate 2.5px bar below (gap 2px)
//                  text = category dark, weight 500

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "Source Sans 3, sans-serif",
  fontSize: "18px",
  lineHeight: "normal",
  whiteSpace: "nowrap",
  position: "relative",
};

const BASE_BUTTON: React.CSSProperties = {
  borderTop: "none",
  borderLeft: "none",
  borderRight: "none",
  borderBottom: "none",
  flexShrink: 0,
};

export function DroppableCategoryChip({
  category,
  colors,
  isSelected,
  isOver,
  isDragging,
  onClick,
}: DroppableCategoryChipProps) {
  const { setNodeRef } = useDroppable({ id: category.id });
  const [isHovered, setIsHovered] = useState(false);

  const isActive = isSelected || isOver;
  const isSelectedHover = isActive && isHovered && !isOver;

  const handlers = {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };

  // ── SELECTED HOVER ── two-part: rounded chip + separate bar
  if (isSelectedHover) {
    return (
      <button
        ref={setNodeRef}
        onClick={onClick}
        {...handlers}
        style={{
          ...BASE_BUTTON,
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "2px",
          background: "transparent",
          padding: 0,
          cursor: isDragging ? "copy" : "pointer",
        }}
      >
        {/* Chip — fully rounded */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "6px",
            paddingBottom: "2px",
            paddingLeft: "12px",
            paddingRight: "12px",
            background: colors.bg,
            borderRadius: "10px",
          }}
        >
          <span style={{ ...LABEL_STYLE, fontWeight: 500, color: colors.text }}>
            {category.name}
          </span>
        </div>
        {/* Underline bar — separate element, full width */}
        <div
          style={{
            height: "2.5px",
            width: "100%",
            backgroundColor: colors.text,
            flexShrink: 0,
          }}
        />
      </button>
    );
  }

  // ── SELECTED ── top corners 10px, bottom corners 0, border-bottom
  if (isActive) {
    return (
      <button
        ref={setNodeRef}
        onClick={onClick}
        {...handlers}
        style={{
          ...BASE_BUTTON,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 12px",
          background: colors.bg,
          borderRadius: "10px 10px 0 0",
          borderBottom: `2.5px solid ${colors.text}`,
          cursor: isDragging ? "copy" : "pointer",
        }}
      >
        <span style={{ ...LABEL_STYLE, fontWeight: 500, color: colors.text }}>
          {category.name}
        </span>
      </button>
    );
  }

  // ── HOVER ── gray rect, 10px radius on all corners
  if (isHovered) {
    return (
      <button
        ref={setNodeRef}
        onClick={onClick}
        {...handlers}
        style={{
          ...BASE_BUTTON,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px 12px",
          background: "#E5E5E5",
          borderRadius: "10px",
          cursor: isDragging ? "copy" : "pointer",
        }}
      >
        <span style={{ ...LABEL_STYLE, fontWeight: 400, color: "#010101" }}>
          {category.name}
        </span>
      </button>
    );
  }

  // ── DEFAULT ── transparent, no corner radius
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      {...handlers}
      style={{
        ...BASE_BUTTON,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "6px 12px",
        background: "transparent",
        borderRadius: 0,
        cursor: isDragging ? "copy" : "pointer",
      }}
    >
      <span style={{ ...LABEL_STYLE, fontWeight: 400, color: "#010101" }}>
        {category.name}
      </span>
    </button>
  );
}

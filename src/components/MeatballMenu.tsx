"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2, Link2 } from "lucide-react";

interface MeatballMenuProps {
  postId: number;
  linkedinUrl: string;
}

export function MeatballMenu({ postId, linkedinUrl }: MeatballMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click or ESC
  useEffect(() => {
    if (!menuOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(linkedinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setMenuOpen(false);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`/api/posts/${postId}`, { method: "DELETE" });
    window.location.reload();
  };

  return (
    // invisible by default; group-hover:visible shows it when the card is hovered.
    // When menu is open, force-visible so the dropdown doesn't vanish if cursor leaves card.
    <div
      ref={containerRef}
      className={menuOpen ? "absolute" : "absolute invisible group-hover:visible"}
      style={{ top: "9px", right: "12px", zIndex: 10 }}
    >
      {/* Meatball button — default vs hover state from Figma node 13-146 */}
      <button
        onMouseEnter={() => setButtonHovered(true)}
        onMouseLeave={() => setButtonHovered(false)}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "20px",
          width: buttonHovered || menuOpen ? "28px" : "22px",
          backgroundColor: buttonHovered || menuOpen ? "#efefef" : "transparent",
          borderRadius: "4px",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {/* 17×3px dots — Figma spec */}
        <svg width="17" height="3" viewBox="0 0 17 3" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="1.5" cy="1.5" r="1.5" fill="#9C9C9C" />
          <circle cx="8.5" cy="1.5" r="1.5" fill="#9C9C9C" />
          <circle cx="15.5" cy="1.5" r="1.5" fill="#9C9C9C" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            background: "white",
            border: "1px solid #DFDFDF",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
            minWidth: "152px",
            overflow: "hidden",
          }}
        >
          <button
            onClick={handleCopyLink}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#F9FAFB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "9px 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "Source Sans 3, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#374151",
              textAlign: "left",
            }}
          >
            <Link2 size={15} color="#6B7280" />
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <div style={{ height: "1px", background: "#F3F4F6" }} />
          <button
            onClick={handleDelete}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "9px 12px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "Source Sans 3, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#DC2626",
              textAlign: "left",
            }}
          >
            <Trash2 size={15} color="#DC2626" />
            Delete Post
          </button>
        </div>
      )}
    </div>
  );
}

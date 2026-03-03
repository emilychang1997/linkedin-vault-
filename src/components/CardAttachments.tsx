"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { FileIcon } from "@/components/icons/FileIcon";
import type { Attachment } from "@/types";

function getFileFormat(fileType: string): { label: string; color: string } {
  if (fileType === "application/pdf") return { label: "PDF", color: "#f14848" };
  if (fileType === "image/png") return { label: "PNG", color: "#4ec7b5" };
  if (fileType === "image/jpeg" || fileType === "image/jpg") return { label: "JPG", color: "#bb50e0" };
  if (fileType.startsWith("image/")) return { label: "IMG", color: "#4ec7b5" };
  return { label: "FILE", color: "#9C9C9C" };
}

interface CardAttachmentsProps {
  attachments: Attachment[];
}

export function CardAttachments({ attachments }: CardAttachmentsProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const close = useCallback(() => setActiveIndex(null), []);
  const prev = useCallback(
    () => setActiveIndex((i) => (i !== null ? (i - 1 + attachments.length) % attachments.length : null)),
    [attachments.length]
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i !== null ? (i + 1) % attachments.length : null)),
    [attachments.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, close, prev, next]);

  if (attachments.length === 0) return null;

  const active = activeIndex !== null ? attachments[activeIndex] : null;

  return (
    <>
      {/* File chips row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "18px", alignItems: "center" }}>
        {attachments.map((attachment, idx) => {
          const { label, color } = getFileFormat(attachment.fileType);
          return (
            <button
              key={attachment.id}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIndex(idx); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {/* File icon with format badge */}
              <div style={{ position: "relative", width: "28px", height: "27px", flexShrink: 0 }}>
                {/* Document icon */}
                <div style={{ position: "absolute", top: "1px", left: "7px", width: "18px", height: "25px" }}>
                  <FileIcon color="#9C9C9C" />
                </div>
                {/* Format badge */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "calc(50% + 3.5px)",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: color,
                    borderRadius: "1px",
                    padding: "1px 2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "8px",
                      fontWeight: 600,
                      color: "white",
                      whiteSpace: "nowrap",
                      lineHeight: "normal",
                    }}
                  >
                    {label}
                  </span>
                </div>
              </div>

              {/* File name */}
              <span
                style={{
                  fontFamily: "Source Sans 3, sans-serif",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#324054",
                  textDecoration: "underline",
                  textDecorationSkipInk: label === "PDF" ? "none" : "auto",
                  whiteSpace: "nowrap",
                }}
              >
                {attachment.fileName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Lightbox overlay */}
      {active !== null && activeIndex !== null && (
        <div
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.70)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeIn 300ms ease-in-out",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: "12px",
              width: "min(90vw, 900px)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
            }}
          >
            {/* Top bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #DFDFDF",
                gap: "12px",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 }}>
                <span
                  style={{
                    fontFamily: "Source Sans 3, sans-serif",
                    fontSize: "16px",
                    fontWeight: 600,
                    color: "#000",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {active.fileName}
                </span>
                <span
                  style={{
                    fontFamily: "Source Sans 3, sans-serif",
                    fontSize: "13px",
                    color: "#9C9C9C",
                  }}
                >
                  {(active.fileSize / 1024).toFixed(1)} KB
                  {attachments.length > 1 && ` · ${activeIndex + 1} of ${attachments.length}`}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <a
                  href={active.filePath}
                  download
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    background: "#0B66C2",
                    color: "white",
                    fontFamily: "Source Sans 3, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                    transition: "background 300ms ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "linear-gradient(0deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.30) 100%), #0B66C2";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = "#0B66C2";
                  }}
                >
                  <Download style={{ width: "14px", height: "14px" }} />
                  Download
                </a>

                <button
                  onClick={close}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#9C9C9C",
                    transition: "background 300ms ease-in-out",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <X style={{ width: "18px", height: "18px" }} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflow: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#F9FAFB",
                minHeight: 0,
              }}
            >
              {active.fileType.startsWith("image/") ? (
                <img
                  src={active.filePath}
                  alt={active.fileName}
                  style={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
                />
              ) : active.fileType === "application/pdf" ? (
                <iframe
                  src={active.filePath}
                  title={active.fileName}
                  style={{ width: "100%", height: "70vh", border: "none" }}
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "48px" }}>
                  <FileIcon color="#9C9C9C" />
                  <p style={{ fontFamily: "Source Sans 3, sans-serif", fontSize: "14px", color: "#6B7280" }}>
                    Preview not available for this file type.
                  </p>
                </div>
              )}
            </div>

            {/* Prev / Next */}
            {attachments.length > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  borderTop: "1px solid #DFDFDF",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={prev}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#0B66C2",
                    fontFamily: "Source Sans 3, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "background 300ms ease-in-out",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#DBEAFE"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <ChevronLeft style={{ width: "16px", height: "16px" }} />
                  Previous
                </button>

                <div style={{ display: "flex", gap: "6px" }}>
                  {attachments.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveIndex(i)}
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        border: "none",
                        cursor: "pointer",
                        background: i === activeIndex ? "#0B66C2" : "#DFDFDF",
                        padding: 0,
                        transition: "background 300ms ease-in-out",
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "#0B66C2",
                    fontFamily: "Source Sans 3, sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    transition: "background 300ms ease-in-out",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#DBEAFE"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  Next
                  <ChevronRight style={{ width: "16px", height: "16px" }} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </>
  );
}

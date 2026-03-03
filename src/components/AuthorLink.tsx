"use client";

import { useState } from "react";
import { UserIcon } from "@/components/icons/UserIcon";

interface AuthorLinkProps {
  name: string;
  linkedinUrl?: string | null;
}

export function AuthorLink({ name, linkedinUrl }: AuthorLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const iconColor = isHovered ? "#0B66C2" : "#9C9C9C";
  const textColor = isHovered ? "#0B66C2" : "#8a8a8a";

  if (linkedinUrl) {
    return (
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-end gap-[2px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
        <UserIcon color={iconColor} />
        <span
          style={{
            color: textColor,
            fontFamily: "Source Sans 3, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            textDecoration: isHovered ? "underline" : "none",
            lineHeight: "normal",
          }}
        >
          {name}
        </span>
      </a>
    );
  }

  return (
    <div className="inline-flex items-end gap-[2px]">
      <UserIcon color="#9C9C9C" />
      <span
        style={{
          color: "#8a8a8a",
          fontFamily: "Source Sans 3, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          lineHeight: "normal",
        }}
      >
        {name}
      </span>
    </div>
  );
}

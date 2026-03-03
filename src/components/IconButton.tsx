"use client";

import { useState } from "react";

interface IconButtonProps {
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode | ((color: string) => React.ReactNode);
  className?: string;
}

export function IconButton({ onClick, children, className = "" }: IconButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const getBackgroundColor = () => {
    if (isPressed) return "#deefff";
    if (isHovered) return "#efefef";
    return "transparent";
  };

  const getBorderRadius = () => {
    if (isPressed || isHovered) return "4px";
    return "8px";
  };

  const getIconColor = () => {
    if (isPressed) return "#0B66C2";
    return "#9C9C9C";
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className={`flex justify-center items-center transition-all duration-300 ease-in-out ${className}`}
      style={{
        width: "24px",
        height: "24px",
        borderRadius: getBorderRadius(),
        backgroundColor: getBackgroundColor(),
      }}
    >
      <div style={{ color: getIconColor() }}>
        {typeof children === "function" ? children(getIconColor()) : children}
      </div>
    </button>
  );
}

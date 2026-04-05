"use client";

import { VIBE_LABELS } from "@/types";

interface VibeBarProps {
  level: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function VibeBar({ level, showLabel = true, size = "md" }: VibeBarProps) {
  const filled = "█".repeat(level);
  const empty = "░".repeat(5 - level);
  const label = VIBE_LABELS[level] ?? `Level ${level}`;

  const colorClass =
    level === 1 ? "vibe-1" :
    level === 2 ? "vibe-2" :
    level === 3 ? "vibe-3" :
    level === 4 ? "vibe-4" : "vibe-5";

  const sizeClass =
    size === "sm" ? "text-xs" :
    size === "lg" ? "text-2xl" : "text-base";

  return (
    <span className={`font-mono ${colorClass} ${sizeClass}`}>
      {filled}<span style={{ color: "#1a2a1a" }}>{empty}</span>
      {showLabel && <span className="ml-2 text-xs opacity-70">{label}</span>}
    </span>
  );
}

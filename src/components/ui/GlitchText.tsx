"use client";

interface GlitchTextProps {
  children: React.ReactNode;
  className?: string;
  fast?: boolean;
  style?: React.CSSProperties;
  tag?: "h1" | "h2" | "h3" | "h4" | "span" | "p" | "div";
}

export function GlitchText({ children, className = "", fast = false, style, tag: Tag = "span" }: GlitchTextProps) {
  return (
    <Tag className={`${fast ? "glitch-fast" : "glitch"} ${className}`} style={style}>
      {children}
    </Tag>
  );
}

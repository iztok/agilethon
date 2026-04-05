"use client";

export function BlinkCursor({ char = "▮" }: { char?: string }) {
  return <span className="blink">{char}</span>;
}

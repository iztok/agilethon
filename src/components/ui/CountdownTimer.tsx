"use client";

import { useState, useEffect, useRef } from "react";

interface CountdownTimerProps {
  remainingSeconds: number;
  phase: string;
  large?: boolean;
}

export function CountdownTimer({ remainingSeconds, phase, large = false }: CountdownTimerProps) {
  const [secs, setSecs] = useState(remainingSeconds);
  const lastSyncRef = useRef({ time: Date.now(), remaining: remainingSeconds });

  useEffect(() => {
    lastSyncRef.current = { time: Date.now(), remaining: remainingSeconds };
    setSecs(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (phase !== "active") return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - lastSyncRef.current.time) / 1000);
      const computed = Math.max(0, lastSyncRef.current.remaining - elapsed);
      setSecs(computed);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;

  const formatted = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;

  const colorClass =
    secs > 1800 ? "text-terminal-green" :
    secs > 600 ? "text-terminal-yellow" :
    "text-terminal-red blink";

  const label =
    phase === "registration" ? "WAITING" :
    phase === "paused" ? "PAUSED" :
    phase === "finished" ? "FINISHED" : formatted;

  if (large) {
    return (
      <div className={`font-mono ${colorClass} ${secs <= 600 && phase === "active" ? "glow-red" : ""}`}
           style={{ fontSize: "4rem", letterSpacing: "0.1em", fontVariantNumeric: "tabular-nums" }}>
        {label}
      </div>
    );
  }

  return (
    <span className={`font-mono ${colorClass}`} style={{ fontVariantNumeric: "tabular-nums" }}>
      {label}
    </span>
  );
}

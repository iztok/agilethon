"use client";

import type { ObstacleEventInfo } from "@/types";

interface ObstacleBadgeProps {
  obstacleEvent: ObstacleEventInfo;
  showDescription?: boolean;
}

const SEVERITY_STYLES: Record<string, { color: string; bg: string; border: string }> = {
  low: { color: "var(--terminal-green)", bg: "#001100", border: "#1a3a1a" },
  medium: { color: "var(--terminal-yellow)", bg: "#111100", border: "#3a3a1a" },
  high: { color: "var(--terminal-orange)", bg: "#110800", border: "#3a2a1a" },
  critical: { color: "var(--terminal-red)", bg: "#110000", border: "#3a1a1a" },
};

export function ObstacleBadge({ obstacleEvent, showDescription = false }: ObstacleBadgeProps) {
  const { obstacle } = obstacleEvent;
  const style = SEVERITY_STYLES[obstacle.severity] ?? SEVERITY_STYLES.low;

  return (
    <div
      style={{
        border: `1px solid ${style.border}`,
        background: style.bg,
        padding: showDescription ? "0.5rem 0.75rem" : "0.15rem 0.4rem",
        display: "inline-block",
      }}
    >
      <div style={{ color: style.color, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
        <span>{obstacle.icon}</span>
        <span style={{ fontWeight: "bold" }}>{obstacle.name}</span>
        {obstacle.durationMinutes > 0 && (
          <span style={{ opacity: 0.6 }}>({obstacle.durationMinutes}m)</span>
        )}
      </div>
      {showDescription && (
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem", lineHeight: 1.4 }}>
          {obstacle.description}
        </div>
      )}
      {obstacleEvent.customNote && (
        <div style={{ color: style.color, fontSize: "0.7rem", marginTop: "0.2rem", opacity: 0.8 }}>
          NOTE: {obstacleEvent.customNote}
        </div>
      )}
    </div>
  );
}

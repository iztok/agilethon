"use client";

import { useEffect, useState } from "react";
import type { ObstacleEventInfo } from "@/types";

const SEVERITY_CONFIG = {
  low: { bg: "#001100", border: "#00ff00", glow: "rgba(0,255,0,0.5)" },
  medium: { bg: "#111100", border: "#ffff00", glow: "rgba(255,255,0,0.5)" },
  high: { bg: "#110800", border: "#ff8800", glow: "rgba(255,136,0,0.5)" },
  critical: { bg: "#110000", border: "#ff0000", glow: "rgba(255,0,0,0.5)" },
};

interface ObstacleAlertProps {
  obstacleEvent: ObstacleEventInfo;
  onDismiss: () => void;
  autoDismissMs?: number;
}

export function ObstacleAlert({ obstacleEvent, onDismiss, autoDismissMs = 10000 }: ObstacleAlertProps) {
  const [visible, setVisible] = useState(true);
  const { obstacle } = obstacleEvent;
  const config = SEVERITY_CONFIG[obstacle.severity];

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, autoDismissMs);
    return () => clearTimeout(t);
  }, [autoDismissMs, onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.92)",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.3s",
        cursor: "pointer",
      }}
      onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
    >
      {/* Flash border */}
      <div
        className={obstacle.severity === "critical" || obstacle.severity === "high" ? "shake" : ""}
        style={{
          border: `2px solid ${config.border}`,
          background: config.bg,
          boxShadow: `0 0 60px ${config.glow}, inset 0 0 60px ${config.glow}`,
          padding: "3rem 4rem",
          maxWidth: "700px",
          width: "90%",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "0.5rem" }}>{obstacle.icon}</div>
        <div
          className="glitch-fast glow-red"
          style={{
            color: config.border,
            fontSize: "2.5rem",
            fontWeight: "bold",
            marginBottom: "1rem",
            letterSpacing: "0.15em",
            textShadow: `0 0 20px ${config.glow}`,
          }}
        >
          {obstacle.name}
        </div>
        <div style={{ color: "#888", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
          {obstacle.description}
        </div>
        {obstacleEvent.customNote && (
          <div style={{ color: config.border, fontSize: "0.85rem", border: `1px solid ${config.border}`, padding: "0.5rem" }}>
            GAME MASTER NOTE: {obstacleEvent.customNote}
          </div>
        )}
        {obstacleEvent.targetTeamIds.length > 0 && (
          <div style={{ color: "#555", fontSize: "0.75rem", marginTop: "1rem" }}>
            AFFECTS: {obstacleEvent.targetTeamIds.length === 1 ? "your team" : `${obstacleEvent.targetTeamIds.length} teams`}
          </div>
        )}
        <div style={{ color: "#333", fontSize: "0.7rem", marginTop: "1rem" }}>
          click anywhere to dismiss
        </div>
      </div>
    </div>
  );
}

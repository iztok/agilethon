"use client";

import { useState, useEffect } from "react";
import { MatrixRain } from "@/components/MatrixRain";
import { VibeBar } from "@/components/ui/VibeBar";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { GlitchText } from "@/components/ui/GlitchText";
import { BlinkCursor } from "@/components/ui/BlinkCursor";
import { useGameState } from "@/hooks/useGameState";
import type { GameState, ObstacleEventInfo, TeamInfo } from "@/types";

const SEVERITY_BG: Record<string, string> = {
  low: "rgba(0,255,0,0.05)",
  medium: "rgba(255,255,0,0.05)",
  high: "rgba(255,136,0,0.1)",
  critical: "rgba(255,0,0,0.15)",
};

const SEVERITY_BORDER: Record<string, string> = {
  low: "var(--terminal-green)",
  medium: "var(--terminal-yellow)",
  high: "var(--terminal-orange)",
  critical: "var(--terminal-red)",
};

export function ProjectorClient({ eventId, initialState }: { eventId: string; initialState: GameState }) {
  const { state, timerRemaining } = useGameState(eventId, true);
  const gameState = state ?? initialState;
  const phase = gameState.event.phase;

  const [alert, setAlert] = useState<ObstacleEventInfo | null>(null);
  const [prevObstacleIds, setPrevObstacleIds] = useState<Set<string>>(
    new Set(initialState.activeObstacles.map((o) => o.id))
  );

  useEffect(() => {
    const current = gameState.activeObstacles;
    for (const oe of current) {
      if (!prevObstacleIds.has(oe.id)) {
        setAlert(oe);
        setTimeout(() => setAlert(null), 9000);
        break;
      }
    }
    setPrevObstacleIds(new Set(current.map((o) => o.id)));
  }, [gameState.activeObstacles]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", overflow: "hidden", position: "relative", fontFamily: "monospace" }}>
      <MatrixRain opacity={0.15} />

      {/* Full-screen obstacle alert overlay */}
      {alert && <ProjectorObstacleAlert obstacle={alert} />}

      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", padding: "1.5rem 2rem" }}>

        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: "1rem",
          marginBottom: "1.5rem",
        }}>
          <div>
            <GlitchText tag="h1" className="glow-green" style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", color: "var(--terminal-green)", margin: 0 } as React.CSSProperties}>
              AGILETHON
            </GlitchText>
            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              PAIR VIBE CODING TOURNAMENT // AGILEDROP
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "0.25rem" }}>REMAINING</div>
            <CountdownTimer remainingSeconds={timerRemaining} phase={phase} large />
          </div>

          <div style={{ textAlign: "right" }}>
            <div className={`phase-${phase}`} style={{ border: "1px solid", padding: "0.3rem 1rem", fontSize: "1rem", textTransform: "uppercase" }}>
              {phase}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
              {gameState.teams.length} teams active
            </div>
          </div>
        </div>

        {/* REGISTRATION phase */}
        {phase === "registration" && (
          <ProjectorLobby participants={gameState.participants} />
        )}

        {/* ACTIVE / PAUSED / FINISHED */}
        {(phase === "active" || phase === "paused" || phase === "finished") && (
          <ProjectorGame
            teams={gameState.teams}
            phase={phase}
            recentLog={gameState.recentLog}
          />
        )}
      </div>
    </div>
  );
}

function ProjectorLobby({ participants }: { participants: GameState["participants"] }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ color: "var(--terminal-cyan)", fontSize: "clamp(3rem, 8vw, 7rem)", fontWeight: "bold" }}>
          {participants.length}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "1rem" }}>OPERATIVES STANDING BY</div>
        <div style={{ color: "var(--terminal-green)", marginTop: "0.5rem" }}>
          Awaiting Game Master... <BlinkCursor />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "0.75rem" }}>
        {participants.map((p, i) => (
          <div key={p.id} className="terminal-card" style={{ textAlign: "center", padding: "0.75rem" }}>
            <div style={{ color: "var(--terminal-green)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>{p.name}</div>
            <VibeBar level={p.vibeLevel} size="sm" />
          </div>
        ))}
      </div>

      {participants.length === 0 && (
        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "1.5rem", marginTop: "3rem" }}>
          // waiting for operatives to connect <BlinkCursor />
        </div>
      )}
    </div>
  );
}

function ProjectorGame({ teams, phase, recentLog }: {
  teams: TeamInfo[];
  phase: string;
  recentLog: GameState["recentLog"];
}) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {phase === "finished" && (
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <GlitchText tag="h2" className="glow-green" style={{ fontSize: "clamp(2rem, 5vw, 4rem)", color: "var(--terminal-green)" } as React.CSSProperties}>
            HACKATHON COMPLETE
          </GlitchText>
          <div style={{ color: "var(--text-muted)" }}>Prepare your demos.</div>
        </div>
      )}

      {/* Team grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${Math.min(teams.length, 4)}, 1fr)`,
        gap: "1rem",
        flex: 1,
      }}>
        {teams.map((team) => (
          <ProjectorTeamCard key={team.id} team={team} />
        ))}
      </div>

      {/* Scrolling event log */}
      {recentLog.length > 0 && (
        <div style={{
          borderTop: "1px solid var(--border-color)",
          marginTop: "1rem",
          paddingTop: "0.5rem",
          fontSize: "0.7rem",
          color: "var(--text-muted)",
          display: "flex",
          gap: "2rem",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}>
          {recentLog.slice(0, 5).map((entry) => (
            <span key={entry.id} className={`type-${entry.type}`} style={{
              color: entry.type === "obstacle" ? "var(--terminal-orange)" :
                     entry.type === "swap" ? "var(--terminal-cyan)" : "var(--text-muted)",
            }}>
              [{new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}] {entry.message}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectorTeamCard({ team }: { team: TeamInfo }) {
  const hasObstacles = team.activeObstacles.length > 0;
  const worstSeverity = hasObstacles
    ? (["critical", "high", "medium", "low"] as const).find((s) =>
        team.activeObstacles.some((o) => o.obstacle.severity === s)
      ) ?? "low"
    : null;

  return (
    <div
      style={{
        border: `1px solid ${hasObstacles && worstSeverity ? SEVERITY_BORDER[worstSeverity] : "var(--border-color)"}`,
        background: hasObstacles && worstSeverity ? SEVERITY_BG[worstSeverity] : "var(--bg-card)",
        padding: "1rem",
        position: "relative",
        boxShadow: hasObstacles && worstSeverity ? `0 0 20px ${SEVERITY_BORDER[worstSeverity]}40` : undefined,
      }}
    >
      {/* Top bar */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, var(--terminal-cyan), transparent)` }} />

      {/* Team name */}
      <div style={{ color: "var(--terminal-cyan)", fontSize: "clamp(0.8rem, 1.5vw, 1.2rem)", marginBottom: "0.75rem", fontWeight: "bold" }}>
        {team.name}
        {team.isSolo && <span style={{ color: "var(--terminal-red)", fontSize: "0.7rem", marginLeft: "0.5rem" }}>SOLO</span>}
      </div>

      {/* Members */}
      {team.members.map((m) => (
        <div key={m.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
          <span style={{ color: "var(--terminal-green)", fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)" }}>&gt; {m.name}</span>
          <VibeBar level={m.vibeLevel} size="sm" showLabel={false} />
        </div>
      ))}

      {/* Assignment */}
      {team.assignment && (
        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
          <div style={{ color: "var(--terminal-orange)", fontSize: "clamp(0.75rem, 1.3vw, 1rem)", marginBottom: "0.2rem" }}>
            📦 {team.assignment.project.name}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "clamp(0.6rem, 1vw, 0.75rem)", fontStyle: "italic", marginBottom: "0.3rem" }}>
            "{team.assignment.project.tagline}"
          </div>
          <div style={{ color: "var(--terminal-cyan)", fontSize: "clamp(0.6rem, 1vw, 0.75rem)", border: "1px solid var(--border-cyan)", display: "inline-block", padding: "0.1rem 0.4rem" }}>
            ⚙ {team.assignment.techStack.label}
          </div>
        </div>
      )}

      {/* Active obstacles */}
      {team.activeObstacles.map((oe) => (
        <div
          key={oe.id}
          style={{
            marginTop: "0.4rem",
            border: `1px solid ${SEVERITY_BORDER[oe.obstacle.severity]}`,
            padding: "0.2rem 0.4rem",
            fontSize: "clamp(0.6rem, 1vw, 0.75rem)",
            color: SEVERITY_BORDER[oe.obstacle.severity],
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <span className="blink">{oe.obstacle.icon}</span>
          {oe.obstacle.name}
        </div>
      ))}
    </div>
  );
}

function ProjectorObstacleAlert({ obstacle }: { obstacle: ObstacleEventInfo }) {
  const config = {
    low: { border: "var(--terminal-green)", glow: "rgba(0,255,0,0.5)", bg: "rgba(0,20,0,0.97)" },
    medium: { border: "var(--terminal-yellow)", glow: "rgba(255,255,0,0.5)", bg: "rgba(20,20,0,0.97)" },
    high: { border: "var(--terminal-orange)", glow: "rgba(255,136,0,0.5)", bg: "rgba(20,10,0,0.97)" },
    critical: { border: "var(--terminal-red)", glow: "rgba(255,0,0,0.5)", bg: "rgba(20,0,0,0.97)" },
  }[obstacle.obstacle.severity];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: config.bg }}>
      <MatrixRain opacity={0.2} />
      <div
        className="shake"
        style={{
          position: "relative",
          zIndex: 1,
          border: `3px solid ${config.border}`,
          boxShadow: `0 0 100px ${config.glow}, 0 0 200px ${config.glow}40, inset 0 0 80px ${config.glow}20`,
          padding: "4rem 6rem",
          textAlign: "center",
          maxWidth: "80vw",
        }}
      >
        <div style={{ fontSize: "clamp(5rem, 15vw, 10rem)", lineHeight: 1, marginBottom: "1rem" }}>
          {obstacle.obstacle.icon}
        </div>
        <div
          className="glitch-fast"
          style={{
            color: config.border,
            fontSize: "clamp(2rem, 6vw, 5rem)",
            fontWeight: "bold",
            letterSpacing: "0.15em",
            textShadow: `0 0 30px ${config.glow}, 0 0 60px ${config.glow}`,
            marginBottom: "1rem",
          }}
        >
          {obstacle.obstacle.name}
        </div>
        <div style={{ color: "#aaa", fontSize: "clamp(0.8rem, 2vw, 1.2rem)", lineHeight: 1.6, maxWidth: "60vw" }}>
          {obstacle.obstacle.description}
        </div>
        {obstacle.customNote && (
          <div style={{ color: config.border, fontSize: "1rem", marginTop: "1.5rem", border: `1px solid ${config.border}`, padding: "0.75rem" }}>
            ⚠ {obstacle.customNote}
          </div>
        )}
        <div style={{ color: "#333", fontSize: "0.8rem", marginTop: "2rem" }}>
          [{obstacle.obstacle.severity.toUpperCase()}] {obstacle.obstacle.durationMinutes > 0 ? `${obstacle.obstacle.durationMinutes} minutes` : "permanent"}
        </div>
      </div>
    </div>
  );
}

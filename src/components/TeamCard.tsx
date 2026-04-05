"use client";

import { VibeBar } from "./ui/VibeBar";
import { ObstacleBadge } from "./ObstacleBadge";
import type { TeamInfo } from "@/types";

interface TeamCardProps {
  team: TeamInfo;
  highlight?: boolean;
  compact?: boolean;
}

export function TeamCard({ team, highlight = false, compact = false }: TeamCardProps) {
  const difficultyColor =
    team.assignment?.project.difficulty === "hard" ? "var(--terminal-red)" :
    team.assignment?.project.difficulty === "medium" ? "var(--terminal-orange)" : "var(--terminal-green)";

  return (
    <div
      className={`terminal-card ${highlight ? "terminal-card-cyan" : ""}`}
      style={{
        boxShadow: highlight ? "0 0 20px rgba(0,255,255,0.15)" : undefined,
      }}
    >
      {/* Team header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <span style={{ color: "var(--terminal-cyan)", fontSize: compact ? "0.875rem" : "1rem", fontWeight: "bold" }}>
          {team.name}
          {team.isSolo && <span style={{ color: "var(--terminal-red)", marginLeft: "0.5rem", fontSize: "0.75rem" }}>⚠ SOLO</span>}
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          Σ={team.totalVibeLevel}
        </span>
      </div>

      {/* Members */}
      <div style={{ marginBottom: "0.75rem" }}>
        {team.members.map((m) => (
          <div key={m.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.1rem 0" }}>
            <span style={{ color: "var(--terminal-green)", fontSize: "0.8rem" }}>
              &gt; {m.name}
            </span>
            <VibeBar level={m.vibeLevel} size="sm" showLabel={false} />
          </div>
        ))}
      </div>

      {/* Assignment */}
      {team.assignment && (
        <>
          <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div style={{ color: "var(--terminal-orange)", fontSize: compact ? "0.8rem" : "0.9rem", marginBottom: "0.2rem" }}>
              📦 {team.assignment.project.name}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", fontStyle: "italic" }}>
              "{team.assignment.project.tagline}"
            </div>
            {!compact && (
              <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.25rem" }}>
                difficulty:{" "}
                <span style={{ color: difficultyColor }}>
                  {team.assignment.project.difficulty ?? "—"}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "inline-block", border: "1px solid var(--border-cyan)", padding: "0.15rem 0.5rem", fontSize: "0.75rem", color: "var(--terminal-cyan)" }}>
            ⚙ {team.assignment.techStack.label}
          </div>
        </>
      )}

      {/* Active obstacles */}
      {team.activeObstacles.length > 0 && (
        <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
          {team.activeObstacles.map((oe) => (
            <ObstacleBadge key={oe.id} obstacleEvent={oe} />
          ))}
        </div>
      )}
    </div>
  );
}

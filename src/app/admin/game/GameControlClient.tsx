"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { GlitchText } from "@/components/ui/GlitchText";
import { EventLogFeed } from "@/components/EventLogFeed";
import { useGameState } from "@/hooks/useGameState";
import type { GameState, ObstacleInfo } from "@/types";

interface Props {
  eventId: string;
  initialState: GameState;
  obstacles: ObstacleInfo[];
}

export function GameControlClient({ eventId, initialState, obstacles }: Props) {
  const router = useRouter();
  const { state, timerRemaining, refresh } = useGameState(eventId);
  const gameState = state ?? initialState;
  const phase = gameState.event.phase;

  const [loading, setLoading] = useState(false);
  const [selectedObstacle, setSelectedObstacle] = useState<string>("");
  const [obstacleTargets, setObstacleTargets] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [swapTeamA, setSwapTeamA] = useState("");
  const [swapTeamB, setSwapTeamB] = useState("");
  const [swapType, setSwapType] = useState<"project" | "stack">("project");

  async function action(url: string, body?: unknown) {
    setLoading(true);
    try {
      const res = await fetch(url, {
        method: body !== undefined ? "POST" : "POST",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Error");
      await refresh();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function adjustTimer(addSeconds: number) {
    setLoading(true);
    try {
      await fetch("/api/game/timer", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ addSeconds }),
      });
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deployObstacle() {
    if (!selectedObstacle) return alert("Select an obstacle");
    await action("/api/game/obstacle", {
      obstacleId: selectedObstacle,
      targetTeamIds: obstacleTargets,
      customNote: customNote || undefined,
    });
    setSelectedObstacle("");
    setObstacleTargets([]);
    setCustomNote("");
  }

  async function doSwap() {
    if (!swapTeamA || !swapTeamB || swapTeamA === swapTeamB) return alert("Select two different teams");
    await action("/api/game/swap", { teamAId: swapTeamA, teamBId: swapTeamB, type: swapType });
  }

  const obstacleMap = new Map(obstacles.map((o) => [o.id, o]));

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
        {/* LEFT: Phase Controls */}
        <div>
          {/* Status */}
          <div className="terminal-card terminal-card-orange" style={{ marginBottom: "1rem" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>// game status</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <span className={`phase-${phase}`} style={{ border: "1px solid", padding: "0.2rem 0.6rem", textTransform: "uppercase" }}>
                {phase}
              </span>
              <CountdownTimer remainingSeconds={timerRemaining} phase={phase} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {phase === "registration" && (
                <button onClick={() => action("/api/game/start")} disabled={loading} className="terminal-btn terminal-btn-red" style={{ padding: "0.75rem" }}>
                  ▶ START HACKATHON
                </button>
              )}
              {phase === "active" && (
                <button onClick={() => action("/api/game/pause")} disabled={loading} className="terminal-btn terminal-btn-yellow">
                  ⏸ PAUSE
                </button>
              )}
              {phase === "paused" && (
                <button onClick={() => action("/api/game/resume")} disabled={loading} className="terminal-btn">
                  ▶ RESUME
                </button>
              )}
              {(phase === "active" || phase === "paused") && (
                <button onClick={() => { if (confirm("End the event?")) action("/api/game/end"); }} disabled={loading} className="terminal-btn terminal-btn-red">
                  ⏹ END EVENT
                </button>
              )}
              {(phase === "finished" || phase === "active" || phase === "paused") && (
                <button onClick={() => { if (confirm("Reset to registration? All teams will be deleted!")) action("/api/game/reset"); }} disabled={loading} className="terminal-btn" style={{ color: "#555", borderColor: "#333", fontSize: "0.75rem" }}>
                  ↺ RESET TO REGISTRATION
                </button>
              )}
            </div>
          </div>

          {/* Timer Adjust */}
          {(phase === "active" || phase === "paused") && (
            <div className="terminal-card" style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>// adjust timer</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                {[-600, -300, 300, 600, 1800, 3600].map((secs) => (
                  <button key={secs} onClick={() => adjustTimer(secs)} disabled={loading} className={`terminal-btn ${secs > 0 ? "" : "terminal-btn-red"}`} style={{ fontSize: "0.75rem" }}>
                    {secs > 0 ? "+" : ""}{secs / 60}m
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Teams Overview */}
          {gameState.teams.length > 0 && (
            <div className="terminal-card" style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
                // teams ({gameState.teams.length})
              </div>
              {gameState.teams.map((t) => (
                <div key={t.id} style={{ padding: "0.3rem 0", borderBottom: "1px solid #0a0a0a", fontSize: "0.8rem" }}>
                  <div style={{ color: "var(--terminal-cyan)" }}>{t.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>
                    {t.members.map(m => m.name).join(" + ")}
                  </div>
                  {t.assignment && (
                    <div style={{ color: "var(--terminal-orange)", fontSize: "0.7rem" }}>
                      📦 {t.assignment.project.name} • ⚙ {t.assignment.techStack.label}
                    </div>
                  )}
                  {t.activeObstacles.map((oe) => (
                    <span key={oe.id} style={{ color: "var(--terminal-red)", fontSize: "0.65rem", marginRight: "0.5rem" }}>
                      {oe.obstacle.icon}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Chaos Engine + Log */}
        <div>
          {/* Deploy Obstacle */}
          {phase === "active" && (
            <div className="terminal-card terminal-card-red" style={{ marginBottom: "1rem" }}>
              <GlitchText tag="div" className="glow-red" style={{ color: "var(--terminal-red)", fontSize: "0.85rem", marginBottom: "1rem" } as React.CSSProperties}>
                ⚡ CHAOS ENGINE
              </GlitchText>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", marginBottom: "0.75rem" }}>
                {obstacles.map((o) => {
                  const severityColors = { low: "var(--terminal-green)", medium: "var(--terminal-yellow)", high: "var(--terminal-orange)", critical: "var(--terminal-red)" };
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedObstacle(o.id)}
                      className="terminal-btn"
                      style={{
                        textAlign: "left",
                        fontSize: "0.75rem",
                        padding: "0.4rem 0.6rem",
                        background: selectedObstacle === o.id ? "rgba(255,0,0,0.1)" : "transparent",
                        borderColor: selectedObstacle === o.id ? "var(--terminal-red)" : "#2a1a1a",
                        color: severityColors[o.severity] || "var(--terminal-green)",
                      }}
                    >
                      {o.icon} {o.name}
                    </button>
                  );
                })}
              </div>

              {selectedObstacle && (
                <>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>
                    {obstacleMap.get(selectedObstacle)?.description}
                  </div>

                  {/* Target teams */}
                  <div style={{ margin: "0.75rem 0" }}>
                    <div className="terminal-label">Target (leave empty = all teams)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", marginTop: "0.25rem" }}>
                      {gameState.teams.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setObstacleTargets(prev =>
                            prev.includes(t.id) ? prev.filter(x => x !== t.id) : [...prev, t.id]
                          )}
                          className="terminal-btn"
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.2rem 0.5rem",
                            background: obstacleTargets.includes(t.id) ? "rgba(255,136,0,0.2)" : "transparent",
                            borderColor: obstacleTargets.includes(t.id) ? "var(--terminal-orange)" : "#2a2a2a",
                          }}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input
                    className="terminal-input"
                    placeholder="Custom note for teams (optional)"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    style={{ marginBottom: "0.5rem" }}
                  />

                  <button
                    onClick={deployObstacle}
                    disabled={loading}
                    className="terminal-btn terminal-btn-red"
                    style={{ width: "100%", padding: "0.6rem", fontSize: "0.9rem" }}
                  >
                    🚨 DEPLOY {obstacleMap.get(selectedObstacle)?.name}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Swap Controls */}
          {phase === "active" && gameState.teams.length >= 2 && (
            <div className="terminal-card terminal-card-cyan" style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--terminal-cyan)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>🔀 SWAP ASSIGNMENTS</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <div>
                  <div className="terminal-label">Team A</div>
                  <select className="terminal-select" value={swapTeamA} onChange={(e) => setSwapTeamA(e.target.value)}>
                    <option value="">-- select --</option>
                    {gameState.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <div className="terminal-label">Team B</div>
                  <select className="terminal-select" value={swapTeamB} onChange={(e) => setSwapTeamB(e.target.value)}>
                    <option value="">-- select --</option>
                    {gameState.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select className="terminal-select" value={swapType} onChange={(e) => setSwapType(e.target.value as "project" | "stack")} style={{ flex: 1 }}>
                  <option value="project">Swap Projects</option>
                  <option value="stack">Swap Stacks</option>
                </select>
                <button onClick={doSwap} disabled={loading} className="terminal-btn terminal-btn-cyan" style={{ whiteSpace: "nowrap" }}>
                  EXECUTE SWAP
                </button>
              </div>
            </div>
          )}

          {/* Event Log */}
          <div className="terminal-card">
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>// event log</div>
            <EventLogFeed entries={gameState.recentLog} height={300} />
          </div>
        </div>
      </div>
    </div>
  );
}

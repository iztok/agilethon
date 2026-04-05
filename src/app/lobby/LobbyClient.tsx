"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { VibeBar } from "@/components/ui/VibeBar";
import { BlinkCursor } from "@/components/ui/BlinkCursor";
import { GlitchText } from "@/components/ui/GlitchText";
import { useGameState } from "@/hooks/useGameState";
import { VIBE_LABELS } from "@/types";
import type { GameState } from "@/types";
import Image from "next/image";

interface Props {
  eventId: string;
  initialState: GameState;
  currentUserId: string;
  isAdmin: boolean;
  user: { id: string; name: string; email: string; image: string | null; vibeLevel: number; isAdmin: boolean };
}

export function LobbyClient({ eventId, initialState, currentUserId, isAdmin, user }: Props) {
  const router = useRouter();
  const { state, timerRemaining } = useGameState(eventId);
  const gameState = state ?? initialState;

  const [vibeLevel, setVibeLevel] = useState(user.vibeLevel);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Redirect when game starts
  useEffect(() => {
    if (gameState.event.phase !== "registration") {
      router.push("/dashboard");
    }
  }, [gameState.event.phase, router]);

  async function saveVibeLevel(level: number) {
    setVibeLevel(level);
    setSaving(true);
    setSaved(false);
    try {
      await fetch(`/api/users/${currentUserId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibeLevel: level }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function startEvent() {
    await fetch("/api/game/start", { method: "POST" });
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar user={{ name: user.name, email: user.email, isAdmin: user.isAdmin }} />

      <main style={{ flex: 1, maxWidth: "1000px", margin: "0 auto", padding: "2rem 1rem", width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <GlitchText tag="h1" className="glow-green" style={{ fontSize: "2rem", color: "var(--terminal-green)", margin: "0 0 0.5rem" } as React.CSSProperties}>
            REGISTRATION LOBBY
          </GlitchText>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            &gt; Awaiting operatives... <BlinkCursor />
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          {/* Left: Profile / Vibe Level */}
          <div>
            <div className="terminal-card" style={{ marginBottom: "1rem" }}>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                // operative profile
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                {user.image && (
                  <Image src={user.image} alt={user.name} width={40} height={40}
                    style={{ borderRadius: 0, border: "1px solid var(--border-color)", filter: "grayscale(0.5) sepia(0.3) hue-rotate(100deg)" }} />
                )}
                <div>
                  <div style={{ color: "var(--terminal-green)" }}>{user.name}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>{user.email}</div>
                  {user.isAdmin && (
                    <span style={{ color: "var(--terminal-orange)", fontSize: "0.7rem", border: "1px solid var(--terminal-orange)", padding: "0 0.3rem" }}>
                      GAME MASTER
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="terminal-label">Set Your Vibe Coding Level</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "0.5rem" }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <button
                      key={level}
                      onClick={() => saveVibeLevel(level)}
                      className="terminal-btn"
                      style={{
                        textAlign: "left",
                        padding: "0.4rem 0.75rem",
                        background: vibeLevel === level ? "rgba(0,255,0,0.1)" : "transparent",
                        borderColor: vibeLevel === level ? "var(--terminal-green)" : "var(--border-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.8rem" }}>
                        [{level}] {VIBE_LABELS[level]}
                      </span>
                      <VibeBar level={level} showLabel={false} size="sm" />
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: saving ? "var(--terminal-yellow)" : saved ? "var(--terminal-green)" : "transparent" }}>
                  {saving ? "// saving..." : saved ? "// saved ✓" : "."}
                </div>
              </div>
            </div>

            {/* Admin controls */}
            {isAdmin && (
              <div className="terminal-card terminal-card-red" style={{ marginBottom: "1rem" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
                  // game master controls
                </div>
                <button
                  onClick={startEvent}
                  className="terminal-btn terminal-btn-red"
                  style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
                >
                  ▶ START THE HACKATHON
                </button>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginTop: "0.5rem" }}>
                  This will form teams and assign projects. Registration will close.
                </div>
              </div>
            )}
          </div>

          {/* Right: Registered Operatives */}
          <div>
            <div className="terminal-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>// registered operatives</span>
                <span style={{ color: "var(--terminal-cyan)", fontSize: "1.5rem", fontWeight: "bold" }}>
                  {gameState.participants.length}
                  <span style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginLeft: "0.3rem" }}>players</span>
                </span>
              </div>

              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {gameState.participants.length === 0 && (
                  <div style={{ color: "var(--text-muted)", padding: "1rem 0", textAlign: "center" }}>
                    // no operatives yet <BlinkCursor />
                  </div>
                )}
                {gameState.participants.map((p, i) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "0.3rem 0",
                      borderBottom: "1px solid #0a0a0a",
                      color: p.id === currentUserId ? "var(--terminal-cyan)" : "var(--terminal-green)",
                    }}
                  >
                    <span style={{ fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--text-muted)", marginRight: "0.5rem" }}>{String(i + 1).padStart(2, "0")}.</span>
                      {p.name}
                      {p.id === currentUserId && <span style={{ color: "var(--terminal-cyan)", marginLeft: "0.3rem", fontSize: "0.7rem" }}>(you)</span>}
                      {p.isAdmin && !p.isOptedOut && <span style={{ color: "var(--terminal-orange)", marginLeft: "0.3rem", fontSize: "0.7rem" }}>★</span>}
                    </span>
                    <VibeBar level={p.vibeLevel} size="sm" showLabel={false} />
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.7rem", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                // {Math.ceil(gameState.participants.length / 2)} teams will be formed
                {gameState.participants.length % 2 !== 0 && " (1 solo)"}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

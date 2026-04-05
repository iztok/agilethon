"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { NavBar } from "@/components/NavBar";
import { VibeBar } from "@/components/ui/VibeBar";
import { CountdownTimer } from "@/components/ui/CountdownTimer";
import { BlinkCursor } from "@/components/ui/BlinkCursor";
import { GlitchText } from "@/components/ui/GlitchText";
import { ObstacleBadge } from "@/components/ObstacleBadge";
import { EventLogFeed } from "@/components/EventLogFeed";
import { ObstacleAlert } from "@/components/ObstacleAlert";
import { useGameState } from "@/hooks/useGameState";
import type { GameState, ObstacleEventInfo, TeamInfo } from "@/types";

interface Props {
  eventId: string;
  initialState: GameState;
  currentUserId: string;
  isAdmin: boolean;
  user: { id: string; name: string; email: string; isAdmin: boolean };
}

export function DashboardClient({ eventId, initialState, currentUserId, isAdmin, user }: Props) {
  const router = useRouter();
  const { state, loading, timerRemaining } = useGameState(eventId);
  const gameState = state ?? initialState;

  const [alertObstacle, setAlertObstacle] = useState<ObstacleEventInfo | null>(null);
  const [prevObstacleIds, setPrevObstacleIds] = useState<Set<string>>(new Set(initialState.activeObstacles.map(o => o.id)));

  // Find my team
  const myTeam: TeamInfo | undefined = gameState.teams.find((t) =>
    t.members.some((m) => m.userId === currentUserId)
  );

  // Show obstacle alert when new one arrives
  useEffect(() => {
    const currentIds = new Set(gameState.activeObstacles.map(o => o.id));
    for (const oe of gameState.activeObstacles) {
      if (!prevObstacleIds.has(oe.id)) {
        setAlertObstacle(oe);
        break;
      }
    }
    setPrevObstacleIds(currentIds);
  }, [gameState.activeObstacles]);

  useEffect(() => {
    if (gameState.event.phase === "registration") router.push("/lobby");
  }, [gameState.event.phase, router]);

  const phase = gameState.event.phase;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <NavBar user={user} />

      {/* Obstacle Alert Overlay */}
      {alertObstacle && (
        <ObstacleAlert obstacleEvent={alertObstacle} onDismiss={() => setAlertObstacle(null)} />
      )}

      <main style={{ flex: 1, maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem", width: "100%" }}>
        {/* Status Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>STATUS: </span>
            <span className={`phase-${phase}`} style={{ textTransform: "uppercase", fontSize: "0.9rem", border: "1px solid", padding: "0.1rem 0.5rem" }}>
              {phase}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>TIMER:</span>
            <CountdownTimer remainingSeconds={timerRemaining} phase={phase} />
          </div>
        </div>

        {/* FINISHED state */}
        {phase === "finished" && (
          <div className="terminal-card" style={{ textAlign: "center", padding: "3rem", marginBottom: "2rem" }}>
            <GlitchText tag="h1" className="glow-green" style={{ fontSize: "3rem", color: "var(--terminal-green)" } as React.CSSProperties}>
              HACKATHON COMPLETE
            </GlitchText>
            <p style={{ color: "var(--text-muted)" }}>Time's up! Prepare your demos.</p>
          </div>
        )}

        {/* My Team Section */}
        {myTeam ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
            {/* Team Info */}
            <div>
              <div className="terminal-card terminal-card-cyan" style={{ marginBottom: "1rem" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>// your team</div>
                <div style={{ color: "var(--terminal-cyan)", fontSize: "1.25rem", marginBottom: "0.75rem" }}>{myTeam.name}</div>
                {myTeam.members.map((m) => (
                  <div key={m.userId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.25rem 0" }}>
                    <span style={{ color: m.userId === currentUserId ? "var(--terminal-cyan)" : "var(--terminal-green)", fontSize: "0.85rem" }}>
                      &gt; {m.name}{m.userId === currentUserId ? " (you)" : ""}
                    </span>
                    <VibeBar level={m.vibeLevel} size="sm" />
                  </div>
                ))}
                {myTeam.isSolo && (
                  <div style={{ color: "var(--terminal-red)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                    ⚠ Solo team — Admin may assign a partner
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              {myTeam.assignment && (
                <div className="terminal-card">
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>// tech stack</div>
                  <div style={{ color: "var(--terminal-cyan)", fontSize: "0.9rem" }}>
                    ⚙ {myTeam.assignment.techStack.label}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                    FE: {myTeam.assignment.techStack.frontend}<br />
                    BE: {myTeam.assignment.techStack.backend}
                  </div>
                </div>
              )}
            </div>

            {/* Project Spec */}
            {myTeam.assignment && (
              <div className="terminal-card terminal-card-orange">
                <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>// project assignment</div>
                <div style={{ color: "var(--terminal-orange)", fontSize: "1.5rem", marginBottom: "0.25rem" }}>
                  {myTeam.assignment.project.name}
                </div>
                <div style={{ color: "var(--text-muted)", fontStyle: "italic", marginBottom: "1rem", fontSize: "0.85rem" }}>
                  "{myTeam.assignment.project.tagline}"
                </div>
                <div style={{ color: "var(--terminal-green)", lineHeight: 1.7, fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                  {myTeam.assignment.project.spec}
                </div>
                {myTeam.assignment.swapHistory && (myTeam.assignment.swapHistory as unknown[]).length > 0 && (
                  <div style={{ marginTop: "0.75rem", color: "var(--terminal-red)", fontSize: "0.7rem" }}>
                    ⚠ Assignment has been modified {(myTeam.assignment.swapHistory as unknown[]).length} time(s)
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          phase !== "registration" && (
            <div className="terminal-card" style={{ marginBottom: "1.5rem", textAlign: "center", padding: "2rem" }}>
              <div style={{ color: "var(--text-muted)" }}>
                // Team assignment pending... <BlinkCursor />
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: "0.5rem" }}>
                You may have been added after team formation. Contact the Game Master.
              </div>
            </div>
          )
        )}

        {/* My Active Obstacles */}
        {myTeam && myTeam.activeObstacles.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ color: "var(--terminal-red)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>
              // active obstacles ({myTeam.activeObstacles.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {myTeam.activeObstacles.map((oe) => (
                <ObstacleBadge key={oe.id} obstacleEvent={oe} showDescription />
              ))}
            </div>
          </div>
        )}

        {/* All Teams Overview */}
        {gameState.teams.length > 0 && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.75rem" }}>
              // all teams ({gameState.teams.length})
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
              {gameState.teams.filter(t => t.id !== myTeam?.id).map((team) => (
                <div key={team.id} className="terminal-card" style={{ fontSize: "0.8rem" }}>
                  <div style={{ color: "var(--terminal-cyan)", marginBottom: "0.3rem" }}>{team.name}</div>
                  {team.members.map((m) => (
                    <div key={m.userId} style={{ color: "var(--text-muted)" }}>· {m.name}</div>
                  ))}
                  {team.assignment && (
                    <div style={{ color: "var(--terminal-orange)", marginTop: "0.3rem", fontSize: "0.75rem" }}>
                      📦 {team.assignment.project.name}
                    </div>
                  )}
                  {team.activeObstacles.map((oe) => (
                    <div key={oe.id} style={{ color: "var(--terminal-red)", fontSize: "0.7rem" }}>
                      {oe.obstacle.icon} {oe.obstacle.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Log */}
        <div className="terminal-card">
          <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>// event log</div>
          <EventLogFeed entries={gameState.recentLog} />
        </div>
      </main>
    </div>
  );
}

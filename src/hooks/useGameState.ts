"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import type { GameState, TeamInfo, ObstacleEventInfo, EventLogEntry } from "@/types";

export function useGameState(eventId: string | null, isProjector = false) {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);

  const fetchState = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/game/state?eventId=${eventId}`);
      if (res.ok) {
        const data: GameState = await res.json();
        setState(data);
        updateTimer(data);
      }
    } catch (e) {
      console.error("Failed to fetch game state", e);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  function updateTimer(data: GameState) {
    const ev = data.event;
    if (ev.phase === "paused" && ev.timerPausedRemaining != null) {
      setTimerRemaining(ev.timerPausedRemaining);
    } else if (ev.phase === "active" && ev.timerStartedAt) {
      const elapsed = Math.floor((Date.now() - new Date(ev.timerStartedAt).getTime()) / 1000);
      setTimerRemaining(Math.max(0, ev.timerDurationSeconds - elapsed));
    } else {
      setTimerRemaining(ev.timerDurationSeconds);
    }
  }

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const handlers = {
    "state:full": (payload: unknown) => {
      const data = payload as GameState;
      setState(data);
      updateTimer(data);
    },
    "player:registered": (payload: unknown) => {
      const p = payload as GameState["participants"][0];
      setState((prev) => {
        if (!prev) return prev;
        const exists = prev.participants.some((u) => u.id === p.id);
        return {
          ...prev,
          participantCount: exists ? prev.participantCount : prev.participantCount + 1,
          participants: exists ? prev.participants : [...prev.participants, p],
        };
      });
    },
    "player:updated": (payload: unknown) => {
      const { userId, fields } = payload as { userId: string; fields: Partial<GameState["participants"][0]> };
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) =>
            p.id === userId ? { ...p, ...fields } : p
          ),
        };
      });
    },
    "game:started": (payload: unknown) => {
      const data = payload as GameState;
      setState(data);
      updateTimer(data);
    },
    "game:paused": (payload: unknown) => {
      const { remainingSeconds } = payload as { remainingSeconds: number };
      setTimerRemaining(remainingSeconds);
      setState((prev) => prev ? { ...prev, event: { ...prev.event, phase: "paused", timerPausedRemaining: remainingSeconds } } : prev);
    },
    "game:resumed": (payload: unknown) => {
      const { timerStartedAt, timerDurationSeconds } = payload as { timerStartedAt: string; timerDurationSeconds: number };
      setState((prev) => prev ? {
        ...prev,
        event: { ...prev.event, phase: "active", timerStartedAt, timerDurationSeconds, timerPausedRemaining: null },
      } : prev);
    },
    "game:finished": () => {
      setState((prev) => prev ? { ...prev, event: { ...prev.event, phase: "finished" } } : prev);
      setTimerRemaining(0);
    },
    "obstacle:triggered": (payload: unknown) => {
      const oe = payload as ObstacleEventInfo & { log: EventLogEntry };
      setState((prev) => {
        if (!prev) return prev;
        const updatedTeams = prev.teams.map((t) => {
          if (oe.targetTeamIds.length === 0 || oe.targetTeamIds.includes(t.id)) {
            return { ...t, activeObstacles: [...t.activeObstacles, oe] };
          }
          return t;
        });
        return {
          ...prev,
          teams: updatedTeams,
          activeObstacles: [...prev.activeObstacles, oe],
          recentLog: [oe.log, ...prev.recentLog].slice(0, 50),
        };
      });
    },
    "obstacle:resolved": (payload: unknown) => {
      const { obstacleEventId } = payload as { obstacleEventId: string };
      setState((prev) => {
        if (!prev) return prev;
        const updatedTeams = prev.teams.map((t) => ({
          ...t,
          activeObstacles: t.activeObstacles.filter((oe) => oe.id !== obstacleEventId),
        }));
        return {
          ...prev,
          teams: updatedTeams,
          activeObstacles: prev.activeObstacles.filter((oe) => oe.id !== obstacleEventId),
        };
      });
    },
    "assignment:swapped": (payload: unknown) => {
      const { teamAId, teamBId, type, teamA, teamB } = payload as {
        teamAId: string; teamBId: string; type: string;
        teamA: TeamInfo; teamB: TeamInfo;
      };
      setState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          teams: prev.teams.map((t) => {
            if (t.id === teamAId) return { ...t, assignment: teamA.assignment };
            if (t.id === teamBId) return { ...t, assignment: teamB.assignment };
            return t;
          }),
        };
      });
    },
    "timer:sync": (payload: unknown) => {
      const { remainingSeconds } = payload as { remainingSeconds: number };
      setTimerRemaining(remainingSeconds);
    },
  };

  useSocket(eventId, isProjector, handlers);

  return { state, loading, timerRemaining, refresh: fetchState };
}

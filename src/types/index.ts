export type Phase = "registration" | "active" | "paused" | "finished";
export type Severity = "low" | "medium" | "high" | "critical";
export type Difficulty = "easy" | "medium" | "hard";
export type LogType = "system" | "obstacle" | "swap" | "admin_action";
export type ObstacleStatus = "active" | "resolved" | "dismissed";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  vibeLevel: number;
  isAdmin: boolean;
  isOptedOut: boolean;
}

export interface TeamMemberInfo {
  userId: string;
  name: string;
  avatarUrl?: string | null;
  vibeLevel: number;
}

export interface ProjectInfo {
  id: string;
  name: string;
  tagline: string;
  spec: string;
  difficulty?: Difficulty | null;
}

export interface TechStackInfo {
  id: string;
  frontend: string;
  backend: string;
  label: string;
}

export interface ObstacleInfo {
  id: string;
  name: string;
  icon: string;
  description: string;
  severity: Severity;
  durationMinutes: number;
  isCustom: boolean;
}

export interface ObstacleEventInfo {
  id: string;
  obstacle: ObstacleInfo;
  targetTeamIds: string[];
  triggeredAt: string;
  expiresAt?: string | null;
  status: ObstacleStatus;
  customNote?: string | null;
}

export interface TeamInfo {
  id: string;
  name: string;
  totalVibeLevel: number;
  isSolo: boolean;
  members: TeamMemberInfo[];
  assignment?: {
    project: ProjectInfo;
    techStack: TechStackInfo;
    swapHistory: SwapHistoryEntry[];
  } | null;
  activeObstacles: ObstacleEventInfo[];
}

export interface SwapHistoryEntry {
  type: "project_swap" | "stack_swap";
  previousId: string;
  newId: string;
  swappedWithTeamId: string;
  timestamp: string;
}

export interface GameState {
  event: {
    id: string;
    phase: Phase;
    timerDurationSeconds: number;
    timerStartedAt?: string | null;
    timerPausedRemaining?: number | null;
    startedAt?: string | null;
    finishedAt?: string | null;
  };
  teams: TeamInfo[];
  participantCount: number;
  participants: UserSummary[];
  activeObstacles: ObstacleEventInfo[];
  recentLog: EventLogEntry[];
}

export interface EventLogEntry {
  id: string;
  message: string;
  type: LogType;
  timestamp: string;
  metadata?: Record<string, unknown> | null;
}

// Socket.io event types
export type SocketEventType =
  | "player:registered"
  | "player:updated"
  | "game:started"
  | "game:paused"
  | "game:resumed"
  | "game:finished"
  | "obstacle:triggered"
  | "obstacle:resolved"
  | "assignment:swapped"
  | "timer:sync"
  | "state:full";

export interface SocketEvent {
  type: SocketEventType;
  payload: unknown;
}

export const VIBE_LABELS: Record<number, string> = {
  1: "Vibe Padawan",
  2: "Vibe Apprentice",
  3: "Vibe Knight",
  4: "Vibe Master",
  5: "Vibe Overlord",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  low: "terminal-green",
  medium: "terminal-yellow",
  high: "terminal-orange",
  critical: "terminal-red",
};

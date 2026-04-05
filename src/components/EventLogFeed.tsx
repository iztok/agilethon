"use client";

import type { EventLogEntry } from "@/types";

interface EventLogFeedProps {
  entries: EventLogEntry[];
  height?: number;
}

export function EventLogFeed({ entries, height = 200 }: EventLogFeedProps) {
  return (
    <div className="event-log" style={{ height }}>
      {entries.map((entry) => (
        <div key={entry.id} className={`event-log-item type-${entry.type}`}>
          <span style={{ color: "var(--text-muted)", marginRight: "0.5rem" }}>
            [{new Date(entry.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}]
          </span>
          {entry.message}
        </div>
      ))}
      {entries.length === 0 && (
        <div style={{ color: "var(--text-muted)", padding: "0.5rem 0" }}>
          // no events yet
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VibeBar } from "@/components/ui/VibeBar";
import { VIBE_LABELS } from "@/types";
import type { User } from "@prisma/client";

export function PlayersClient({ users: initialUsers }: { users: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [saving, setSaving] = useState<string | null>(null);

  async function update(userId: string, field: string, value: unknown) {
    setSaving(userId + field);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
      }
    } finally {
      setSaving(null);
      router.refresh();
    }
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: "1rem" }}>
        // player roster — {users.length} operatives registered
      </div>

      <div className="terminal-card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
          padding: "0.5rem 0.75rem",
          borderBottom: "1px solid var(--border-color)",
          color: "var(--text-muted)",
          fontSize: "0.7rem",
          textTransform: "uppercase",
        }}>
          <div>Operative</div>
          <div>Vibe Level</div>
          <div>Set Level</div>
          <div>Admin</div>
          <div>Playing</div>
          <div style={{ textAlign: "right" }}>Status</div>
        </div>

        {users.map((user, i) => (
          <div
            key={user.id}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
              padding: "0.6rem 0.75rem",
              borderBottom: "1px solid #0a0a0a",
              alignItems: "center",
              background: i % 2 === 0 ? "#000" : "#030303",
            }}
          >
            {/* Name + email */}
            <div>
              <div style={{ color: user.isAdmin ? "var(--terminal-orange)" : "var(--terminal-green)", fontSize: "0.85rem" }}>
                {user.isAdmin ? "★ " : ""}{user.name}
              </div>
              <div style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>{user.email}</div>
            </div>

            {/* Current vibe */}
            <div>
              <VibeBar level={user.vibeLevel} size="sm" />
            </div>

            {/* Set vibe */}
            <div>
              <select
                className="terminal-select"
                value={user.vibeLevel}
                onChange={(e) => update(user.id, "vibeLevel", parseInt(e.target.value))}
                style={{ fontSize: "0.75rem", padding: "0.2rem 0.4rem" }}
              >
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>{l} — {VIBE_LABELS[l]}</option>
                ))}
              </select>
            </div>

            {/* Admin toggle */}
            <div>
              <button
                onClick={() => update(user.id, "isAdmin", !user.isAdmin)}
                className="terminal-btn"
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.4rem",
                  borderColor: user.isAdmin ? "var(--terminal-orange)" : "#333",
                  color: user.isAdmin ? "var(--terminal-orange)" : "#555",
                }}
              >
                {user.isAdmin ? "ADMIN" : "user"}
              </button>
            </div>

            {/* Opted out toggle */}
            <div>
              <button
                onClick={() => update(user.id, "isOptedOut", !user.isOptedOut)}
                className="terminal-btn"
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.4rem",
                  borderColor: user.isOptedOut ? "var(--terminal-red)" : "var(--terminal-green)",
                  color: user.isOptedOut ? "var(--terminal-red)" : "var(--terminal-green)",
                }}
              >
                {user.isOptedOut ? "OPT-OUT" : "playing"}
              </button>
            </div>

            {/* Saving */}
            <div style={{ textAlign: "right", color: "var(--text-muted)", fontSize: "0.65rem" }}>
              {saving?.startsWith(user.id) ? "saving..." : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

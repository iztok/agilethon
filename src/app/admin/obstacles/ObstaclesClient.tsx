"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Obstacle } from "@prisma/client";

const SEVERITY_COLORS: Record<string, string> = {
  low: "var(--terminal-green)",
  medium: "var(--terminal-yellow)",
  high: "var(--terminal-orange)",
  critical: "var(--terminal-red)",
};

export function ObstaclesClient({ obstacles: initial }: { obstacles: Obstacle[] }) {
  const router = useRouter();
  const [obstacles, setObstacles] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "⚠️", description: "", severity: "medium", durationMinutes: 0 });

  async function create() {
    const res = await fetch("/api/obstacles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setObstacles((prev) => [data, ...prev]);
      setAdding(false);
      setForm({ name: "", icon: "⚠️", description: "", severity: "medium", durationMinutes: 0 });
      router.refresh();
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this obstacle?")) return;
    const res = await fetch(`/api/obstacles/${id}`, { method: "DELETE" });
    if (res.ok) setObstacles((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          // obstacle catalog — {obstacles.length} obstacles configured
        </div>
        <button onClick={() => setAdding(true)} className="terminal-btn terminal-btn-red">
          + CREATE CUSTOM OBSTACLE
        </button>
      </div>

      {adding && (
        <div className="terminal-card terminal-card-red" style={{ marginBottom: "1rem" }}>
          <div style={{ color: "var(--terminal-red)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>// new custom obstacle</div>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <div>
              <label className="terminal-label">Icon</label>
              <input className="terminal-input" value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} style={{ width: "4rem" }} />
            </div>
            <div>
              <label className="terminal-label">Name</label>
              <input className="terminal-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="CHAOS MODE" />
            </div>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <label className="terminal-label">Description</label>
            <textarea className="terminal-textarea" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="What must teams do?" rows={3} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <div>
              <label className="terminal-label">Severity</label>
              <select className="terminal-select" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="terminal-label">Duration (minutes, 0=permanent)</label>
              <input className="terminal-input" type="number" min="0" value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: parseInt(e.target.value) || 0 }))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={create} className="terminal-btn terminal-btn-red">SAVE OBSTACLE</button>
            <button onClick={() => setAdding(false)} className="terminal-btn" style={{ color: "#555", borderColor: "#333" }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "0.75rem" }}>
        {obstacles.map((o) => (
          <div key={o.id} className="terminal-card" style={{ borderColor: "#1a1a1a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem" }}>{o.icon}</span>
                <div>
                  <div style={{ color: SEVERITY_COLORS[o.severity], fontSize: "0.9rem", fontWeight: "bold" }}>{o.name}</div>
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.1rem" }}>
                    <span style={{ color: SEVERITY_COLORS[o.severity], fontSize: "0.65rem", border: `1px solid ${SEVERITY_COLORS[o.severity]}`, padding: "0 0.25rem" }}>
                      {o.severity}
                    </span>
                    {o.durationMinutes > 0 && (
                      <span style={{ color: "var(--text-muted)", fontSize: "0.65rem" }}>{o.durationMinutes}m</span>
                    )}
                    {o.isCustom && (
                      <span style={{ color: "var(--terminal-cyan)", fontSize: "0.65rem", border: "1px solid var(--border-cyan)", padding: "0 0.25rem" }}>CUSTOM</span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => del(o.id)} className="terminal-btn terminal-btn-red" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem" }}>DEL</button>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", lineHeight: 1.5 }}>
              {o.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

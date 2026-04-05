"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TechStack } from "@prisma/client";

export function StacksClient({ stacks: initial }: { stacks: TechStack[] }) {
  const router = useRouter();
  const [stacks, setStacks] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ frontend: "", backend: "" });
  const [adding, setAdding] = useState(false);

  async function save() {
    const url = editing && editing !== "new" ? `/api/stacks/${editing}` : "/api/stacks";
    const method = editing && editing !== "new" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      if (method === "POST") {
        setStacks((prev) => [...prev, data].sort((a, b) => a.label.localeCompare(b.label)));
      } else {
        setStacks((prev) => prev.map((s) => (s.id === editing ? data : s)));
      }
      setEditing(null);
      setAdding(false);
      router.refresh();
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this stack?")) return;
    const res = await fetch(`/api/stacks/${id}`, { method: "DELETE" });
    if (res.ok) setStacks((prev) => prev.filter((s) => s.id !== id));
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          // tech stacks — {stacks.length} configurations
        </div>
        <button onClick={() => { setAdding(true); setEditing("new"); setForm({ frontend: "", backend: "" }); }} className="terminal-btn terminal-btn-cyan">
          + ADD STACK
        </button>
      </div>

      {adding && editing === "new" && (
        <div className="terminal-card terminal-card-cyan" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <div>
              <label className="terminal-label">Frontend</label>
              <input className="terminal-input" value={form.frontend} onChange={(e) => setForm((f) => ({ ...f, frontend: e.target.value }))} placeholder="React" />
            </div>
            <div>
              <label className="terminal-label">Backend</label>
              <input className="terminal-input" value={form.backend} onChange={(e) => setForm((f) => ({ ...f, backend: e.target.value }))} placeholder="Node.js" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={save} className="terminal-btn terminal-btn-cyan">SAVE</button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="terminal-btn" style={{ color: "#555", borderColor: "#333" }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
        {stacks.map((s) => (
          <div key={s.id} className="terminal-card terminal-card-cyan">
            {editing === s.id ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <input className="terminal-input" value={form.frontend} onChange={(e) => setForm((f) => ({ ...f, frontend: e.target.value }))} placeholder="Frontend" />
                  <input className="terminal-input" value={form.backend} onChange={(e) => setForm((f) => ({ ...f, backend: e.target.value }))} placeholder="Backend" />
                </div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button onClick={save} className="terminal-btn terminal-btn-cyan" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>SAVE</button>
                  <button onClick={() => setEditing(null)} className="terminal-btn" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem", color: "#555", borderColor: "#333" }}>✕</button>
                </div>
              </>
            ) : (
              <>
                <div style={{ color: "var(--terminal-cyan)", fontSize: "1rem", marginBottom: "0.25rem" }}>{s.label}</div>
                <div style={{ color: "var(--text-muted)", fontSize: "0.7rem", marginBottom: "0.5rem" }}>
                  FE: {s.frontend} • BE: {s.backend}
                </div>
                <div style={{ display: "flex", gap: "0.3rem" }}>
                  <button onClick={() => { setEditing(s.id); setForm({ frontend: s.frontend, backend: s.backend }); }} className="terminal-btn" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>EDIT</button>
                  <button onClick={() => del(s.id)} className="terminal-btn terminal-btn-red" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>DEL</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

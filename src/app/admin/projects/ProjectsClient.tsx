"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@prisma/client";

type Difficulty = "easy" | "medium" | "hard";

const DIFF_COLORS: Record<string, string> = {
  easy: "var(--terminal-green)",
  medium: "var(--terminal-orange)",
  hard: "var(--terminal-red)",
};

export function ProjectsClient({ projects: initial }: { projects: Project[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", tagline: "", spec: "", difficulty: "medium" as Difficulty });
  const [adding, setAdding] = useState(false);

  function startEdit(p: Project) {
    setEditing(p.id);
    setForm({ name: p.name, tagline: p.tagline, spec: p.spec, difficulty: (p.difficulty as Difficulty) || "medium" });
  }

  async function save() {
    const url = editing && editing !== "new" ? `/api/projects/${editing}` : "/api/projects";
    const method = editing && editing !== "new" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      if (method === "POST") {
        setProjects((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      } else {
        setProjects((prev) => prev.map((p) => (p.id === editing ? data : p)));
      }
      setEditing(null);
      setAdding(false);
      router.refresh();
    }
  }

  async function del(id: string, name: string) {
    if (!confirm(`Delete "${name}"?`)) return;
    const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          // project catalog — {projects.length} projects loaded
        </div>
        <button onClick={() => { setAdding(true); setEditing("new"); setForm({ name: "", tagline: "", spec: "", difficulty: "medium" }); }} className="terminal-btn">
          + ADD PROJECT
        </button>
      </div>

      {/* Add form */}
      {adding && editing === "new" && (
        <div className="terminal-card terminal-card-cyan" style={{ marginBottom: "1rem" }}>
          <div style={{ color: "var(--terminal-cyan)", fontSize: "0.85rem", marginBottom: "0.75rem" }}>// new project</div>
          <EditForm form={form} setForm={setForm} />
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button onClick={save} className="terminal-btn terminal-btn-cyan">SAVE</button>
            <button onClick={() => { setAdding(false); setEditing(null); }} className="terminal-btn" style={{ color: "#555", borderColor: "#333" }}>CANCEL</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {projects.map((p) => (
          <div key={p.id} className="terminal-card terminal-card-orange">
            {editing === p.id ? (
              <>
                <EditForm form={form} setForm={setForm} />
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
                  <button onClick={save} className="terminal-btn terminal-btn-orange">SAVE</button>
                  <button onClick={() => setEditing(null)} className="terminal-btn" style={{ color: "#555", borderColor: "#333" }}>CANCEL</button>
                </div>
              </>
            ) : (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
                    <span style={{ color: "var(--terminal-orange)", fontSize: "1rem" }}>{p.name}</span>
                    {p.difficulty && (
                      <span style={{ color: DIFF_COLORS[p.difficulty], fontSize: "0.7rem", border: `1px solid ${DIFF_COLORS[p.difficulty]}`, padding: "0 0.3rem" }}>
                        {p.difficulty}
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                    "{p.tagline}"
                  </div>
                  <div style={{ color: "var(--terminal-green)", fontSize: "0.75rem", lineHeight: 1.6 }}>
                    {p.spec.substring(0, 200)}{p.spec.length > 200 ? "..." : ""}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.4rem", marginLeft: "1rem", flexShrink: 0 }}>
                  <button onClick={() => startEdit(p)} className="terminal-btn" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>EDIT</button>
                  <button onClick={() => del(p.id, p.name)} className="terminal-btn terminal-btn-red" style={{ fontSize: "0.75rem", padding: "0.2rem 0.5rem" }}>DEL</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function EditForm({ form, setForm }: {
  form: { name: string; tagline: string; spec: string; difficulty: string };
  setForm: React.Dispatch<React.SetStateAction<{ name: string; tagline: string; spec: string; difficulty: "easy" | "medium" | "hard" }>>;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div>
        <label className="terminal-label">Project Name</label>
        <input className="terminal-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="NeuroTask" />
      </div>
      <div>
        <label className="terminal-label">Tagline</label>
        <input className="terminal-input" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Your tagline here" />
      </div>
      <div>
        <label className="terminal-label">Spec</label>
        <textarea className="terminal-textarea" value={form.spec} onChange={(e) => setForm((f) => ({ ...f, spec: e.target.value }))} placeholder="Describe the project..." rows={4} />
      </div>
      <div>
        <label className="terminal-label">Difficulty</label>
        <select className="terminal-select" value={form.difficulty} onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value as "easy" | "medium" | "hard" }))}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
}

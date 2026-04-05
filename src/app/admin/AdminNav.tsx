"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

const TABS = [
  { href: "/admin/game", label: "⚡ Game Control" },
  { href: "/admin/players", label: "👤 Players" },
  { href: "/admin/projects", label: "📦 Projects" },
  { href: "/admin/stacks", label: "⚙ Stacks" },
  { href: "/admin/obstacles", label: "🚨 Obstacles" },
];

export function AdminNav({ user }: { user: { name?: string | null; email?: string | null; isAdmin?: boolean } }) {
  const pathname = usePathname();
  const { signOut } = useClerk();

  return (
    <nav style={{ background: "#000", borderBottom: "2px solid var(--terminal-orange)", fontFamily: "monospace" }}>
      {/* Top bar */}
      <div style={{ padding: "0.4rem 1rem", borderBottom: "1px solid #1a1a0a", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
        <div>
          <span style={{ color: "var(--terminal-orange)" }}>★ GAME MASTER CONSOLE</span>
          <span style={{ color: "var(--text-muted)", marginLeft: "1rem" }}>
            {user.email?.split("@")[0]}@agilethon:~$
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.7rem" }}>→ player view</Link>
          <Link href="/projector" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.7rem" }}>→ projector</Link>
          <button
            onClick={() => signOut({ redirectUrl: "/login" })}
            style={{ background: "transparent", border: "1px solid #333", color: "#555", cursor: "pointer", padding: "0.1rem 0.4rem", fontSize: "0.7rem", fontFamily: "inherit" }}
          >
            logout
          </button>
        </div>
      </div>

      {/* Tab row */}
      <div style={{ display: "flex", padding: "0 0.5rem", overflow: "auto" }}>
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                padding: "0.6rem 1rem",
                color: active ? "var(--terminal-orange)" : "var(--text-muted)",
                textDecoration: "none",
                fontSize: "0.8rem",
                borderBottom: active ? "2px solid var(--terminal-orange)" : "2px solid transparent",
                whiteSpace: "nowrap",
                transition: "color 0.15s",
              }}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

interface NavBarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    isAdmin?: boolean;
  };
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const username = user?.email?.split("@")[0] ?? "guest";

  return (
    <nav
      style={{
        background: "#000",
        borderBottom: "1px solid var(--border-color)",
        padding: "0.5rem 1rem",
        fontFamily: "monospace",
        fontSize: "0.8rem",
      }}
    >
      <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
        {/* Prompt */}
        <Link href="/dashboard" style={{ color: "var(--terminal-green)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <span style={{ color: "var(--text-muted)" }}>root@</span>
          <span style={{ color: "var(--terminal-green)" }}>agilethon</span>
          <span style={{ color: "var(--text-muted)" }}>:~$ </span>
          <span style={{ color: "var(--terminal-cyan)" }}>{username}</span>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Nav links */}
        <NavLink href="/dashboard" active={pathname === "/dashboard"}>./dashboard</NavLink>
        <NavLink href="/projector" active={pathname.startsWith("/projector")}>./projector</NavLink>
        {user?.isAdmin && (
          <NavLink href="/admin/game" active={pathname.startsWith("/admin")}>
            <span style={{ color: "var(--terminal-orange)" }}>[ADMIN]</span>
          </NavLink>
        )}

        <button
          onClick={() => signOut({ redirectUrl: "/login" })}
          className="terminal-btn"
          style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}
        >
          logout
        </button>
      </div>
    </nav>
  );
}

function NavLink({ href, children, active }: { href: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      href={href}
      style={{
        color: active ? "var(--terminal-green)" : "var(--text-muted)",
        textDecoration: "none",
        padding: "0.1rem 0.3rem",
        borderBottom: active ? "1px solid var(--terminal-green)" : "none",
      }}
    >
      {children}
    </Link>
  );
}

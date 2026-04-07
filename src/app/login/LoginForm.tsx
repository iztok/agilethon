"use client";

import { useSignIn } from "@clerk/nextjs";
import { MatrixRain } from "@/components/MatrixRain";
import { BlinkCursor } from "@/components/ui/BlinkCursor";
import { GlitchText } from "@/components/ui/GlitchText";
import Link from "next/link";

const ASCII_LOGO = `
 ▄▄▄·  ▄▄ • ▪  ▄▄▌  ▄▄▄ .▄▄▄▄▄▄ .▄▄▄  ▄▄▄ .
▐█ ▀█ ▐█ ▀ ▪██ ██•  ▀▄.▀·•██  ▀▄.▀·▀▄ █·▀▄.▀·
▄█▀▀█ ▄█ ▀█▄▐█·██ ▪ ▐▀▀▪▄ ▐█.▪▐▀▀▪▄▐▀▀▄ ▐▀▀▪▄
▐█ ▪▐▌▐█▄▪▐█▐█▌▐█▌ ▄▐█▄▄▌ ▐█▌·▐█▄▄▌▐█•█▌▐█▄▄▌
 ▀  ▀ ·▀▀▀▀ ▀▀▀.▀▀▀  ▀▀▀  ▀▀▀  ▀▀▀ .▀  ▀ ▀▀▀
`;

export function LoginForm({ error }: { error?: string }) {
  const { isLoaded, signIn } = useSignIn();

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };

  return (
    <>
      <MatrixRain opacity={0.4} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: "480px", width: "100%", padding: "1rem" }}>
        {/* ASCII Logo */}
        <pre style={{
          color: "var(--terminal-green)",
          fontSize: "clamp(0.35rem, 1.2vw, 0.6rem)",
          lineHeight: 1.3,
          marginBottom: "1rem",
          textShadow: "0 0 10px rgba(0,255,0,0.7)",
          whiteSpace: "pre",
          overflow: "hidden",
        }}>
          {ASCII_LOGO}
        </pre>

        <div style={{ marginBottom: "0.5rem" }}>
          <GlitchText tag="h1" className="text-terminal-green glow-green" style={{ fontSize: "1.5rem", margin: 0 } as React.CSSProperties}>
            HACKATHON GAME MASTER
          </GlitchText>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "2rem" }}>
          AgileDrop Internal // Pair Vibe Coding Tournament <BlinkCursor />
        </p>

        <div className="terminal-card" style={{ padding: "1.5rem", textAlign: "left" }}>
          <div style={{ marginBottom: "1rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            <div>&gt; initiating secure authentication protocol...</div>
            <div>&gt; domain restriction: @agiledrop.com only</div>
            <div>&gt; awaiting operative credentials... <BlinkCursor /></div>
          </div>

          {error && (
            <div style={{
              border: "1px solid var(--terminal-red)",
              background: "#110000",
              color: "var(--terminal-red)",
              padding: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.75rem",
            }}>
              ⚠ ACCESS DENIED: {error === "AccessDenied" ? "Invalid domain — @agiledrop.com credentials required" : error}
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            className="terminal-btn terminal-btn-cyan"
            style={{ width: "100%", padding: "0.75rem", fontSize: "0.9rem" }}
          >
            [ AUTHENTICATE WITH GOOGLE ]
          </button>
        </div>

        <div style={{ marginTop: "1.5rem", fontSize: "0.7rem", color: "var(--text-muted)" }}>
          <Link
            href="/projector"
            style={{ color: "var(--terminal-dim)", textDecoration: "none" }}
          >
            → enter projector mode (no auth required)
          </Link>
        </div>

        <div style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "var(--text-muted)", opacity: 0.5 }}>
          v1.0.0 // AgileDrop Engineering // {new Date().getFullYear()}
        </div>
      </div>
    </>
  );
}

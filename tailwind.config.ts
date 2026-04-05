import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: "#00ff00",
          cyan: "#00ffff",
          orange: "#ff8800",
          red: "#ff0000",
          yellow: "#ffff00",
          dim: "#004400",
          bg: "#000000",
          card: "#0a0a0a",
          border: "#1a3a1a",
        },
      },
      fontFamily: {
        mono: ["'Share Tech Mono'", "'Fira Code'", "'Courier New'", "monospace"],
      },
      animation: {
        glitch: "glitch 2s infinite",
        blink: "blink 1s step-end infinite",
        scanline: "scanline 8s linear infinite",
        "matrix-fall": "matrix-fall 2s linear infinite",
        "shake": "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
        "flash-red": "flash-red 0.3s ease-in-out",
      },
      keyframes: {
        glitch: {
          "0%, 100%": { textShadow: "2px 0 #ff0000, -2px 0 #00ffff" },
          "25%": { textShadow: "-2px 0 #ff0000, 2px 0 #00ffff", transform: "translateX(2px)" },
          "50%": { textShadow: "2px 0 #ff0000, -2px 0 #00ffff", transform: "translateX(-2px)" },
          "75%": { textShadow: "-2px 0 #ff0000, 2px 0 #00ffff", transform: "translateX(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        shake: {
          "10%, 90%": { transform: "translate3d(-2px, 0, 0)" },
          "20%, 80%": { transform: "translate3d(4px, 0, 0)" },
          "30%, 50%, 70%": { transform: "translate3d(-8px, 0, 0)" },
          "40%, 60%": { transform: "translate3d(8px, 0, 0)" },
        },
        "flash-red": {
          "0%, 100%": { backgroundColor: "transparent" },
          "50%": { backgroundColor: "rgba(255,0,0,0.3)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

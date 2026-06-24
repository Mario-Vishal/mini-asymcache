import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#061226",
        panel: "#10182d",
        panelSoft: "#17233f",
        glow: "#4e93ff",
        mint: "#55f6d9",
        amber: "#ffbf5f",
        slateText: "#d9e2f2"
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        glow: "0 16px 40px rgba(14, 165, 233, 0.2)"
      }
    }
  },
  plugins: []
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#080808",
        foreground: "#f5f3ef",
        card: "#121212",
        muted: "#1c1c1c",
        border: "rgba(255,255,255,0.08)",
        gold: {
          DEFAULT: "#d4a85f",
          light: "#f1d7a4",
          dark: "#8d6530"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"]
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(212,168,95,0.28), transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
        mesh:
          "radial-gradient(circle at 20% 20%, rgba(212,168,95,0.18), transparent 24%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 28%), radial-gradient(circle at 50% 80%, rgba(212,168,95,0.12), transparent 22%)"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(212,168,95,0.18)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

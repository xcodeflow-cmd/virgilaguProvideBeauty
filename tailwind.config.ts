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
        background: "#050505",
        foreground: "#f3f4f6",
        card: "#101214",
        muted: "#15181c",
        border: "rgba(255,255,255,0.08)",
        accent: {
          DEFAULT: "#d7dbe2",
          soft: "#aeb6c2",
          dark: "#7e8794"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"]
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top, rgba(215,219,226,0.16), transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0))",
        mesh:
          "radial-gradient(circle at 20% 20%, rgba(125,132,145,0.18), transparent 24%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.1), transparent 28%), radial-gradient(circle at 50% 80%, rgba(190,198,209,0.12), transparent 22%)"
      },
      boxShadow: {
        glow: "0 20px 60px rgba(160,171,186,0.18)",
        panel: "0 24px 80px rgba(0,0,0,0.38)"
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

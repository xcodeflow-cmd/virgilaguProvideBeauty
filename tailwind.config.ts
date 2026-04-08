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
        background: "#090909",
        foreground: "#f6f1e8",
        card: "#101010",
        muted: "#151515",
        border: "rgba(255,255,255,0.08)",
        accent: {
          DEFAULT: "#c9a56c",
          soft: "#e8d8bf",
          dark: "#86633a"
        }
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "sans-serif"],
        display: ["var(--font-cormorant)", "serif"]
      },
      backgroundImage: {
        canvas:
          "linear-gradient(180deg, #050505 0%, #090909 22%, #080808 100%)",
        "hero-glow":
          "radial-gradient(circle at top, rgba(201,165,108,0.18), transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0))",
        mesh:
          "radial-gradient(circle at 18% 12%, rgba(201,165,108,0.14), transparent 24%), radial-gradient(circle at 84% 0%, rgba(125,125,125,0.07), transparent 28%), radial-gradient(circle at 55% 82%, rgba(255,255,255,0.05), transparent 22%)"
      },
      boxShadow: {
        glow: "0 18px 50px rgba(201,165,108,0.2)",
        panel: "0 28px 90px rgba(0,0,0,0.5)",
        luxury: "0 32px 120px rgba(0,0,0,0.62)"
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

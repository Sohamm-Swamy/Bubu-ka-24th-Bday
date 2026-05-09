import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFF0F3",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#C9184A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FF4D6D",
          foreground: "#FFFFFF",
        },
        text: {
          primary: "#2D0A14",
          secondary: "#6B2737",
        },
        gold: "#FFB800",
        success: "#4CAF50",
        muted: "#FFCCD5",
      },
      fontFamily: {
        sans: ["var(--font-nunito)", "sans-serif"],
      },
      backgroundImage: {
        "gradient-pink": "linear-gradient(to bottom, #FFF0F3, #FFE4E9)",
      },
      animation: {
        "bounce-slow": "bounce 2s infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 3s ease-in-out infinite",
        "confetti": "confetti 3s ease-out forwards",
        "heartbeat": "heartbeat 1.5s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(-100vh) rotate(720deg)", opacity: "0" },
        },
        heartbeat: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      colors: {
        canvas: "#0f141a",
        panel: "#171e26",
        panel2: "#202a35",
        card: "#111820",
        ink: "#f5f7fa",
        muted: "#9aa7b4",
        line: "#2c3947",
        accent: "#d4a24c",
        danger: "#d85d5d",
        warn: "#e0b45a",
        ok: "#5fb67a",
        info: "#5e91d7",
      },
      boxShadow: {
        card: "0 6px 18px rgba(0,0,0,.15)",
        dialog: "0 24px 80px rgba(0,0,0,.5)",
      },
    },
  },
  plugins: [],
};
export default config;
